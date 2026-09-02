import { timingSafeEqual } from 'crypto'
import { NextRequest } from 'next/server'

function safeEqual(provided: string, expected: string): boolean {
	const providedBuffer = Buffer.from(provided)
	const expectedBuffer = Buffer.from(expected)

	if (providedBuffer.length !== expectedBuffer.length) {
		return false
	}

	return timingSafeEqual(providedBuffer, expectedBuffer)
}

export function validateApiKey(request: NextRequest): boolean {
	const apiKey = process.env.API_KEY

	if (!apiKey) {
		throw new Error('API_KEY is not set')
	}

	const authHeader = request.headers.get('authorization')
	const providedKey = request.headers.get('x-api-key')

	// Support both Authorization header and x-api-key header
	if (authHeader && authHeader.startsWith('Bearer ')) {
		return safeEqual(authHeader.slice(7), apiKey)
	}

	if (providedKey) {
		return safeEqual(providedKey, apiKey)
	}

	return false
}

export function createUnauthorizedResponse() {
	return new Response(JSON.stringify({ error: 'Unauthorized' }), {
		status: 401,
		headers: { 'Content-Type': 'application/json' },
	})
}
