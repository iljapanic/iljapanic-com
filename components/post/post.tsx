import { useMDXComponent } from 'next-contentlayer2/hooks'

import { PostHeader } from '@/components/post/post-header'
import { mdxComponents } from '@/components/mdx/mdx-components'
import { NotesMenu, NotesMenuMobile } from '@/components/notes/notes-menu'

import { allNotes } from 'contentlayer/generated'

import type { Article, Page, Note, Post } from 'contentlayer/generated'

import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

export async function Post({
	post,
	className,
}: {
	post: Article | Page | Note | Post
	className?: string
}) {
	const MDXContent = useMDXComponent(post.body.code)

	let notes: Note[] = []

	if (post.type === 'Note') {
		notes = await allNotes.filter((note) => note.isPublished)
	}

	return (
		<article className={cn('post-wrapper relative mx-auto', className)}>
			{/* post header */}
			{post.hideHeader ? null : (
				<PostHeader
					title={post.title}
					subtitle={post.subtitle}
					date={post.publishedAt}
					showDate={post.type === 'Article' || post.type === 'Post'}
					postType={post.type}
				/>
			)}

			{/* Articles - abstract */}
			{post.type === 'Article' && post.abstract && (
				<aside className="mt-16 font-serif">
					<h2 className="text-sm font-normal">Abstract</h2>
					<p className="mt-2 text-foreground/60">{post.abstract}</p>

					<p className="italic">{post.affiliation}</p>
				</aside>
			)}

			{/* {post.type === 'Article' && <PostToc />} */}

			<div className={cn('post-content', post.hideHeader ? null : 'mt-8')}>
				<MDXContent components={mdxComponents} />
			</div>

			{/* date for garden posts */}
			{post.type === 'Note' && post.updatedAt && (
				<div className="mt-16 font-serif italic text-muted-foreground">
					Last tended in{' '}
					<time dateTime={post.updatedAt} className="">
						{format(parseISO(post.updatedAt), 'LLLL d, yyyy')}
					</time>
				</div>
			)}

			{/* Render NotesAccordion for Note type posts */}
			{(post.type === 'Note' || post.slug === 'garden') && (
				<div>
					{/* desktop */}
					<div className="fixed left-0 top-0 hidden h-[100vh] w-[280px] items-center overflow-scroll border-border py-24 pl-10 opacity-60 lg:flex">
						<NotesMenu currentPageSlug={post.slug} notes={notes} />
					</div>
					{/* mobile */}
					<div className="fixed bottom-8 left-0 right-0 z-50 flex w-full justify-center lg:hidden">
						<NotesMenuMobile currentPageSlug={post.slug} notes={notes} />
					</div>
				</div>
			)}
		</article>
	)
}
