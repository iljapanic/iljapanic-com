import { Book } from '@/components/books/book'
import { cn } from '@/lib/utils'

export function BooksGrid({
	books,
	className,
}: {
	books: readonly string[]
	className?: string
}) {
	return (
		<div className={cn('grid grid-cols-3 gap-6 lg:grid-cols-4', className)}>
			{books.map((book) => (
				<Book key={book} slug={book} />
			))}
		</div>
	)
}
