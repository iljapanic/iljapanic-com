import { Book } from '@/components/books/book'
import { BooksGrid } from '@/components/books/books-grid'
import { PostHeader } from '@/components/post/post-header'
import { keystaticReader } from '@/lib/keystatic-reader'

const title = 'Bookshelf'
const subtitle = 'Texts that shaped how I see the world'

export const metadata = {
	title: title,
	description: subtitle,
}

export default async function Page() {
	// const nonFiction = await booksNonFiction
	// const fiction = await booksFiction

	const books = await keystaticReader.singletons.bookshelf.read()

	return (
		<div>
			<div className="post-wrapper mx-auto mb-16">
				<PostHeader title={title} subtitle={subtitle} />
			</div>

			<div className="post-wide-wrapper mx-auto">
				{books &&
					books.sections.map((section) => (
						<div key={section.sectionTitle} className="mb-40">
							{/* <h2>{section.sectionTitle}</h2> */}
							<BooksGrid books={section.books} />
						</div>
					))}
			</div>
		</div>
	)
}
