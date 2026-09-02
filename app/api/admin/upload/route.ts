import { NextRequest, NextResponse } from 'next/server'
import { isAllowedEmail } from '@/lib/admin'
import { auth } from '@/lib/auth'
import { buildObjectKey, uploadObject } from '@/lib/storage'

export const runtime = 'nodejs'

// Allowed content types mapped to the canonical extension used in object keys.
const EXTENSION_BY_TYPE: Record<string, string> = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/webp': 'webp',
	'image/svg+xml': 'svg',
	'image/gif': 'gif',
	'image/avif': 'avif',
}
const MAX_SIZE = 4 * 1024 * 1024
const FOLDER_PATTERN = /^[a-z0-9-]{1,32}$/

function badRequest(error: string) {
	return NextResponse.json({ error }, { status: 400 })
}

export async function POST(request: NextRequest) {
	// requireAdmin() redirects; an API route should answer 401 instead.
	const session = await auth.api.getSession({ headers: request.headers })
	if (!session || !isAllowedEmail(session.user.email)) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	let formData: FormData
	try {
		formData = await request.formData()
	} catch {
		return badRequest('Expected multipart form data')
	}

	const file = formData.get('file')
	if (!(file instanceof File)) {
		return badRequest('Missing file')
	}
	const extension = EXTENSION_BY_TYPE[file.type]
	if (!extension) {
		return badRequest(`Unsupported file type: ${file.type || 'unknown'}`)
	}
	if (file.size === 0) {
		return badRequest('File is empty')
	}
	if (file.size > MAX_SIZE) {
		return badRequest('File is larger than 4 MB')
	}

	// `folder` is optional: absent or empty means the default. Anything that is
	// not a string (for example a file part) is rejected.
	const folderValue = formData.get('folder')
	if (folderValue !== null && typeof folderValue !== 'string') {
		return badRequest('Invalid folder')
	}
	const folder = folderValue || 'uploads'
	if (!FOLDER_PATTERN.test(folder)) {
		return badRequest('Invalid folder')
	}

	const key = buildObjectKey({ folder, fileName: file.name, extension })
	const body = new Uint8Array(await file.arrayBuffer())

	try {
		const url = await uploadObject({ key, body, contentType: file.type })
		return NextResponse.json({ url, key }, { status: 201 })
	} catch (error) {
		console.error('Upload failed:', error)
		return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
	}
}
