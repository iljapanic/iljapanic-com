import { compareDesc } from 'date-fns'

import { allNotes } from 'contentlayer/generated'

import { PostsList } from '@/components/post/posts-list'
import { PostHeader } from '@/components/post/post-header'

export const metadata = {
	title: 'Garden',
	description: '',
}

export const dynamic = 'force-dynamic'

export default async function Page() {
	const notes = await allNotes
		.filter((note) => note.isPublished)
		.sort((a, b) => compareDesc(new Date(a.title ?? 0), new Date(b.title ?? 0)))

	return (
		<div className="post-wrapper mx-auto">
			<PostHeader
				title="Garden"
				subtitle="A loosely tended collection of living notes and fleeting thoughts I tend to return to. It works as a quick reference guide. A way of collecting ideas and resources for myself and others."
			/>
			<section className="mt-12">
				{notes && notes.length > 0 && (
					<PostsList posts={notes} showDate={false} />
				)}
			</section>
		</div>
	)
}
