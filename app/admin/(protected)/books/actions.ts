'use server'

import { and, eq, inArray, ne } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { books, bookSections, bookSectionItems } from '@/db/schema'
import { requireAdmin } from '@/lib/admin'
import { getStorageConfig } from '@/lib/storage'
import { slugify } from '@/lib/utils'

function withError(path: string, message: string): never {
	redirect(`${path}?error=${encodeURIComponent(message)}`)
}

function text(formData: FormData, name: string): string {
	const value = formData.get(name)
	return typeof value === 'string' ? value.trim() : ''
}

function optional(formData: FormData, name: string): string | null {
	return text(formData, name) || null
}

// Absolute http(s) URL, or an error redirect to `path`.
function contentUrl(formData: FormData, path: string): string {
	const value = text(formData, 'url')
	let parsed: URL | null = null
	try {
		parsed = new URL(value)
	} catch {
		parsed = null
	}
	if (
		!parsed ||
		(parsed.protocol !== 'http:' && parsed.protocol !== 'https:')
	) {
		withError(path, 'URL must be an absolute http(s) URL')
	}
	return value
}

// Empty means no image; anything else must live on the R2 public host.
function imageUrl(
	formData: FormData,
	name: string,
	path: string,
): string | null {
	const value = optional(formData, name)
	if (value !== null && !value.startsWith(`${getStorageConfig().publicUrl}/`)) {
		withError(path, 'Image URL must point at the media bucket')
	}
	return value
}

function keywords(formData: FormData): string[] {
	return text(formData, 'keywords')
		.split(',')
		.map((keyword) => keyword.trim())
		.filter(Boolean)
}

function position(raw: string, path: string, label: string): number {
	if (!/^\d+$/.test(raw)) {
		withError(path, `${label}: position must be a non-negative whole number`)
	}
	const value = Number(raw)
	if (!Number.isSafeInteger(value)) {
		withError(path, `${label}: position is too large`)
	}
	return value
}

function isUniqueViolation(error: unknown): boolean {
	const code = (error as { code?: unknown })?.code
	const causeCode = (error as { cause?: { code?: unknown } })?.cause?.code
	return code === '23505' || causeCode === '23505'
}

function revalidate() {
	revalidatePath('/bookshelf')
	revalidatePath('/')
	revalidatePath('/admin/books')
}

async function slugTaken(slug: string, exceptId?: number): Promise<boolean> {
	const [row] = await db
		.select({ id: books.id })
		.from(books)
		.where(
			exceptId === undefined
				? eq(books.slug, slug)
				: and(eq(books.slug, slug), ne(books.id, exceptId)),
		)
		.limit(1)
	return Boolean(row)
}

export async function createBook(formData: FormData) {
	await requireAdmin()

	const path = '/admin/books/new'
	const title = text(formData, 'title')
	if (!title) withError(path, 'Title is required')
	const url = contentUrl(formData, path)
	const slug = slugify(title)
	if (!slug) withError(path, 'Title must produce a non-empty slug')
	const duplicateMessage = `A book with slug "${slug}" already exists`
	if (await slugTaken(slug)) withError(path, duplicateMessage)

	const values = {
		slug,
		title,
		url,
		author: optional(formData, 'author'),
		coverUrl: imageUrl(formData, 'coverUrl', path),
		keywords: keywords(formData),
	}

	let id: number | undefined
	try {
		const [row] = await db
			.insert(books)
			.values(values)
			.returning({ id: books.id })
		id = row.id
	} catch (error) {
		if (!isUniqueViolation(error)) throw error
	}
	if (id === undefined) withError(path, duplicateMessage)

	revalidate()
	redirect(`/admin/books/${id}`)
}

export async function updateBook(id: number, formData: FormData) {
	await requireAdmin()

	const path = `/admin/books/${id}`
	if (!Number.isSafeInteger(id) || id <= 0)
		withError('/admin/books', 'Invalid book id')
	const title = text(formData, 'title')
	if (!title) withError(path, 'Title is required')
	const url = contentUrl(formData, path)
	const slug = slugify(text(formData, 'slug'))
	if (!slug) withError(path, 'Slug must not be empty')
	const duplicateMessage = `A book with slug "${slug}" already exists`
	if (await slugTaken(slug, id)) withError(path, duplicateMessage)

	const values = {
		slug,
		title,
		url,
		author: optional(formData, 'author'),
		coverUrl: imageUrl(formData, 'coverUrl', path),
		keywords: keywords(formData),
		updatedAt: new Date(),
	}

	let duplicate = false
	try {
		await db.update(books).set(values).where(eq(books.id, id))
	} catch (error) {
		if (!isUniqueViolation(error)) throw error
		duplicate = true
	}
	if (duplicate) withError(path, duplicateMessage)

	revalidate()
	redirect(`${path}?saved=1`)
}

