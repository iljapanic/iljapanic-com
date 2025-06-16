'use server'

import { prisma } from '@/prisma/client'

export interface CommonplaceBook {
	id: string
	title: string
	author?: string
	readableTitle: string
	source: string
	coverImageUrl?: string
	sourceUrl?: string
	readwiseUrl?: string
	category?: string
	slug?: string
	highlights: Array<{
		id: string
		text: string
		note?: string
		location?: number
		highlightedAt: string
		tags: string[]
	}>
	tags: string[]
}

export interface CommonplacePagination {
	page: number
	pageSize: number
	totalCount: number
	totalPages: number
	hasNextPage: boolean
	hasPreviousPage: boolean
}

export interface CommonplaceData {
	data: CommonplaceBook[]
	pagination: CommonplacePagination
}

export interface TagWithCount {
	name: string
	displayName: string
	count: number
}

// Helper function to normalize tag names (lowercase)
function normalizeTagName(tag: string): string {
	return tag.toLowerCase()
}

// Helper function to format tag display name (kebab-case to spaces)
function formatTagDisplayName(tag: string): string {
	return tag.toLowerCase().replace(/-/g, ' ')
}

// Helper function to find all variations of a tag name (different cases)
async function findTagVariations(tagName: string): Promise<string[]> {
	const tags = await prisma.tag.findMany({
		where: {
			name: {
				mode: 'insensitive',
				equals: tagName,
			},
		},
		select: { name: true },
	})
	return tags.map((t) => t.name)
}

export async function getCommonplaceData(
	page: number = 1,
	selectedTags: string[] = [],
): Promise<CommonplaceData | null> {
	try {
		console.log('getCommonplaceData called with:', { page, selectedTags })
		const pageSize = 10
		const skip = (page - 1) * pageSize

		// Normalize selected tags to lowercase
		const normalizedSelectedTags = selectedTags.map(normalizeTagName)

		// Common include structure
		const includeStructure = {
			highlights: {
				where: {
					isDeleted: false,
				},
				include: {
					tags: {
						include: {
							tag: true,
						},
					},
				},
				orderBy: {
					highlightedAt: 'desc' as const,
				},
			},
			bookTags: {
				include: {
					tag: true,
				},
			},
		}

		let sharedBooks
		let totalCount

		if (normalizedSelectedTags.length > 0) {
			// Get @share tag
			const shareTagVariations = await findTagVariations('@share')

			// Get all variations of selected tags (case insensitive)
			const selectedTagVariations: string[] = []
			for (const tag of normalizedSelectedTags) {
				const variations = await findTagVariations(tag)
				selectedTagVariations.push(...variations)
			}

			if (shareTagVariations.length === 0) {
				return {
					data: [],
					pagination: {
						page,
						pageSize,
						totalCount: 0,
						totalPages: 0,
						hasNextPage: false,
						hasPreviousPage: false,
					},
				}
			}

			// Get books that have @share AND all selected tags (case insensitive)
			const booksWithAllTags = await prisma.book.findMany({
				where: {
					isDeleted: false,
					bookTags: {
						some: {
							tag: {
								name: {
									in: [...shareTagVariations, ...selectedTagVariations],
								},
							},
						},
					},
				},
				include: {
					bookTags: {
						include: {
							tag: true,
						},
					},
				},
			})

			// Filter books that have @share AND ALL selected tags (normalized comparison)
			const filteredBooks = booksWithAllTags.filter((book) => {
				const bookTagNames = book.bookTags.map((bt) =>
					normalizeTagName(bt.tag.name),
				)
				const hasShare = bookTagNames.some(
					(name) => normalizeTagName(name) === '@share',
				)
				const hasAllSelectedTags = normalizedSelectedTags.every((selectedTag) =>
					bookTagNames.some(
						(bookTag) => normalizeTagName(bookTag) === selectedTag,
					),
				)
				return hasShare && hasAllSelectedTags
			})

			const filteredBookIds = filteredBooks.map((book) => book.id)

			// Get paginated results
			sharedBooks = await prisma.book.findMany({
				where: {
					id: { in: filteredBookIds },
				},
				include: includeStructure,
				orderBy: {
					lastHighlightAt: 'desc',
				},
				skip,
				take: pageSize,
			})

			totalCount = filteredBooks.length
		} else {
			// Simple query when no additional tags are selected
			sharedBooks = await prisma.book.findMany({
				where: {
					isDeleted: false,
					bookTags: {
						some: {
							tag: {
								name: {
									mode: 'insensitive',
									equals: '@share',
								},
							},
						},
					},
				},
				include: includeStructure,
				orderBy: {
					lastHighlightAt: 'desc',
				},
				skip,
				take: pageSize,
			})

			totalCount = await prisma.book.count({
				where: {
					isDeleted: false,
					bookTags: {
						some: {
							tag: {
								name: {
									mode: 'insensitive',
									equals: '@share',
								},
							},
						},
					},
				},
			})
		}

		// Transform the data to match our interface
		const transformedBooks: CommonplaceBook[] = sharedBooks.map((book) => ({
			id: book.id.toString(),
			title: book.title,
			author: book.author || undefined,
			readableTitle: book.readableTitle || book.title,
			source: book.source,
			coverImageUrl: book.coverImageUrl || undefined,
			sourceUrl: book.sourceUrl || undefined,
			readwiseUrl: book.readwiseUrl,
			category: book.category || undefined,
			slug: book.slug || undefined,
			tags: book.bookTags.map((bt) => formatTagDisplayName(bt.tag.name)),
			highlights: book.highlights.map((highlight) => ({
				id: highlight.id.toString(),
				text: highlight.text,
				note: highlight.note || undefined,
				location: highlight.location || undefined,
				highlightedAt:
					highlight.highlightedAt?.toISOString() || new Date().toISOString(),
				tags: highlight.tags.map((ht) => formatTagDisplayName(ht.tag.name)),
			})),
		}))

		const totalPages = Math.ceil(totalCount / pageSize)

		return {
			data: transformedBooks,
			pagination: {
				page,
				pageSize,
				totalCount,
				totalPages,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1,
			},
		}
	} catch (error) {
		console.error('Error fetching commonplace data:', error)
		return null
	}
}

