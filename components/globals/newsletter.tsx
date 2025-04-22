'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function Newsletter({ className }: { className?: string }) {
	const [email, setEmail] = useState('')
	const [status, setStatus] = useState<
		'idle' | 'subscribing' | 'subscribed' | 'error'
	>('idle')
	const [errorMessage, setErrorMessage] = useState('')

	const isValidEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		return emailRegex.test(email.trim())
	}

	const isEmailValid = isValidEmail(email)

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setStatus('subscribing')
		setErrorMessage('')

		try {
			const formData = new FormData(e.currentTarget)
			const response = await fetch(
				'https://buttondown.email/api/emails/embed-subscribe/iljapanic',
				{
					method: 'POST',
					body: formData,
				},
			)

			if (response.ok) {
				setStatus('subscribed')
				setEmail('')
			} else {
				const data = await response.json()
				throw new Error(data.message || 'Something went wrong')
			}
		} catch (error) {
			setStatus('error')
			setErrorMessage(
				error instanceof Error ? error.message : 'An unexpected error occurred',
			)
		}
	}

	return (
		<div className={cn(className)}>
			<p>
				Occasional updates and musings about people, design and technology.
			</p>
			<form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
				<div className="flex gap-2">
					<Input
						type="email"
						name="email"
						id="bd-email"
						placeholder="your email"
						className="h-9"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						disabled={status === 'subscribing'}
					/>
					<Button
						type="submit"
						variant="default"
						size="sm"
						disabled={status === 'subscribing' || !isEmailValid}
					>
						{status === 'subscribing' ? 'Subscribing...' : 'Subscribe'}
					</Button>
				</div>
				{status === 'subscribed' && (
					<p className="text-sm text-success-foreground">
						You are subscribed! Please check your email to confirm the
						subscription.
					</p>
				)}
				{status === 'error' && (
					<p className="text-destructive-foreground">{errorMessage}</p>
				)}
			</form>
		</div>
	)
}
