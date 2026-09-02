import { NextRequest, NextResponse } from 'next/server'
import { count, desc } from 'drizzle-orm'
import { validateApiKey, createUnauthorizedResponse } from '@/app/api/api-auth'
import { db } from '@/db'
import {
	readwiseBooks,
	readwiseHighlights,
	readwiseSyncRuns,
	readwiseTags,
} from '@/db/schema'
import { runReadwiseSync } from '@/lib/readwise-sync'

export const maxDuration = 300

export async function POST(request: NextRequest) {
	if (!validateApiKey(request)) {
		return createUnauthorizedResponse()
	}

	try {
		const result = await runReadwiseSync('manual')
		return NextResponse.json(result)
	} catch (error) {
		console.error('Readwise manual sync failed:', error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Sync failed' },
			{ status: 500 },
		)
	}
}

export async function GET(request: NextRequest) {
	if (!validateApiKey(request)) {
		return createUnauthorizedResponse()
	}

	try {
		const [[books], [highlights], [tags], recentRuns] = await Promise.all([
			db.select({ value: count() }).from(readwiseBooks),
			db.select({ value: count() }).from(readwiseHighlights),
			db.select({ value: count() }).from(readwiseTags),
			db
				.select()
				.from(readwiseSyncRuns)
				.orderBy(desc(readwiseSyncRuns.startedAt))
				.limit(10),
		])

		return NextResponse.json({
			stats: {
				totalBooks: books.value,
				totalHighlights: highlights.value,
				totalTags: tags.value,
			},
			recentRuns,
		})
	} catch (error) {
		console.error('Error fetching sync status:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch sync status' },
			{ status: 500 },
		)
	}
}