export async function getAvailableTags(
	selectedTags: string[] = [],
): Promise<TagWithCount[]> {
	try {
		// Normalize selected tags
		const normalizedSelectedTags = selectedTags.map(normalizeTagName)

		if (normalizedSelectedTags.length === 0) {
			// If no tags selected, return all tags from books with @share tag (excluding @share itself)
			const booksWithShare = await prisma.book.findMany({
				where: {
					isDeleted: false,
					bookTags: {
						some: {
							tag: {
								name: {
									mode: 'insensitive',
									equals: '@share',
								},
							},
						},
					},
				},
				include: {
					bookTags: {
						include: {
							tag: true,
						},
					},
				},
			})

			// Count tags from these books
			const tagCounts = new Map<
				string,
				{ displayName: string; count: number }
			>()

			booksWithShare.forEach((book) => {
				book.bookTags.forEach((bt) => {
					const normalizedTagName = normalizeTagName(bt.tag.name)
					if (normalizedTagName !== '@share') {
						const displayName = formatTagDisplayName(bt.tag.name)
						const existing = tagCounts.get(normalizedTagName)
						if (existing) {
							existing.count += 1
						} else {
							tagCounts.set(normalizedTagName, { displayName, count: 1 })
						}
					}
				})
			})

			return Array.from(tagCounts.entries())
				.map(([name, { displayName, count }]) => ({ name, displayName, count }))
				.sort((a, b) => {
					// Sort by count first (descending)
					if (a.count !== b.count) {
						return b.count - a.count
					}
					// Then alphabetically by display name
					return a.displayName.localeCompare(b.displayName)
				})
		} else {
			// Get books that have @share AND all selected tags using the same approach as above
			const shareTagVariations = await findTagVariations('@share')

			const selectedTagVariations: string[] = []
			for (const tag of normalizedSelectedTags) {
				const variations = await findTagVariations(tag)
				selectedTagVariations.push(...variations)
			}

			if (shareTagVariations.length === 0) {
				return []
			}

			const booksWithAllTags = await prisma.book.findMany({
				where: {
					isDeleted: false,
					bookTags: {
						some: {
							tag: {
								name: {
									in: [...shareTagVariations, ...selectedTagVariations],
								},
							},
						},
					},
				},
				include: {
					bookTags: {
						include: {
							tag: true,
						},
					},
				},
			})

			// Filter books that have @share AND ALL selected tags
			const filteredBooks = booksWithAllTags.filter((book) => {
				const bookTagNames = book.bookTags.map((bt) =>
					normalizeTagName(bt.tag.name),
				)
				const hasShare = bookTagNames.some(
					(name) => normalizeTagName(name) === '@share',
				)
				const hasAllSelectedTags = normalizedSelectedTags.every((selectedTag) =>
					bookTagNames.some(
						(bookTag) => normalizeTagName(bookTag) === selectedTag,
					),
				)
				return hasShare && hasAllSelectedTags
			})

			// If only one book matches, don't show additional tags
			if (filteredBooks.length <= 1) {
				return []
			}

			// Count remaining tags from these books (excluding @share and selected tags)
			const tagCounts = new Map<
				string,
				{ displayName: string; count: number }
			>()

			filteredBooks.forEach((book) => {
				book.bookTags.forEach((bt) => {
					const normalizedTagName = normalizeTagName(bt.tag.name)
					if (
						normalizedTagName !== '@share' &&
						!normalizedSelectedTags.includes(normalizedTagName)
					) {
						const displayName = formatTagDisplayName(bt.tag.name)
						const existing = tagCounts.get(normalizedTagName)
						if (existing) {
							existing.count += 1
						} else {
							tagCounts.set(normalizedTagName, { displayName, count: 1 })
						}
					}
				})
			})

			// Only return tags that appear on some (but not all) of the filtered books
			// This ensures that selecting the tag will actually change the result set
			const totalFilteredBooks = filteredBooks.length
			const meaningfulTags = Array.from(tagCounts.entries())
				.filter(([_, { count }]) => count > 0 && count < totalFilteredBooks)
				.map(([name, { displayName, count }]) => ({ name, displayName, count }))
				.sort((a, b) => {
					// Sort by count first (descending)
					if (a.count !== b.count) {
						return b.count - a.count
					}
					// Then alphabetically by display name
					return a.displayName.localeCompare(b.displayName)
				})

			return meaningfulTags
		}
	} catch (error) {
		console.error('Error fetching available tags:', error)
		return []
	}
}

