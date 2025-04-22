import { defineDocumentType } from 'contentlayer2/source-files'

export const Article = defineDocumentType(() => ({
	name: 'Article',
	filePathPattern: `articles/**/*.mdx`,
	contentType: 'mdx',
	fields: {
		title: {
			type: 'string',
			description: 'The title of the article',
			required: true,
		},
		subtitle: {
			type: 'string',
			description: 'The subtitle of the article',
			required: true,
		},
		abstract: {
			type: 'string',
			description: 'The abstract for the article',
			required: true,
		},
		publishedAt: {
			type: 'date',
			description: 'The date of the article was first published',
			required: true,
		},
		updatedAt: {
			type: 'date',
			description: 'The date of the article was last updated',
			required: false,
		},
		isPublished: {
			type: 'boolean',
			description: 'Whether the post is published',
			required: true,
		},
		affiliation: {
			type: 'string',
			description: 'The academic affiliation of the article',
			required: false,
		},
		keywords: {
			type: 'list',
			of: { type: 'string' },
			required: false,
		},
		hideHeader: {
			type: 'boolean',
			description: 'Whether the header should be hidden',
			required: false,
		},
	},
	computedFields: {
		slug: {
			type: 'string',
			resolve: (post) => post._raw.sourceFileName.replace(/\.mdx$/, ''),
		},
	},
}))
