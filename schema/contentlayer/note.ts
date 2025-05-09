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
		isFeatured: {
			type: 'boolean',
			description: 'Whether the note is featured on the homepage',
			required: false,
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
		directoryPath: {
			type: 'string',
			resolve: (post) => {
				const parts = post._raw.flattenedPath.split('/')
				return parts.length > 2 ? parts[1] : '_root'
			},
		},
		wordCount: {
			type: 'number',
			description: 'Number of words in the document',
			resolve: (doc) => {
				const content = doc.body.raw
				return content.split(/\s+/).filter(Boolean).length
			},
		},
	},
}))
