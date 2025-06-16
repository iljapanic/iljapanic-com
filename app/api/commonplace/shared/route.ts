import { NextRequest, NextResponse } from 'next/server'
import { getCommonplaceData } from '@/app/actions/commonplace'

export async function GET(request: NextRequest) {
	console.log('API route called')

	// Simple API key validation (you should use a proper secret)
	const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '')
	const validApiKey = process.env.COMMONPLACE_API_KEY

	if (!validApiKey || apiKey !== validApiKey) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		const { searchParams } = new URL(request.url)
		const page = parseInt(searchParams.get('page') ?? '1', 10)
		const tagsParam = searchParams.get('tags') ?? ''

		// Parse pipe-delimited tags
		const selectedTags = tagsParam
			? tagsParam.split('|').filter((tag) => tag.trim())
			: []

		console.log('API called with params:', { page, selectedTags })

		const data = await getCommonplaceData(page, selectedTags)

		if (!data) {
			return NextResponse.json(
				{ error: 'Failed to fetch data' },
				{ status: 500 },
			)
		}

		return NextResponse.json(data)
	} catch (error) {
		console.error('API Error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
