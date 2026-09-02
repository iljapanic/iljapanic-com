'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { triggerReadwiseSync } from '@/app/admin/(protected)/actions'
import { Button } from '@/components/ui/button'

export function SyncButton() {
	const router = useRouter()
	const [pending, startTransition] = useTransition()

	function handleClick() {
		startTransition(async () => {
			const result = await triggerReadwiseSync()

			if (result.ok) {
				toast.success(
					`${result.bookCount} books, ${result.highlightCount} highlights`,
				)
			} else {
				toast.error(result.message)
			}

			router.refresh()
		})
	}

	return (
		<Button onClick={handleClick} disabled={pending}>
			{pending ? 'Syncing…' : 'Run sync now'}
		</Button>
	)
}
