// contentlayer.config.ts
import { makeSource } from 'contentlayer2/source-files'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkGfm from 'remark-gfm'

import { Article } from './schema/contentlayer/article'
import { Note } from './schema/contentlayer/note'
import { Page } from './schema/contentlayer/page'
import { Post } from './schema/contentlayer/post'

const contentLayerConfig = makeSource({
	contentDirPath: 'content',
	documentTypes: [Article, Note, Page, Post],
	contentDirExclude: [
		/* drafts */
		'pages/_drafts',
		'notes/_drafts',
		'articles/_drafts',
		'posts/_drafts',
		'_templates',

		/* MDX snippets to be used manually via native Nextjs components */
		'snippets',

		/* managed by keystatic */
		'singletons',
		'books',
		'tools',
	],
	mdx: {
		rehypePlugins: [
			rehypeSlug,
			[
				rehypeAutolinkHeadings,
				{
					properties: {
						className: ['anchor'],
					},
				},
			],
		],
		remarkPlugins: [remarkGfm],
	},
})

export default contentLayerConfig
