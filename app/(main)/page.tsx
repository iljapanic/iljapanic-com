import NowMdx from '@/content/snippets/now.mdx'
import AboutMdx from '@/content/snippets/about.mdx'

export const dynamic = 'force-dynamic'

export default async function Page() {
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
