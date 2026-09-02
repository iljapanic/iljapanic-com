import { and, eq, inArray, notExists, notInArray, sql } from 'drizzle-orm'
import type { PgColumn } from 'drizzle-orm/pg-core'
import { db } from '@/db'
import {
	readwiseBookTags,
	readwiseBooks,
	readwiseHighlightTags,
	readwiseHighlights,
	readwiseSyncRuns,
	readwiseTags,
	type NewReadwiseBookRow,
	type NewReadwiseHighlightRow,
} from '@/db/schema'
import {
	exportBooks,
	listBooks,
	normalizeTagName,
	tagLabel,
	type ReadwiseExportBook,
	type ReadwiseTag,
} from '@/lib/readwise'
import { slugify } from '@/lib/utils'

export interface SyncResult {
	runId: number
	bookCount: number
	highlightCount: number
	removedBookCount: number
	durationMs: number
}

type SyncTrigger = 'cron' | 'manual'

interface HighlightModel {
	row: Omit<NewReadwiseHighlightRow, 'bookId'>
	tags: string[]
}

interface BookModel {
	row: NewReadwiseBookRow
	tags: string[]
	highlights: HighlightModel[]
}

const SHARE_TAG = '@share'
const INSERT_CHUNK_SIZE = 500

function isShareTag(tag: ReadwiseTag): boolean {
	return tag.name.trim().toLowerCase() === SHARE_TAG
}

function normalizeTags(tags: ReadwiseTag[]): string[] {
	const names = tags
		.map((tag) => normalizeTagName(tag.name))
		.filter((name) => name !== '' && name !== SHARE_TAG)
	return Array.from(new Set(names))
}

function toDate(value: string | null | undefined): Date | null {
	return value ? new Date(value) : null
}

// Postgres `excluded.<column>` reference for upserts.
function excluded(column: PgColumn) {
	return sql.raw(`excluded."${column.name}"`)
}

function chunk<T>(items: T[], size: number): T[][] {
	const chunks: T[][] = []
	for (let i = 0; i < items.length; i += size) {
		chunks.push(items.slice(i, i + size))
	}
	return chunks
}

function buildBookModel(
	book: ReadwiseExportBook,
	readwiseUpdatedAt: string | null,
	slug: string,
): BookModel {
	const highlights = book.highlights
		.filter((highlight) => !highlight.is_deleted && !highlight.is_discard)
		.map<HighlightModel>((highlight) => ({
			row: {
				readwiseId: highlight.id,
				text: highlight.text,
				note: highlight.note || null,
				location: highlight.location ?? null,
				locationType: highlight.location_type || null,
				color: highlight.color || null,
				highlightedAt: toDate(highlight.highlighted_at),
				url: highlight.url || null,
				endLocation: highlight.end_location ?? null,
				externalId: highlight.external_id || null,
				readwiseUrl: highlight.readwise_url,
				isFavorite: highlight.is_favorite,
				readwiseCreatedAt: toDate(highlight.created_at),
				readwiseUpdatedAt: toDate(highlight.updated_at),
			},
			tags: normalizeTags(highlight.tags),
		}))

	const highlightTimes = highlights
		.map((highlight) => highlight.row.highlightedAt?.getTime())
		.filter((time): time is number => typeof time === 'number')
	const lastHighlightAt =
		highlightTimes.length > 0 ? new Date(Math.max(...highlightTimes)) : null

	return {
		row: {
			readwiseId: book.user_book_id,
			slug,
			title: book.title,
			author: book.author || null,
			readableTitle: book.readable_title || null,
			source: book.source,
			category: book.category,
			coverImageUrl: book.cover_image_url || null,
			sourceUrl: book.source_url || null,
			readwiseUrl: book.readwise_url,
			uniqueUrl: book.unique_url || null,
			documentNote: book.document_note || null,
			summary: book.summary || null,
			asin: book.asin || null,
			externalId: book.external_id || null,
			highlightCount: highlights.length,
			lastHighlightAt,
			readwiseUpdatedAt: toDate(readwiseUpdatedAt),
		},
		tags: normalizeTags(book.book_tags),
		highlights,
	}
}

