import { BooksGrid } from '@/components/books/books-grid'
import { PostHeader } from '@/components/post/post-header'
import { getBookSections } from '@/lib/books'

const title = 'Bookshelf'
const subtitle = 'Texts that shaped how I view the world'

export const metadata = {
	title: title,
	description: subtitle,
}

export const dynamic = 'force-dynamic'

export default async function Page() {
	const sections = await getBookSections()

	return (
		<div>
			<div className="post-wrapper mx-auto mb-16">
				<PostHeader title={title} subtitle={subtitle} />
			</div>

			<div className="post-wide-wrapper mx-auto">
				{sections.map((section) => (
					<div key={section.id} className="mb-40">
						{/* <h2>{section.title}</h2> */}
						<BooksGrid books={section.books} />
					</div>
				))}
			</div>
		</div>
	)
}
