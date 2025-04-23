// contentlayer.config.ts
import { makeSource } from 'contentlayer2/source-files'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'
import wikiLinkPlugin from 'remark-wiki-link'

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

		/* obsidian vault settings */
		'.obsidian',
	],
	mdx: {
		rehypePlugins: [
			// [
			// 	rehypePrettyCode,
			// 	{
			// 		theme: {
			// 			dark: 'github-dark-dimmed',
			// 			light: 'github-light',
			// 		},
			// 	},
			// ],
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
		remarkPlugins: [
			remarkGfm,
			[
				wikiLinkPlugin,
				{
					aliasDivider: '|',
					hrefTemplate: (permalink: string) => `/${permalink}`,
				},
			],
		],
	},
})

export default contentLayerConfig
