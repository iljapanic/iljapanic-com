import { createBook } from '@/app/admin/(protected)/books/actions'
import { BookForm } from '@/components/admin/book-form'
import { requireAdmin } from '@/lib/admin'

export const metadata = {
	title: 'New book',
}

export default async function AdminNewBookPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>
}) {
	await requireAdmin()

	const { error } = await searchParams

	return (
		<section className="flex flex-col gap-6">
			<h1 className="text-2xl font-medium">New book</h1>
			{error && <p className="text-sm text-destructive">{error}</p>}
			<BookForm action={createBook} submitLabel="Create book" />
		</section>
	)
}
