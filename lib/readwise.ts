interface ReadwiseHighlight {
	id: number
	is_deleted: boolean
	text: string
	location: number
	location_type: string
	note: string | null
	color: string
	highlighted_at: string
	created_at: string
	updated_at: string
	external_id: string | null
	end_location: number | null
	url: string | null
	book_id: number
	tags: Array<{ id: number; name: string }>
	is_favorite: boolean
	is_discard: boolean
	readwise_url: string
}

interface ReadwiseBook {
	user_book_id: number
	is_deleted: boolean
	title: string
	author: string
	readable_title: string
	source: string
	cover_image_url: string
	unique_url: string
	book_tags: Array<{ id: number; name: string }>
	category: string
	document_note: string
	summary: string
	readwise_url: string
	source_url: string
	external_id: string | null
	asin: string | null
	highlights: ReadwiseHighlight[]
}

interface ReadwiseExportResponse {
	count: number
	nextPageCursor: string | null
	results: ReadwiseBook[]
}

export class ReadwiseClient {
	private token: string
	private baseUrl = 'https://readwise.io/api/v2'

	constructor(token: string) {
		this.token = token
	}

	async validateToken(): Promise<boolean> {
		try {
			const response = await fetch(`${this.baseUrl}/auth/`, {
				method: 'GET',
				headers: {
					Authorization: `Token ${this.token}`,
				},
			})
			return response.status === 204
		} catch (error) {
			console.error('Failed to validate Readwise token:', error)
			return false
		}
	}

	async exportHighlights(updatedAfter?: string): Promise<ReadwiseBook[]> {
		const allData: ReadwiseBook[] = []
		let nextPageCursor: string | null = null

		do {
			const params = new URLSearchParams()
			if (nextPageCursor) {
				params.append('pageCursor', nextPageCursor)
			}
			if (updatedAfter) {
				params.append('updatedAfter', updatedAfter)
			}

			const url = `${this.baseUrl}/export/?${params.toString()}`

			try {
				const response = await fetch(url, {
					method: 'GET',
					headers: {
						Authorization: `Token ${this.token}`,
					},
				})

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`)
				}

				const data: ReadwiseExportResponse = await response.json()
				allData.push(...data.results)
				nextPageCursor = data.nextPageCursor

				// Add a small delay to be respectful to the API
				if (nextPageCursor) {
					await new Promise((resolve) => setTimeout(resolve, 100))
				}
			} catch (error) {
				console.error('Error fetching from Readwise export API:', error)
				throw error
			}
		} while (nextPageCursor)

		return allData
	}
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
