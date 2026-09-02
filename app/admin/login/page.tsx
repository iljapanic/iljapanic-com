import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/admin/login-form'
import { isAllowedEmail } from '@/lib/admin'
import { auth } from '@/lib/auth'

export const metadata = {
	title: 'Sign in',
}

export default async function AdminLoginPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string | string[] }>
}) {
	const session = await auth.api.getSession({ headers: await headers() })

	if (session && isAllowedEmail(session.user.email)) {
		redirect('/admin')
	}

	const { error } = await searchParams

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-2xl font-medium">Admin sign in</h1>
			{error && (
				<p className="text-sm text-muted-foreground">
					That link is invalid or has expired.
				</p>
			)}
			<LoginForm />
		</div>
	)
}
