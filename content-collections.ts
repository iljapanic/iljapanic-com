import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import wikiLinkPlugin from 'remark-wiki-link'
import type { Pluggable } from 'unified'
import { z } from 'zod'

/* MDX plugins shared by all collections */
const remarkPlugins: Pluggable[] = [
	remarkGfm,
	[
		wikiLinkPlugin,
		{
			aliasDivider: '|',
			hrefTemplate: (permalink: string) => `/${permalink}`,
		},
	],
]

const rehypePlugins: Pluggable[] = [
	rehypeSlug,
	[
		rehypeAutolinkHeadings,
		{
			properties: {
				className: ['anchor'],
			},
		},
	],
]

const exclude = ['_drafts/**', 'drafts/**']

/* frontmatter dates come in as `2025-04-09`, full ISO or `2024-07-09T10:48` */
const isoDate = z.coerce.date().transform((d) => d.toISOString())

const slugOf = (fileName: string) => fileName.replace(/\.(mdx|md)$/, '')

const articles = defineCollection({
	name: 'articles',
	typeName: 'Article',
	directory: 'content/articles',
	include: '**/*.mdx',
	exclude,
	schema: z.object({
		title: z.string(),
		subtitle: z.string(),
		abstract: z.string(),
		publishedAt: isoDate,
		updatedAt: isoDate.optional(),
		isPublished: z.boolean(),
		affiliation: z.string().optional(),
		keywords: z.array(z.string()).optional(),
		hideHeader: z.boolean().optional(),
		content: z.string(),
	}),
	transform: async (doc, context) => {
		const { content, ...rest } = doc
		const code = await compileMDX(context, doc, { remarkPlugins, rehypePlugins })
		return {
			...rest,
			type: 'Article' as const,
			slug: slugOf(doc._meta.fileName),
			body: { code, raw: content },
		}
	},
})

const notes = defineCollection({
	name: 'notes',
	typeName: 'Note',
	directory: 'content/notes',
	include: '**/*.{md,mdx}',
	exclude,
	schema: z.object({
		title: z.string(),
		subtitle: z.string().optional(),
		publishedAt: isoDate.optional(),
		updatedAt: isoDate.optional(),
		createdAt: isoDate.optional(),
		isPublished: z.boolean(),
		isFeatured: z.boolean().optional(),
		keywords: z.array(z.string()).optional(),
		links: z.array(z.string()).optional(),
		hideHeader: z.boolean().optional(),
		content: z.string(),
	}),
	transform: async (doc, context) => {
		const { content, ...rest } = doc
		const code = await compileMDX(context, doc, { remarkPlugins, rehypePlugins })
		const directory = doc._meta.directory
		return {
			...rest,
			type: 'Note' as const,
			slug: slugOf(doc._meta.fileName),
			directoryPath: directory === '.' ? '_root' : directory.split('/')[0],
			wordCount: content.split(/\s+/).filter(Boolean).length,
			body: { code, raw: content },
		}
	},
})

const pages = defineCollection({
	name: 'pages',
	typeName: 'Page',
	directory: 'content/pages',
	include: '**/*.{md,mdx}',
	exclude,
	schema: z.object({
		title: z.string(),
		isPublished: z.boolean().optional(),
		publishedAt: isoDate.optional(),
		updatedAt: isoDate.optional(),
		createdAt: isoDate.optional(),
		subtitle: z.string().optional(),
		hideHeader: z.boolean().optional(),
		content: z.string(),
	}),
	transform: async (doc, context) => {
		const { content, ...rest } = doc
		const code = await compileMDX(context, doc, { remarkPlugins, rehypePlugins })
		return {
			...rest,
			type: 'Page' as const,
			slug: slugOf(doc._meta.fileName),
			body: { code, raw: content },
		}
	},
})

const posts = defineCollection({
	name: 'posts',
	typeName: 'Post',
	directory: 'content/posts',
	include: '**/*.{md,mdx}',
	exclude,
	schema: z.object({
		title: z.string(),
		subtitle: z.string().optional(),
		publishedAt: isoDate.optional(),
		updatedAt: isoDate.optional(),
		isPublished: z.boolean(),
		keywords: z.array(z.string()).optional(),
		hideHeader: z.boolean().optional(),
		content: z.string(),
	}),
	transform: async (doc, context) => {
		const { content, ...rest } = doc
		const code = await compileMDX(context, doc, { remarkPlugins, rehypePlugins })
		return {
			...rest,
			type: 'Post' as const,
			slug: slugOf(doc._meta.fileName),
			body: { code, raw: content },
		}
	},
})

export default defineConfig({
	content: [articles, notes, pages, posts],
})
