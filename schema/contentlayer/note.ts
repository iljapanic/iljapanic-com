import { defineDocumentType } from 'contentlayer2/source-files'

export const Note = defineDocumentType(() => ({
	name: 'Note',
	filePathPattern: `notes/**/*.{mdx,md}`,
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
		createdAt: {
			type: 'date',
			description: 'The date the note was created',
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
		links: {
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
			resolve: (post) => post._raw.sourceFileName.replace(/\.(mdx|md)$/, ''),
		},
	},
}))
