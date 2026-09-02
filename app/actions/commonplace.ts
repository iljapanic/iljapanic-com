'use server'

import {
	and,
	asc,
	count,
	countDistinct,
	desc,
	eq,
	exists,
	lt,
	notInArray,
	sql,
	type SQL,
} from 'drizzle-orm'
import { alias, type AnyPgColumn } from 'drizzle-orm/pg-core'
import { db } from '@/db'
import { readwiseBookTags, readwiseBooks, readwiseTags } from '@/db/schema'
import { normalizeTagName } from '@/lib/readwise'

export interface CommonplaceTag {
	name: string
	label: string
}

export interface CommonplaceHighlight {
	id: string
	text: string
	note?: string
	location?: number
	highlightedAt?: string
	tags: CommonplaceTag[]
}

export interface CommonplaceBook {
	id: string
	slug: string
	title: string
	author?: string
	readableTitle: string
	source: string
	category: string
	coverImageUrl?: string
	sourceUrl?: string
	readwiseUrl: string
	highlightCount: number
	lastHighlightAt?: string
	tags: CommonplaceTag[]
	highlights: CommonplaceHighlight[]
}

export interface CommonplacePagination {
	page: number
	pageSize: number
	totalCount: number
	totalPages: number
	hasNextPage: boolean
	hasPreviousPage: boolean
}

export interface CommonplaceData {
	data: CommonplaceBook[]
	pagination: CommonplacePagination
}

export interface TagWithCount {
	name: string
	displayName: string
	count: number
}

const PAGE_SIZE = 10

// Normalize incoming selected tags with the same rule as the sync, drop
// empties and dedupe.
function normalizeSelectedTags(selectedTags: string[]): string[] {
	const names = selectedTags
		.map(normalizeTagName)
		.filter((name) => name !== '')
	return Array.from(new Set(names))
}

// One EXISTS per selected tag, correlated on the given book id column, so a
// book matches only when it carries every selected tag (AND semantics).
function hasEveryTag(bookId: AnyPgColumn, tags: string[]): SQL[] {
	return tags.map((name) => {
		const bookTags = alias(readwiseBookTags, 'filter_book_tags')
		const tag = alias(readwiseTags, 'filter_tags')
		return exists(
			db
				.select({ one: sql`1` })
				.from(bookTags)
				.innerJoin(tag, eq(bookTags.tagId, tag.id))
				.where(and(eq(bookTags.bookId, bookId), eq(tag.name, name))),
		)
	})
}

const bookWith = {
	bookTags: { with: { tag: true } },
	highlights: {
		orderBy: (highlights: { highlightedAt: AnyPgColumn }) => [
			sql`${highlights.highlightedAt} desc nulls last`,
		],
		with: { highlightTags: { with: { tag: true } } },
	},
} as const

type BookWithRelations = NonNullable<
	Awaited<ReturnType<typeof db.query.readwiseBooks.findFirst<{ with: typeof bookWith }>>>
>

function toCommonplaceBook(book: BookWithRelations): CommonplaceBook {
	return {
		id: book.id.toString(),
		slug: book.slug,
		title: book.title,
		author: book.author ?? undefined,
		readableTitle: book.readableTitle ?? book.title,
		source: book.source,
		category: book.category,
		coverImageUrl: book.coverImageUrl ?? undefined,
		sourceUrl: book.sourceUrl ?? undefined,
		readwiseUrl: book.readwiseUrl,
		highlightCount: book.highlightCount,
		lastHighlightAt: book.lastHighlightAt?.toISOString(),
		tags: book.bookTags.map((bookTag) => ({
			name: bookTag.tag.name,
			label: bookTag.tag.label,
		})),
		highlights: book.highlights.map((highlight) => ({
			id: highlight.id.toString(),
			text: highlight.text,
			note: highlight.note ?? undefined,
			location: highlight.location ?? undefined,
			highlightedAt: highlight.highlightedAt?.toISOString(),
			tags: highlight.highlightTags.map((highlightTag) => ({
				name: highlightTag.tag.name,
				label: highlightTag.tag.label,
			})),
		})),
	}
}

export async function getCommonplaceData(
	page: number = 1,
	selectedTags: string[] = [],
): Promise<CommonplaceData | null> {
	try {
		const tags = normalizeSelectedTags(selectedTags)
		const offset = (page - 1) * PAGE_SIZE

		const [{ totalCount }] = await db
			.select({ totalCount: count() })
			.from(readwiseBooks)
			.where(tags.length > 0 ? and(...hasEveryTag(readwiseBooks.id, tags)) : undefined)

		const books = await db.query.readwiseBooks.findMany({
			where:
				tags.length > 0
					? (book) => and(...hasEveryTag(book.id, tags))
					: undefined,
			orderBy: (book) => [
				sql`${book.lastHighlightAt} desc nulls last`,
				desc(book.id),
			],
			limit: PAGE_SIZE,
			offset,
			with: bookWith,
		})

		const totalPages = Math.ceil(totalCount / PAGE_SIZE)

		return {
			data: books.map(toCommonplaceBook),
			pagination: {
				page,
				pageSize: PAGE_SIZE,
				totalCount,
				totalPages,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1,
			},
		}
	} catch (error) {
		console.error('Error fetching commonplace data:', error)
		throw error
	}
}

export async function getAvailableTags(
	selectedTags: string[] = [],
): Promise<TagWithCount[]> {
	try {
		const tags = normalizeSelectedTags(selectedTags)
		const bookCount = countDistinct(readwiseBookTags.bookId)

		const conditions = hasEveryTag(readwiseBooks.id, tags)
		if (tags.length > 0) {
			conditions.push(notInArray(readwiseTags.name, tags))
		}

		// When tags are selected, drop tags carried by every matching book: they
		// would not narrow the result.
		const matchingBooks = alias(readwiseBooks, 'matching_books')
		const having =
			tags.length > 0
				? lt(
						bookCount,
						db
							.select({ value: count() })
							.from(matchingBooks)
							.where(and(...hasEveryTag(matchingBooks.id, tags))),
					)
				: undefined

		const rows = await db
			.select({
				name: readwiseTags.name,
				displayName: readwiseTags.label,
				count: bookCount,
			})
			.from(readwiseTags)
			.innerJoin(readwiseBookTags, eq(readwiseBookTags.tagId, readwiseTags.id))
			.innerJoin(readwiseBooks, eq(readwiseBooks.id, readwiseBookTags.bookId))
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.groupBy(readwiseTags.id, readwiseTags.name, readwiseTags.label)
			.having(having)
			.orderBy(desc(bookCount), asc(readwiseTags.label))

		return rows
	} catch (error) {
		console.error('Error fetching available tags:', error)
		throw error
	}
}

export async function getCommonplaceBookBySlug(
	slug: string,
): Promise<CommonplaceBook | null> {
	try {
		const book = await db.query.readwiseBooks.findFirst({
			where: eq(readwiseBooks.slug, slug),
			with: bookWith,
		})

		// null only when no row matches; database errors propagate.
		return book ? toCommonplaceBook(book) : null
	} catch (error) {
		console.error('Error fetching commonplace book by slug:', error)
		throw error
	}
}
