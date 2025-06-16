import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, createUnauthorizedResponse } from '@/app/api/api-auth'
import { ReadwiseClient, ReadwiseBook, ReadwiseHighlight } from '@/lib/readwise'
import { prisma } from '@/prisma/client'
import { slugify } from '@/lib/utils'

export async function POST(request: NextRequest) {
	// Validate API key
	if (!validateApiKey(request)) {
		return createUnauthorizedResponse()
	}

	const readwiseToken = process.env.READWISE_ACCESS_TOKEN
	if (!readwiseToken) {
		return NextResponse.json(
			{ error: 'READWISE_ACCESS_TOKEN environment variable is not set' },
			{ status: 500 },
		)
	}

	try {
		const client = new ReadwiseClient(readwiseToken)

		// Validate Readwise token
		const isValidToken = await client.validateToken()
		if (!isValidToken) {
			return NextResponse.json(
				{ error: 'Invalid Readwise access token' },
				{ status: 400 },
			)
		}

		// Get the last sync date to only fetch updates
		const lastSync = await prisma.syncLog.findFirst({
			where: { status: 'success' },
			orderBy: { syncedAt: 'desc' },
		})

		const updatedAfter = lastSync?.syncedAt.toISOString()

		console.log(
			`Starting Readwise sync${updatedAfter ? ` from ${updatedAfter}` : ' (full sync)'}...`,
		)

		// Fetch highlights from Readwise
		const books = await client.exportHighlights(updatedAfter)

		let bookCount = 0
		let highlightCount = 0
		let errorMessage: string | null = null

		try {
			// Process each book and its highlights
			for (const bookData of books) {
				await processBook(bookData)
				bookCount++

				// Count highlights
				highlightCount += bookData.highlights.length
			}

			// Log successful sync
			await prisma.syncLog.create({
				data: {
					status: 'success',
					bookCount,
					highlightCount,
					message: `Successfully synced ${bookCount} books and ${highlightCount} highlights`,
				},
			})

			console.log(
				`Sync completed successfully: ${bookCount} books, ${highlightCount} highlights`,
			)

			return NextResponse.json({
				success: true,
				message: 'Sync completed successfully',
				bookCount,
				highlightCount,
			})
		} catch (error) {
			errorMessage =
				error instanceof Error ? error.message : 'Unknown error during sync'
			console.error('Error during sync:', error)

			// Log failed sync
			await prisma.syncLog.create({
				data: {
					status: 'error',
					message: errorMessage,
					bookCount,
					highlightCount,
				},
			})

			throw error
		}
	} catch (error) {
		console.error('Sync error:', error)

		return NextResponse.json(
			{ error: 'Failed to sync highlights' },
			{ status: 500 },
		)
	}
}

async function processBook(bookData: ReadwiseBook) {
	try {
		// Generate slug from first 20  characters of title
		const slug = slugify(bookData.title.substring(0, 20))

		// Upsert book
		const book = await prisma.book.upsert({
			where: { userBookId: bookData.user_book_id },
			update: {
				title: bookData.title,
				author: bookData.author || null,
				readableTitle: bookData.readable_title || null,
				source: bookData.source,
				coverImageUrl: bookData.cover_image_url || null,
				uniqueUrl: bookData.unique_url || null,
				category: bookData.category,
				documentNote: bookData.document_note || null,
				summary: bookData.summary || null,
				readwiseUrl: bookData.readwise_url,
				sourceUrl: bookData.source_url || null,
				externalId: bookData.external_id || null,
				asin: bookData.asin || null,
				slug: slug,
				isDeleted: bookData.is_deleted,
				updatedAt: new Date(),
			},
			create: {
				userBookId: bookData.user_book_id,
				title: bookData.title,
				author: bookData.author || null,
				readableTitle: bookData.readable_title || null,
				source: bookData.source,
				coverImageUrl: bookData.cover_image_url || null,
				uniqueUrl: bookData.unique_url || null,
				category: bookData.category,
				documentNote: bookData.document_note || null,
				summary: bookData.summary || null,
				readwiseUrl: bookData.readwise_url,
				sourceUrl: bookData.source_url || null,
				externalId: bookData.external_id || null,
				asin: bookData.asin || null,
				slug: slug,
				isDeleted: bookData.is_deleted,
			},
		})

		// Process book tags
		if (bookData.book_tags && bookData.book_tags.length > 0) {
			await processTags(bookData.book_tags, book.id, 'book')
		}

		// Process highlights
		for (const highlightData of bookData.highlights) {
			await processHighlight(highlightData, bookData.user_book_id)
		}
	} catch (error) {
		console.error(`Error processing book ${bookData.user_book_id}:`, error)
		throw error
	}
}

