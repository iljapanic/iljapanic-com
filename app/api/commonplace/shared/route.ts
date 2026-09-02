import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, createUnauthorizedResponse } from '@/app/api/api-auth'
import { getCommonplaceData } from '@/app/actions/commonplace'

export async function GET(request: NextRequest) {
	if (!validateApiKey(request)) {
		return createUnauthorizedResponse()
	}

	try {
		const { searchParams } = new URL(request.url)
		const page = parseInt(searchParams.get('page') ?? '1', 10)
		const tagsParam = searchParams.get('tags') ?? ''

		// Parse pipe-delimited tags
		const selectedTags = tagsParam
			? tagsParam.split('|').filter((tag) => tag.trim())
			: []

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
