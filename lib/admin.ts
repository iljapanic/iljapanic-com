// Server-side module: it reads request headers and the auth instance.
// The guard package is not installed, so never import this from a client component.
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export function getAdminEmail(): string {
	const email = process.env.ADMIN_EMAIL
	if (!email) {
		throw new Error('ADMIN_EMAIL is not set')
	}
	return email.trim().toLowerCase()
}

export function isAllowedEmail(email: string): boolean {
	return email.trim().toLowerCase() === getAdminEmail()
}

export async function requireAdmin() {
	const session = await auth.api.getSession({ headers: await headers() })

	if (!session || !isAllowedEmail(session.user.email)) {
		redirect('/admin/login')
	}

	return session
}
