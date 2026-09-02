import { NextRequest, NextResponse } from 'next/server'
import { runReadwiseSync } from '@/lib/readwise-sync'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: NextRequest) {
	const cronSecret = process.env.CRON_SECRET
	if (!cronSecret) {
		return NextResponse.json(
			{ error: 'CRON_SECRET is not set' },
			{ status: 500 },
		)
	}

	if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		const result = await runReadwiseSync('cron')
		return NextResponse.json(result)
	} catch (error) {
		console.error('Readwise cron sync failed:', error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Sync failed' },
			{ status: 500 },
		)
	}
}
