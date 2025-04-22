import { defineDocumentType } from 'contentlayer2/source-files'

export const Post = defineDocumentType(() => ({
	name: 'Post',
	filePathPattern: `posts/**/*.{mdx,md}`,
	contentType: 'mdx',
	fields: {
		title: {
			type: 'string',
			description: 'The title of the post',
			required: true,
		},
		subtitle: {
			type: 'string',
			description: 'The subtitle of the note',
			required: false,
		},
		publishedAt: {
			type: 'date',
			description: 'The date of the note was first published',
			required: false,
		},
		updatedAt: {
			type: 'date',
			description: 'The date the note was last updated',
			required: false,
		},
		isPublished: {
			type: 'boolean',
			description: 'Whether the note is published',
			required: true,
		},
		keywords: {
			type: 'list',
			of: { type: 'string' },
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