export async function deleteBook(id: number) {
	await requireAdmin()

	if (!Number.isSafeInteger(id) || id <= 0)
		withError('/admin/books', 'Invalid book id')

	await db.delete(books).where(eq(books.id, id))

	revalidate()
	redirect('/admin/books')
}

// The sections editor posts every section at once: for each existing id a
// title, position and textarea of slugs (one per line), an optional remove
// checkbox, plus an optional new section. Any invalid input aborts the save.
export async function saveBookSections(formData: FormData) {
	await requireAdmin()

	const path = '/admin/books/sections'

	const ids: number[] = []
	for (const raw of formData.getAll('ids')) {
		if (typeof raw !== 'string' || !/^\d+$/.test(raw) || Number(raw) <= 0) {
			withError(path, `Malformed section id: ${String(raw)}`)
		}
		ids.push(Number(raw))
	}
	if (ids.length) {
		const existing = await db
			.select({ id: bookSections.id })
			.from(bookSections)
			.where(inArray(bookSections.id, ids))
		const known = new Set(existing.map((row) => row.id))
		const missing = ids.filter((id) => !known.has(id))
		if (missing.length) {
			withError(path, `Unknown section ids: ${missing.join(', ')}`)
		}
	}

	type Draft = { id?: number; title: string; position: number; slugs: string[] }
	const drafts: Draft[] = []
	const removeIds: number[] = []

	function parseSlugs(raw: string): string[] {
		const seen = new Set<string>()
		return raw
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter((line) => line && !seen.has(line) && seen.add(line))
	}

	for (const id of ids) {
		if (formData.get(`remove-${id}`)) {
			removeIds.push(id)
			continue
		}
		const title = text(formData, `title-${id}`)
		if (!title) withError(path, `Section ${id} needs a title`)
		drafts.push({
			id,
			title,
			position: position(text(formData, `position-${id}`), path, title),
			slugs: parseSlugs(text(formData, `slugs-${id}`)),
		})
	}

	const newTitle = text(formData, 'new-title')
	if (newTitle) {
		drafts.push({
			title: newTitle,
			position: position(text(formData, 'new-position'), path, newTitle),
			slugs: parseSlugs(text(formData, 'new-slugs')),
		})
	}

	const allSlugs = [...new Set(drafts.flatMap((draft) => draft.slugs))]
	const rows = allSlugs.length
		? await db
				.select({ id: books.id, slug: books.slug })
				.from(books)
				.where(inArray(books.slug, allSlugs))
		: []
	const idBySlug = new Map(rows.map((row) => [row.slug, row.id]))
	const unknown = allSlugs.filter((slug) => !idBySlug.has(slug))
	if (unknown.length) {
		withError(path, `Unknown book slugs: ${unknown.join(', ')}`)
	}

	await db.transaction(async (tx) => {
		if (removeIds.length) {
			await tx.delete(bookSections).where(inArray(bookSections.id, removeIds))
		}

		for (const draft of drafts) {
			let sectionId = draft.id
			if (sectionId === undefined) {
				const [row] = await tx
					.insert(bookSections)
					.values({ title: draft.title, position: draft.position })
					.returning({ id: bookSections.id })
				sectionId = row.id
			} else {
				await tx
					.update(bookSections)
					.set({
						title: draft.title,
						position: draft.position,
						updatedAt: new Date(),
					})
					.where(eq(bookSections.id, sectionId))
				await tx
					.delete(bookSectionItems)
					.where(eq(bookSectionItems.sectionId, sectionId))
			}

			if (draft.slugs.length) {
				await tx.insert(bookSectionItems).values(
					draft.slugs.map((slug, index) => ({
						sectionId,
						bookId: idBySlug.get(slug)!,
						position: index,
					})),
				)
			}
		}
	})

	revalidate()
	redirect(`${path}?saved=1`)
}
