'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'

export function LoginForm() {
	const [email, setEmail] = useState('')
	const [pending, setPending] = useState(false)
	const [sent, setSent] = useState(false)

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setPending(true)

		const { error } = await authClient.signIn.magicLink({
			email,
			callbackURL: '/admin',
			errorCallbackURL: '/admin/login?error=1',
		})

		setPending(false)

		if (error) {
			toast.error(error.message ?? 'Something went wrong')
			return
		}

		setSent(true)
	}

	if (sent) {
		return (
			<p className="text-sm">
				If that address is allowed, a sign-in link is on its way.
			</p>
		)
	}

	return (
		<form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-3">
			<label htmlFor="email" className="text-sm text-muted-foreground">
				Email
			</label>
			<Input
				id="email"
				name="email"
				type="email"
				autoComplete="email"
				required
				value={email}
				onChange={(event) => setEmail(event.target.value)}
				disabled={pending}
			/>
			<Button type="submit" disabled={pending}>
				{pending ? 'Sending…' : 'Send sign-in link'}
			</Button>
		</form>
	)
}
