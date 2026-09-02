'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export function AdminNav({ email }: { email: string }) {
	const router = useRouter()

	async function handleSignOut() {
		await authClient.signOut()
		router.push('/admin/login')
		router.refresh()
	}

	return (
		<nav className="mb-8 flex items-center justify-between border-b pb-4 text-sm">
			<div className="flex items-center gap-4">
				<Link href="/admin" className="font-medium">
					Admin
				</Link>
				<Link href="/admin/tools">Tools</Link>
				<Link href="/admin/books">Books</Link>
			</div>
			<div className="flex items-center gap-3">
				<span className="text-muted-foreground">{email}</span>
				<Button variant="outline" size="sm" onClick={handleSignOut}>
					Sign out
				</Button>
			</div>
		</nav>
	)
}
