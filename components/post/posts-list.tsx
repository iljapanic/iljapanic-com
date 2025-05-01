import { format } from 'date-fns'
import Link from 'next/link'

export function PostsList({
	posts,
	showDate = true,
	showSubtitle = true,
}: {
	posts: any[]
	showDate?: boolean
	showSubtitle?: boolean
}) {
	return (
		<section className="space-y-4">
			{posts.map((post) => (
				<Link
					key={post.slug}
					href={`/${post.slug}`}
					className="-mx-3 block cursor-pointer rounded-md p-3 text-inherit no-underline hover:bg-muted"
				>
					<div className="space-y-1">
						<header className="flex items-center justify-between">
							<h3 className="mb-0 mt-0 font-normal">{post.title}</h3>
							{showDate && (
								<time
									dateTime={post.publishedAt}
									className="text-sm text-muted-foreground"
								>
									{format(new Date(post.publishedAt), 'yyyy')}
								</time>
							)}
						</header>
						{showSubtitle && (
							<p className="mt-0 text-muted-foreground">{post.subtitle}</p>
						)}
					</div>
				</Link>
			))}
		</section>
	)
}
