import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { deleteBook, updateBook } from '@/app/admin/(protected)/books/actions'
import { ConfirmButton } from '@/components/admin/confirm-button'
import { BookForm } from '@/components/admin/book-form'
import { db } from '@/db'
import { books } from '@/db/schema'
import { requireAdmin } from '@/lib/admin'

export const metadata = {
	title: 'Edit book',
}

export default async function AdminEditBookPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>
	searchParams: Promise<{ error?: string; saved?: string }>
}) {
	await requireAdmin()

	const [{ id: rawId }, { error, saved }] = await Promise.all([
		params,
		searchParams,
	])
	const id = Number(rawId)
	if (!Number.isInteger(id)) notFound()

	const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1)
	if (!book) notFound()

	return (
		<section className="flex flex-col gap-6">
			<h1 className="text-2xl font-medium">{book.title}</h1>
			{error && <p className="text-sm text-destructive">{error}</p>}
			{saved && <p className="text-sm text-muted-foreground">Saved.</p>}

			<BookForm
				action={updateBook.bind(null, book.id)}
				book={book}
				submitLabel="Save"
			/>

			<form action={deleteBook.bind(null, book.id)} className="border-t pt-6">
				<ConfirmButton
					variant="destructive"
					size="sm"
					message={`Delete "${book.title}"? It is removed from every section.`}
				>
					Delete book
				</ConfirmButton>
			</form>
		</section>
	)
}
