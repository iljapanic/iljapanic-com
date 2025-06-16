import { NextRequest } from 'next/server'


export function validateApiKey(request: NextRequest): boolean {
  const apiKey = process.env.API_KEY

  if (!apiKey) {
    console.error('API_KEY environment variable is not set')
    return false
  }

  const authHeader = request.headers.get('authorization')
  const providedKey = request.headers.get('x-api-key')

  // Support both Authorization header and x-api-key header
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7) === apiKey
  }

  if (providedKey) {
    return providedKey === apiKey
  }

  return false
}

export function createUnauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
