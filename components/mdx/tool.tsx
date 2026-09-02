import Image from 'next/image'

import { getToolBySlug } from '@/lib/tools'
import { cn } from '@/lib/utils'

interface ToolProps {
	slug: string
	iconSize?: number
	inline?: boolean
}

export async function Tool({ slug, iconSize = 20, inline = false }: ToolProps) {
	const tool = await getToolBySlug(slug)

	if (!tool) {
		return null
	}

	return (
		<a
			href={tool.url}
			className={cn(
				'text-inherit no-underline',
				inline ? 'inline-block' : 'my-1.5 block',
			)}
			rel="noopener noreferrer"
			target="_blank"
		>
			<span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2 py-1 leading-none text-inherit no-underline opacity-80 hover:opacity-100">
				{tool.simpleIconSlug ? (
					<Image
						height={iconSize}
						width={iconSize}
						src={`https://cdn.simpleicons.org/${tool.simpleIconSlug}`}
						alt={tool.name}
						unoptimized // nextjs doesn't optimize SVGs
					/>
				) : tool.iconUrl ? (
					<Image
						height={iconSize}
						width={iconSize}
						src={tool.iconUrl}
						alt={tool.name}
					/>
				) : null}

				{tool.name}
			</span>
		</a>
	)
}