async function reconcile(token: string) {
	const allBooks = await listBooks(token)
	const shared = allBooks.filter((book) => book.tags.some(isShareTag))
	const updatedById = new Map(shared.map((book) => [book.id, book.updated]))

	const exported =
		shared.length > 0
			? await exportBooks(
					token,
					shared.map((book) => book.id),
				)
			: []
	const liveBooks = exported.filter((book) => !book.is_deleted)

	// Slugs: existing rows keep theirs; new books get slugify(title), suffixed
	// with the Readwise id when that slug is already taken.
	const existing = await db
		.select({ readwiseId: readwiseBooks.readwiseId, slug: readwiseBooks.slug })
		.from(readwiseBooks)
	const existingSlugByReadwiseId = new Map(
		existing.map((row) => [row.readwiseId, row.slug]),
	)
	const takenSlugs = new Set(existing.map((row) => row.slug))

	const models: BookModel[] = liveBooks.map((book) => {
		let slug = existingSlugByReadwiseId.get(book.user_book_id)
		if (!slug) {
			const base =
				slugify(book.title).slice(0, 80).replace(/-+$/, '') ||
				`readwise-${book.user_book_id}`
			slug = takenSlugs.has(base) ? `${base}-${book.user_book_id}` : base
			takenSlugs.add(slug)
		}
		return buildBookModel(
			book,
			updatedById.get(book.user_book_id) ?? null,
			slug,
		)
	})

	const keptReadwiseIds = models.map((model) => model.row.readwiseId)
	const tagNames = Array.from(
		new Set(
			models.flatMap((model) => [
				...model.tags,
				...model.highlights.flatMap((highlight) => highlight.tags),
			]),
		),
	)

	return db.transaction(async (tx) => {
		// 1. Remove books that are no longer shared (cascades to highlights and tag links).
		const removed = await tx
			.delete(readwiseBooks)
			.where(
				keptReadwiseIds.length > 0
					? notInArray(readwiseBooks.readwiseId, keptReadwiseIds)
					: undefined,
			)
			.returning({ id: readwiseBooks.id })
		const removedBookCount = removed.length

		// 2. Upsert tags and resolve their ids.
		const tagIdByName = new Map<string, number>()
		if (tagNames.length > 0) {
			await tx
				.insert(readwiseTags)
				.values(tagNames.map((name) => ({ name, label: tagLabel(name) })))
				.onConflictDoUpdate({
					target: readwiseTags.name,
					set: { label: excluded(readwiseTags.label) },
				})
			const tagRows = await tx
				.select({ id: readwiseTags.id, name: readwiseTags.name })
				.from(readwiseTags)
				.where(inArray(readwiseTags.name, tagNames))
			for (const row of tagRows) {
				tagIdByName.set(row.name, row.id)
			}
		}

		// 3. Upsert books.
		const bookIdByReadwiseId = new Map<number, number>()
		if (models.length > 0) {
			const bookRows = await tx
				.insert(readwiseBooks)
				.values(models.map((model) => model.row))
				.onConflictDoUpdate({
					target: readwiseBooks.readwiseId,
					set: {
						title: excluded(readwiseBooks.title),
						author: excluded(readwiseBooks.author),
						readableTitle: excluded(readwiseBooks.readableTitle),
						source: excluded(readwiseBooks.source),
						category: excluded(readwiseBooks.category),
						coverImageUrl: excluded(readwiseBooks.coverImageUrl),
						sourceUrl: excluded(readwiseBooks.sourceUrl),
						readwiseUrl: excluded(readwiseBooks.readwiseUrl),
						uniqueUrl: excluded(readwiseBooks.uniqueUrl),
						documentNote: excluded(readwiseBooks.documentNote),
						summary: excluded(readwiseBooks.summary),
						asin: excluded(readwiseBooks.asin),
						externalId: excluded(readwiseBooks.externalId),
						highlightCount: excluded(readwiseBooks.highlightCount),
						lastHighlightAt: excluded(readwiseBooks.lastHighlightAt),
						readwiseUpdatedAt: excluded(readwiseBooks.readwiseUpdatedAt),
						syncedAt: sql`now()`,
					},
				})
				.returning({ id: readwiseBooks.id, readwiseId: readwiseBooks.readwiseId })
			for (const row of bookRows) {
				bookIdByReadwiseId.set(row.readwiseId, row.id)
			}
		}

		// 4. Upsert highlights, drop the ones Readwise no longer returns.
		const highlightValues: NewReadwiseHighlightRow[] = []
		const highlightTagsByReadwiseId = new Map<number, string[]>()
		for (const model of models) {
			const bookId = bookIdByReadwiseId.get(model.row.readwiseId)
			if (bookId === undefined) {
				throw new Error(`Book ${model.row.readwiseId} was not upserted`)
			}
			for (const highlight of model.highlights) {
				highlightValues.push({ ...highlight.row, bookId })
				highlightTagsByReadwiseId.set(highlight.row.readwiseId, highlight.tags)
			}
		}

		const highlightIdByReadwiseId = new Map<number, number>()
		for (const batch of chunk(highlightValues, INSERT_CHUNK_SIZE)) {
			const rows = await tx
				.insert(readwiseHighlights)
				.values(batch)
				.onConflictDoUpdate({
					target: readwiseHighlights.readwiseId,
					set: {
						bookId: excluded(readwiseHighlights.bookId),
						text: excluded(readwiseHighlights.text),
						note: excluded(readwiseHighlights.note),
						location: excluded(readwiseHighlights.location),
						locationType: excluded(readwiseHighlights.locationType),
						color: excluded(readwiseHighlights.color),
						highlightedAt: excluded(readwiseHighlights.highlightedAt),
						url: excluded(readwiseHighlights.url),
						endLocation: excluded(readwiseHighlights.endLocation),
						externalId: excluded(readwiseHighlights.externalId),
						readwiseUrl: excluded(readwiseHighlights.readwiseUrl),
						isFavorite: excluded(readwiseHighlights.isFavorite),
						readwiseCreatedAt: excluded(readwiseHighlights.readwiseCreatedAt),
						readwiseUpdatedAt: excluded(readwiseHighlights.readwiseUpdatedAt),
						syncedAt: sql`now()`,
					},
				})
				.returning({
					id: readwiseHighlights.id,
					readwiseId: readwiseHighlights.readwiseId,
				})
			for (const row of rows) {
				highlightIdByReadwiseId.set(row.readwiseId, row.id)
			}
		}

		// Every remaining highlight belongs to a kept book, so anything not in
		// the incoming set is stale.
		const incomingHighlightIds = Array.from(highlightIdByReadwiseId.keys())
		await tx
			.delete(readwiseHighlights)
			.where(
				incomingHighlightIds.length > 0
					? notInArray(readwiseHighlights.readwiseId, incomingHighlightIds)
					: undefined,
			)

		// 5. Rebuild tag links for the kept books and their highlights.
		const bookIds = Array.from(bookIdByReadwiseId.values())
		if (bookIds.length > 0) {
			await tx
				.delete(readwiseBookTags)
				.where(inArray(readwiseBookTags.bookId, bookIds))
			const bookTagValues = models.flatMap((model) =>
				model.tags.map((name) => ({
					bookId: bookIdByReadwiseId.get(model.row.readwiseId)!,
					tagId: tagIdByName.get(name)!,
				})),
			)
			for (const batch of chunk(bookTagValues, INSERT_CHUNK_SIZE)) {
				await tx.insert(readwiseBookTags).values(batch)
			}
		}

		const highlightIds = Array.from(highlightIdByReadwiseId.values())
		if (highlightIds.length > 0) {
			await tx
				.delete(readwiseHighlightTags)
				.where(inArray(readwiseHighlightTags.highlightId, highlightIds))
			const highlightTagValues = Array.from(
				highlightTagsByReadwiseId.entries(),
			).flatMap(([readwiseId, tags]) =>
				tags.map((name) => ({
					highlightId: highlightIdByReadwiseId.get(readwiseId)!,
					tagId: tagIdByName.get(name)!,
				})),
			)
			for (const batch of chunk(highlightTagValues, INSERT_CHUNK_SIZE)) {
				await tx.insert(readwiseHighlightTags).values(batch)
			}
		}

		// 6. Drop tags nothing references any more.
		await tx
			.delete(readwiseTags)
			.where(
				and(
					notExists(
						tx
							.select({ one: sql`1` })
							.from(readwiseBookTags)
							.where(eq(readwiseBookTags.tagId, readwiseTags.id)),
					),
					notExists(
						tx
							.select({ one: sql`1` })
							.from(readwiseHighlightTags)
							.where(eq(readwiseHighlightTags.tagId, readwiseTags.id)),
					),
				),
			)

		return {
			bookCount: models.length,
			highlightCount: highlightValues.length,
			removedBookCount,
		}
	})
}

export async function runReadwiseSync(
	trigger: SyncTrigger,
): Promise<SyncResult> {
	const token = process.env.READWISE_ACCESS_TOKEN
	if (!token) {
		throw new Error('READWISE_ACCESS_TOKEN is not set')
	}

	const startedAt = Date.now()
	const [run] = await db
		.insert(readwiseSyncRuns)
		.values({ status: 'running', trigger })
		.returning({ id: readwiseSyncRuns.id })

	try {
		const counts = await reconcile(token)
		await db
			.update(readwiseSyncRuns)
			.set({
				status: 'success',
				finishedAt: new Date(),
				bookCount: counts.bookCount,
				highlightCount: counts.highlightCount,
				removedBookCount: counts.removedBookCount,
				message: `Synced ${counts.bookCount} books and ${counts.highlightCount} highlights, removed ${counts.removedBookCount} books`,
			})
			.where(eq(readwiseSyncRuns.id, run.id))

		return { runId: run.id, ...counts, durationMs: Date.now() - startedAt }
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		await db
			.update(readwiseSyncRuns)
			.set({ status: 'error', finishedAt: new Date(), message })
			.where(eq(readwiseSyncRuns.id, run.id))
		throw error
	}
}
