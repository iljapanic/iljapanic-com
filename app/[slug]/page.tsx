import { allDocuments } from 'contentlayer/generated'
import { notFound } from 'next/navigation'

import { Post } from '@/components/post/post'

interface MetaObject {
	title: string | undefined
	description?: string
	keywords?: string
	openGraph: {
		title: string | undefined
		type: string
		description?: string
		publishedTime?: string
	}
}

export async function generateMetadata({
	params: { slug },
}: {
	params: { slug: string }
}) {
	const post = await allDocuments.find((post) => post.slug === slug)

	if (post) {
		let metaObject: MetaObject = {
			title: post.title,
			openGraph: {
				title: post.title,
				type: 'article',
			},
		}

		if (post.subtitle) {
			metaObject['description'] = post.subtitle
			metaObject['openGraph']['description'] = post.subtitle
		}

		if (post.publishedAt) {
			metaObject['openGraph']['publishedTime'] = post.publishedAt
		}

		return metaObject
	}
}

export default async function Page({
	params: { slug },
}: {
	params: { slug: string }
}) {
	const post = await allDocuments.find((post) => post.slug === slug)

	if (!post || !post.isPublished) {
		notFound()
	}

	return <Post post={post} />
}
