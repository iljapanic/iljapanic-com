// Readwise API v2 client. This module is imported by a client component
// (`components/commonplace/commonplace-item.tsx`), so it must stay free of
// Node-only and database imports.

const BASE_URL = 'https://readwise.io/api/v2'
const EXPORT_CHUNK_SIZE = 50
const MAX_RETRIES = 3

export interface ReadwiseTag {
	id: number
	name: string
}

// Item from GET /api/v2/books/
export interface ReadwiseBookSummary {
	id: number
	title: string
	author: string | null
	category: string
	source: string
	num_highlights: number
	last_highlight_at: string | null
	updated: string | null
	cover_image_url: string | null
	source_url: string | null
	asin: string | null
	tags: ReadwiseTag[]
	document_note: string | null
}

interface ReadwiseBooksResponse {
	count: number
	next: string | null
	previous: string | null
	results: ReadwiseBookSummary[]
}

// Highlight from GET /api/v2/export/
interface ReadwiseHighlight {
	id: number
	is_deleted: boolean
	text: string
	location: number | null
	location_type: string | null
	note: string | null
	color: string | null
	highlighted_at: string | null
	created_at: string | null
	updated_at: string | null
	external_id: string | null
	end_location: number | null
	url: string | null
	book_id: number
	tags: ReadwiseTag[]
	is_favorite: boolean
	is_discard: boolean
	readwise_url: string
}

// Book from GET /api/v2/export/
interface ReadwiseBook {
	user_book_id: number
	is_deleted: boolean
	title: string
	author: string | null
	readable_title: string | null
	source: string
	cover_image_url: string | null
	unique_url: string | null
	book_tags: ReadwiseTag[]
	category: string
	document_note: string | null
	summary: string | null
	readwise_url: string
	source_url: string | null
	external_id: string | null
	asin: string | null
	highlights: ReadwiseHighlight[]
}

export type ReadwiseExportBook = ReadwiseBook

interface ReadwiseExportResponse {
	count: number
	nextPageCursor: string | null
	results: ReadwiseBook[]
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function readwiseFetch<T>(url: string, token: string): Promise<T> {
	for (let attempt = 0; ; attempt++) {
		const response = await fetch(url, {
			method: 'GET',
			headers: { Authorization: `Token ${token}` },
		})

		if (response.status === 429) {
			if (attempt >= MAX_RETRIES) {
				throw new Error(
					`Readwise request failed with status 429 after ${MAX_RETRIES} retries: ${url}`,
				)
			}
			const retryAfter = Number(response.headers.get('Retry-After')) || 60
			await sleep(retryAfter * 1000)
			continue
		}

		if (!response.ok) {
			throw new Error(
				`Readwise request failed with status ${response.status}: ${url}`,
			)
		}

		return (await response.json()) as T
	}
}

export async function listBooks(token: string): Promise<ReadwiseBookSummary[]> {
	const books: ReadwiseBookSummary[] = []
	let url: string | null = `${BASE_URL}/books/?page_size=1000`

	while (url) {
		const data: ReadwiseBooksResponse = await readwiseFetch(url, token)
		books.push(...data.results)
		url = data.next
	}

	return books
}

export async function exportBooks(
	token: string,
	ids: number[],
): Promise<ReadwiseExportBook[]> {
	const books: ReadwiseExportBook[] = []

	for (let i = 0; i < ids.length; i += EXPORT_CHUNK_SIZE) {
		const chunk = ids.slice(i, i + EXPORT_CHUNK_SIZE)
		let cursor: string | null = null

		do {
			const params = new URLSearchParams({
				ids: chunk.join(','),
				includeDeleted: 'true',
			})
			if (cursor) {
				params.set('pageCursor', cursor)
			}
			const data: ReadwiseExportResponse = await readwiseFetch(
				`${BASE_URL}/export/?${params.toString()}`,
				token,
			)
			books.push(...data.results)
			cursor = data.nextPageCursor
		} while (cursor)
	}

	return books
}

export async function validateToken(token: string): Promise<boolean> {
	try {
		const response = await fetch(`${BASE_URL}/auth/`, {
			method: 'GET',
			headers: { Authorization: `Token ${token}` },
		})
		return response.status === 204
	} catch (error) {
		console.error('Failed to validate Readwise token:', error)
		return false
	}
}

// Tag contract shared by the sync job and the commonplace queries:
// `name` is the stored, URL-safe form; `label` is what gets displayed.
export function normalizeTagName(input: string): string {
	return input.trim().toLowerCase().replace(/\s+/g, '-')
}

export function tagLabel(name: string): string {
	return name.replace(/-/g, ' ')
}

export function getCategoryLabel(category: string): string {
	switch (category) {
		case 'books':
			return 'Book'
		case 'articles':
			return 'Article'
		case 'podcasts':
			return 'Podcast'
		case 'tweets':
			return 'Tweet'
		case 'videos':
			return 'Video'
		default:
			return category
	}
}

export type { ReadwiseBook, ReadwiseHighlight }
