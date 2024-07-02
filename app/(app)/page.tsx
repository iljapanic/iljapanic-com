import Link from 'next/link'
import { compareDesc } from 'date-fns'

import { allArticles } from 'contentlayer/generated'
import { keystaticReader } from '@/lib/keystatic-reader'

import { PostsList } from '@/components/post/posts-list'
import NowMdx from '@/content/snippets/now.mdx'
import AboutMdx from '@/content/snippets/about.mdx'
import { BooksGrid } from '@/components/books/books-grid'
import { cn } from '@/lib/utils'
import { CaretRightIcon } from '@radix-ui/react-icons'

export const dynamic = 'force-dynamic'

export default async function Page() {
	const articles = await allArticles
		.filter((article) => article.isPublished)
		.sort((a, b) =>
			compareDesc(new Date(a.publishedAt), new Date(b.publishedAt)),
		)

	const books = await keystaticReader.singletons.bookshelf.read()
	const firstSection = books?.sections[0]
	const randomBooks = [...(firstSection?.books ?? [])]
		.sort(() => 0.5 - Math.random())
		.slice(0, 4)

	return (
		<div className="post-wrapper mx-auto">
			<section>
				<p className="font-serif italic">
					Crafting bespoke software and product experiences.
				</p>
				<p className="mt-1 font-serif italic">
					Exploring the intersection of people, living systems and technologies.
				</p>
			</section>

			<section className="mt-20">
				<h2>About</h2>
				<AboutMdx />
			</section>

			<section className="mt-20">
				<h2>Now</h2>
				<NowMdx />
			</section>

			<section className="mt-20">
				<h2>Academic writing</h2>
				<div className="mt-4">
					{articles && articles.length > 0 && <PostsList posts={articles} />}
				</div>
			</section>

			<section className="mt-20">
				<h2>Bookshelf</h2>

				<BooksGrid books={randomBooks} />

				<SectionLink href="/bookshelf">Browse the entire bookshelf</SectionLink>
			</section>
		</div>
	)
}

function SectionLink({
	href,
	children,
	className,
}: {
	href: string
	children: React.ReactNode
	className?: string
}) {
	return (
		<Link
			href={href}
			className={cn(
				'group mt-10 inline-flex items-center gap-1 font-serif font-medium italic text-muted-foreground no-underline hover:text-foreground',
				className,
			)}
		>
			{children}{' '}
			<CaretRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-[2px]" />
		</Link>
	)
}
