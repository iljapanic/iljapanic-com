// Server-side module: it queries the database directly.
// Never import this from a client component.
import { asc, eq } from 'drizzle-orm'
import { db } from '@/db'
import {
	books,
	bookSections,
	bookSectionItems,
	type BookRow,
} from '@/db/schema'

export type Book = BookRow

export type BookSection = {
	id: number
	title: string
	books: Book[]
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
	const [book] = await db
		.select()
		.from(books)
		.where(eq(books.slug, slug))
		.limit(1)

	return book ?? null
}

export async function listBooks(): Promise<Book[]> {
	return db.select().from(books).orderBy(asc(books.title))
}

export async function getBookSections(): Promise<BookSection[]> {
	const [sections, items] = await Promise.all([
		db
			.select()
			.from(bookSections)
			.orderBy(asc(bookSections.position), asc(bookSections.id)),
		db
			.select({ sectionId: bookSectionItems.sectionId, book: books })
			.from(bookSectionItems)
			.innerJoin(books, eq(bookSectionItems.bookId, books.id))
			.orderBy(asc(bookSectionItems.position)),
	])

	// The inner join drops items whose book no longer exists, so a stale
	// membership never breaks the public page.
	return sections.map((section) => ({
		id: section.id,
		title: section.title,
		books: items
			.filter((item) => item.sectionId === section.id)
			.map((item) => item.book),
	}))
}