async function processHighlight(
	highlightData: ReadwiseHighlight,
	bookUserBookId: number,
) {
	try {
		// Upsert highlight
		const highlight = await prisma.highlight.upsert({
			where: { readwiseId: highlightData.id },
			update: {
				text: highlightData.text,
				location: highlightData.location || null,
				locationType: highlightData.location_type || null,
				note: highlightData.note || null,
				color: highlightData.color || null,
				highlightedAt: highlightData.highlighted_at
					? new Date(highlightData.highlighted_at)
					: null,
				url: highlightData.url || null,
				endLocation: highlightData.end_location || null,
				externalId: highlightData.external_id || null,
				readwiseUrl: highlightData.readwise_url,
				isFavorite: highlightData.is_favorite,
				isDiscard: highlightData.is_discard,
				isDeleted: highlightData.is_deleted,
				updatedAt: new Date(),
			},
			create: {
				readwiseId: highlightData.id,
				text: highlightData.text,
				location: highlightData.location || null,
				locationType: highlightData.location_type || null,
				note: highlightData.note || null,
				color: highlightData.color || null,
				highlightedAt: highlightData.highlighted_at
					? new Date(highlightData.highlighted_at)
					: null,
				url: highlightData.url || null,
				endLocation: highlightData.end_location || null,
				externalId: highlightData.external_id || null,
				readwiseUrl: highlightData.readwise_url,
				isFavorite: highlightData.is_favorite,
				isDiscard: highlightData.is_discard,
				isDeleted: highlightData.is_deleted,
				bookId: bookUserBookId,
			},
		})

		// Process highlight tags
		if (highlightData.tags && highlightData.tags.length > 0) {
			await processTags(highlightData.tags, highlight.id, 'highlight')
		}
	} catch (error) {
		console.error(`Error processing highlight ${highlightData.id}:`, error)
		throw error
	}
}

async function processTags(
	tags: Array<{ id: number; name: string }>,
	entityId: number,
	entityType: 'book' | 'highlight',
) {
	try {
		for (const tagData of tags) {
			// Upsert tag
			const tag = await prisma.tag.upsert({
				where: { name: tagData.name },
				update: {},
				create: { name: tagData.name },
			})

			// Create association
			if (entityType === 'book') {
				await prisma.bookTag.upsert({
					where: {
						bookId_tagId: {
							bookId: entityId,
							tagId: tag.id,
						},
					},
					update: {},
					create: {
						bookId: entityId,
						tagId: tag.id,
					},
				})
			} else {
				await prisma.highlightTag.upsert({
					where: {
						highlightId_tagId: {
							highlightId: entityId,
							tagId: tag.id,
						},
					},
					update: {},
					create: {
						highlightId: entityId,
						tagId: tag.id,
					},
				})
			}
		}
	} catch (error) {
		console.error(`Error processing tags for ${entityType} ${entityId}:`, error)
		throw error
	}
}

export async function GET(request: NextRequest) {
	// Validate API key
	if (!validateApiKey(request)) {
		return createUnauthorizedResponse()
	}

	try {
		// Get recent sync logs
		const recentSyncs = await prisma.syncLog.findMany({
			orderBy: { syncedAt: 'desc' },
			take: 10,
		})

		// Get database stats
		const stats = await Promise.all([
			prisma.book.count(),
			prisma.highlight.count(),
			prisma.tag.count(),
		])

		return NextResponse.json({
			stats: {
				totalBooks: stats[0],
				totalHighlights: stats[1],
				totalTags: stats[2],
			},
			recentSyncs,
		})
	} catch (error) {
		console.error('Error fetching sync status:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch sync status' },
			{ status: 500 },
		)
	}
}
