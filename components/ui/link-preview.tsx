'use client'

import Microlink from '@microlink/react'

export function LinkPreview({ url }: { url: string }) {
	return <Microlink url={url} size="small" />
}