export async function getCommonplaceBookBySlug(
	slug: string,
): Promise<CommonplaceBook | null> {
	try {
		console.log('getCommonplaceBookBySlug called with:', { slug })

		// Common include structure for fetching book with highlights
		const includeStructure = {
			highlights: {
				where: {
					isDeleted: false,
				},
				include: {
					tags: {
						include: {
							tag: true,
						},
					},
				},
				orderBy: {
					highlightedAt: 'desc' as const,
				},
			},
			bookTags: {
				include: {
					tag: true,
				},
			},
		}

		// Fetch the book by slug, ensuring it has the @share tag
		const book = await prisma.book.findFirst({
			where: {
				slug: slug,
				isDeleted: false,
				bookTags: {
					some: {
						tag: {
							name: {
								mode: 'insensitive',
								equals: '@share',
							},
						},
					},
				},
			},
			include: includeStructure,
		})

		if (!book) {
			return null
		}

		// Transform the data to match our interface
		const transformedBook: CommonplaceBook = {
			id: book.id.toString(),
			title: book.title,
			author: book.author || undefined,
			readableTitle: book.readableTitle || book.title,
			source: book.source,
			coverImageUrl: book.coverImageUrl || undefined,
			sourceUrl: book.sourceUrl || undefined,
			readwiseUrl: book.readwiseUrl,
			category: book.category || undefined,
			tags: book.bookTags.map((bt) => formatTagDisplayName(bt.tag.name)),
			highlights: book.highlights.map((highlight) => ({
				id: highlight.id.toString(),
				text: highlight.text,
				note: highlight.note || undefined,
				location: highlight.location || undefined,
				highlightedAt:
					highlight.highlightedAt?.toISOString() || new Date().toISOString(),
				tags: highlight.tags.map((ht) => formatTagDisplayName(ht.tag.name)),
			})),
		}

		return transformedBook
	} catch (error) {
		console.error('Error fetching commonplace book by ID:', error)
		return null
	}
}
