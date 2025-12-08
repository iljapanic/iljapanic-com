import { compareDesc } from 'date-fns'

import { allArticles, allNotes } from 'contentlayer/generated'
import { keystaticReader } from '@/lib/keystatic-reader'

import { PostsList } from '@/components/post/posts-list'
import { PostHeader } from '@/components/post/post-header'

export const metadata = {
	title: 'Long-form writing',
	description: '',
}

export const dynamic = 'force-dynamic'

export default async function Page() {
	const articles = await allArticles
		.filter((article) => article.isPublished)
		.sort((a, b) =>
			compareDesc(new Date(a.publishedAt ?? 0), new Date(b.publishedAt ?? 0)),
		)

	return (
		<div className="post-wrapper mx-auto">
			<PostHeader
				asH2
				title="Articles"
				subtitle="Longforms written over the course of several studies"
			/>
			<section className="mt-12">
				{articles && articles.length > 0 && <PostsList posts={articles} />}
			</section>
		</div>
	)
}
