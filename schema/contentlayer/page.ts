import { defineDocumentType } from 'contentlayer2/source-files'

export const Page = defineDocumentType(() => ({
	name: 'Page',
	filePathPattern: `pages/**/*.mdx`,
	contentType: 'mdx',
	fields: {
		title: {
			type: 'string',
			description: 'The title of the page',
			required: true,
		},
		isPublished: {
			type: 'boolean',
			description: 'Whether the page is published',
			required: false,
		},
		publishedAt: {
			type: 'date',
			description: 'The date of the page was first published',
			required: false,
		},
		updatedAt: {
			type: 'date',
			description: 'The date of the page was last updated',
			required: false,
		},
		subtitle: {
			type: 'string',
			description: 'The subtitle of the page',
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
