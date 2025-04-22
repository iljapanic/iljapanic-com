import { useMDXComponent } from 'next-contentlayer2/hooks'

import { PostHeader } from '@/components/post/post-header'
import { mdxComponents } from '@/components/mdx/mdx-components'

import type { Article, Page, Note, Post } from 'contentlayer/generated'

import { cn } from '@/lib/utils'
import { PostToc } from '@/components/post/post-toc'
import { LinkPreview } from '@/components/ui/link-preview'

export function Post({
	post,
	className,
}: {
	post: Article | Page | Note | Post
	className?: string
}) {
	const MDXContent = useMDXComponent(post.body.code)

	return (
		<article className={cn('post-wrapper mx-auto', className)}>

			{/* post header */}
			{post.hideHeader ? null : (
				<PostHeader
					title={post.title}
					subtitle={post.subtitle}
					date={post.publishedAt}
					showDate={
						post.type === 'Article' ||
						post.type === 'Post' ||
						post.type === 'Note'
					}
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

			<div className={cn(
			post.hideHeader ? null : 'mt-16',
			)}>
				<MDXContent components={mdxComponents} />
			</div>

			{post.type === 'Note' && (
				<div className="mt-16">
					<h2 className="">Links</h2>
					<ul className="space-y-4">
						{post.links?.map((link) => (
							<li key={link}>
								<LinkPreview url={link} />
							</li>
						))}
					</ul>
				</div>
			)}
		</article>
	)
}
