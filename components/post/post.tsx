import { useMDXComponent } from 'next-contentlayer2/hooks'

import { PostHeader } from '@/components/post/post-header'
import { mdxComponents } from '@/components/mdx/mdx-components'

import type { Article, Page, Note, Post } from 'contentlayer/generated'

import { cn } from '@/lib/utils'
import { PostToc } from '@/components/post/post-toc'
import { allNotes } from '@/.contentlayer/generated/index.mjs'
import { compareDesc, format, parseISO } from 'date-fns'
import Link from 'next/link'

// Helper function to capitalize first letter
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export async function Post({
	post,
	className,
}: {
	post: Article | Page | Note | Post
	className?: string
}) {
	const MDXContent = useMDXComponent(post.body.code)

	const notes = await allNotes.filter((note) => note.isPublished)
	// No initial sort needed here, we sort after grouping

	// Group notes by directory path
	const groupedNotes = notes.reduce(
		(acc, note) => {
			const key = note.directoryPath || '_root' // Use '_root' if directoryPath is null/undefined
			if (!acc[key]) {
				acc[key] = []
			}
			acc[key].push(note)
			return acc
		},
		{} as Record<string, Note[]>,
	)

	// Sort notes within each group alphabetically by title
	Object.keys(groupedNotes).forEach((key) => {
		groupedNotes[key].sort((a, b) => a.title.localeCompare(b.title))
	})

	// Sort group keys alphabetically, putting '_root' first
	const sortedGroupKeys = Object.keys(groupedNotes).sort((a, b) => {
		if (a === '_root') return -1
		if (b === '_root') return 1
		return a.localeCompare(b)
	})

	return (
		<article className={cn('post-wrapper mx-auto', className)}>
			{/* post header */}
			{post.hideHeader ? null : (
				<PostHeader
					title={post.title}
					subtitle={post.subtitle}
					date={post.publishedAt}
					showDate={post.type === 'Article' || post.type === 'Post'}
					postType={post.type}
					showPostType={post.type === 'Article' || post.type === 'Post'}
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

			<div className={cn(post.hideHeader ? null : 'mt-8')}>
				<MDXContent components={mdxComponents} />
			</div>

			{/* date for garden posts */}
			{post.type === 'Note' && post.publishedAt && (
				<div className="mt-16 font-serif italic text-muted-foreground">
					Last tended in{' '}
					<time dateTime={post.publishedAt} className="">
						{format(parseISO(post.publishedAt), 'LLLL d, yyyy')}
					</time>
				</div>
			)}

			{/* floating desktop links */}
			{post.type === 'Note' && (
				<div className="fixed left-12 top-[28vh] hidden lg:block">
					<h3 className="font-serif text-sm italic text-foreground/90">
						Garden
					</h3>
					<ul className="mt-2 space-y-1">
						{sortedGroupKeys.map((key) => {
							const groupNotes = groupedNotes[key]
							if (key === '_root') {
								// Render root notes directly
								return groupNotes.map((note) => (
									<li key={note.title}>
										<Link
											href={`/${note.slug}`}
											className={cn(
												'text-sm text-foreground/60 no-underline',
												note.slug === post.slug &&
													'font-medium text-foreground',
											)}
										>
											{note.title}
										</Link>
									</li>
								))
							} else {
								// Render directory group
								return (
									<li key={key} className="pt-1">
										<span className="text-sm font-medium text-foreground/80">
											{capitalize(key)} {/* Capitalize directory name */}
										</span>
										<ul className="ml-2 mt-1 space-y-1 border-l border-border pl-3">
											{groupNotes.map((note) => (
												<li key={note.title}>
													<Link
														href={`/${note.slug}`}
														className={cn(
															'text-sm text-foreground/60 no-underline',
															note.slug === post.slug &&
																'font-medium text-foreground',
														)}
													>
														{note.title}
													</Link>
												</li>
											))}
										</ul>
									</li>
								)
							}
						})}
					</ul>
				</div>
			)}
		</article>
	)
}
