import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { listBooks } from '@/lib/books'

export const metadata = {
	title: 'Books',
}

export default async function AdminBooksPage() {
	await requireAdmin()

	const books = await listBooks()

	return (
		<section className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-medium">Books</h1>
				<div className="flex items-center gap-4 text-sm">
					<Link href="/admin/books/sections">Sections</Link>
					<Link href="/admin/books/new">New book</Link>
				</div>
			</div>

			<table className="w-full text-sm">
				<thead>
					<tr className="border-b text-left text-muted-foreground">
						<th className="py-2 pr-4 font-normal">Title</th>
						<th className="py-2 pr-4 font-normal">Author</th>
						<th className="py-2 font-normal">Slug</th>
					</tr>
				</thead>
				<tbody>
					{books.length === 0 && (
						<tr>
							<td colSpan={3} className="py-4 text-muted-foreground">
								No books yet.
							</td>
						</tr>
					)}
					{books.map((book) => (
						<tr key={book.id} className="border-b">
							<td className="py-2 pr-4">
								<Link href={`/admin/books/${book.id}`}>{book.title}</Link>
							</td>
							<td className="py-2 pr-4 text-muted-foreground">
								{book.author ?? ''}
							</td>
							<td className="py-2 text-muted-foreground">{book.slug}</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	)
}
