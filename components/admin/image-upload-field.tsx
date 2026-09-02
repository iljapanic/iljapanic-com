'use client'

import Image from 'next/image'
import { useId, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type ImageUploadFieldProps = {
	name: string
	value?: string | null
	onChange?: (url: string | null) => void
	folder?: string
	label?: string
}

export function ImageUploadField({
	name,
	value,
	onChange,
	folder = 'uploads',
	label = 'Image',
}: ImageUploadFieldProps) {
	const id = useId()
	const inputRef = useRef<HTMLInputElement>(null)
	const [url, setUrl] = useState<string | null>(value ?? null)
	const [pending, setPending] = useState(false)

	function update(next: string | null) {
		setUrl(next)
		onChange?.(next)
	}

	async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0]
		if (!file) return

		setPending(true)

		const body = new FormData()
		body.append('file', file)
		body.append('folder', folder)

		try {
			const response = await fetch('/api/admin/upload', {
				method: 'POST',
				body,
			})
			const data = await response.json().catch(() => null)

			if (!response.ok) {
				toast.error(data?.error ?? `Upload failed (${response.status})`)
				return
			}

			update(data.url)
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Upload failed')
		} finally {
			setPending(false)
			if (inputRef.current) inputRef.current.value = ''
		}
	}

	function handleRemove() {
		update(null)
		if (inputRef.current) inputRef.current.value = ''
	}

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={id} className="text-sm text-muted-foreground">
				{label}
			</label>
			<input type="hidden" name={name} value={url ?? ''} />

			{url && (
				<div className="flex items-center gap-3">
					<Image
						src={url}
						alt=""
						width={96}
						height={96}
						className="h-24 w-24 rounded-md border object-contain"
					/>
					<div className="flex min-w-0 flex-col gap-2">
						<span className="truncate text-xs text-muted-foreground">
							{url}
						</span>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleRemove}
							disabled={pending}
						>
							Remove
						</Button>
					</div>
				</div>
			)}

			<input
				ref={inputRef}
				id={id}
				type="file"
				accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/avif"
				onChange={handleFileChange}
				disabled={pending}
				className="text-sm file:mr-3 file:rounded-md file:border file:bg-background file:px-3 file:py-1 file:text-sm"
			/>
			{pending && <p className="text-sm text-muted-foreground">Uploading…</p>}
		</div>
	)
}
