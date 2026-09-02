import Link from 'next/link'
import { compareDesc } from 'date-fns'

import { allArticles, allNotes } from 'contentlayer/generated'
import { getBookSections } from '@/lib/books'

import { PostsList } from '@/components/post/posts-list'
import NowMdx from '@/content/snippets/now.mdx'
import AboutMdx from '@/content/snippets/about.mdx'
import { BooksGrid } from '@/components/books/books-grid'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowRight, CornerDownRight, Redo } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Page() {
	const articles = await allArticles
		.filter((article) => article.isPublished)
		.sort((a, b) =>
			compareDesc(new Date(a.publishedAt), new Date(b.publishedAt)),
		)

	const bookSections = await getBookSections()
	const garden = await allNotes.filter(
		(note) => note.isPublished && note.isFeatured,
	)

	const firstSection = bookSections[0]
	const randomBooks = [...(firstSection?.books ?? [])].slice(0, 6)

	return (
		<div className="post-wrapper mx-auto">
			<section>
				<p className="font-serif italic">
					Crafting intentional software experiences.
				</p>
				<p className="mt-1 font-serif italic">
					Exploring the intersections of technologies and living systems.
				</p>
			</section>

			<section className="mt-20">
				<h2>Now</h2>
				<NowMdx />
			</section>

			<section className="mt-20">
				<h2>About</h2>
				<AboutMdx />
			</section>

			{/*<section className="mt-20">
				<h2>Academic writing</h2>
				<div className="mt-4">
					{articles && articles.length > 0 && <PostsList posts={articles} />}
				</div>
			</section>*/}

			{/*<section className="mt-20">
				<h2>Garden</h2>

				<div className="mt-4">
					{garden && garden.length > 0 && (
						<div className="grid grid-cols-2 gap-4">
							{garden.map((note) => (
								<Link
									key={note.slug}
									href={`/${note.slug}`}
									className="-mx-2 inline-block w-fit rounded-md px-2 py-1 no-underline hover:bg-muted"
								>
									{note.title}
								</Link>
							))}
						</div>
					)}
				</div>

				<SectionLink href="/garden">Explore the garden</SectionLink>
			</section>*/}

			{/*<section className="mt-20">
				<h2>Bookshelf</h2>

				<div className="lg:hidden">
					<BooksGrid books={randomBooks} />
				</div>

				<div className="hidden lg:block">
					<BooksGrid books={randomBooks.slice(0, 4)} />
				</div>

				<SectionLink href="/bookshelf">Browse the bookshelf</SectionLink>
			</section>*/}
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
		<div className={cn('mt-10 text-left', className)}>
			<Link
				href={href}
				className="group text-foreground/70 hover:text-foreground inline-flex items-center gap-2 no-underline"
			>
				<span className="decoration-muted-foreground group-hover:decoration-foreground font-serif text-lg font-normal italic underline">
					{children}
				</span>

				<span className="transition-transform duration-150 group-hover:translate-x-[2px]">
					➛
				</span>
			</Link>
		</div>
	)
}
