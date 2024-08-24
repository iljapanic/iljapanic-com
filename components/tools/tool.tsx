import Image from 'next/image'

import { keystaticReader } from '@/lib/keystatic-reader'
import { cn } from '@/lib/utils'

interface ToolProps {
	slug: string
	className?: string
}

export async function Tool({ slug, className }: ToolProps) {
	const tool = await keystaticReader.collections.tools.read(slug)

	const iconSize = 20

	if (!tool) {
		return null
	}

	return (
		<a
			href={tool.url}
			className={cn('block text-inherit no-underline', className)}
			rel="noopener noreferrer"
			target="_blank"
		>
			<div className="-mx-3 rounded-lg px-3 py-3 leading-none text-inherit no-underline opacity-80 hover:bg-muted hover:opacity-100">
				<header className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{tool.simpleIconSlug ? (
							<Image
								height={iconSize}
								width={iconSize}
								src={`https://cdn.simpleicons.org/${tool.simpleIconSlug}`}
								alt={tool.name}
								unoptimized // nextjs doesn't optimize SVGs
							/>
						) : tool.icon ? (
							<Image
								height={iconSize}
								width={iconSize}
								src={tool.icon}
								alt={tool?.name}
							/>
						) : null}

						<h2 className="my-0 font-medium">{tool?.name}</h2>
					</div>
					{tool.type && (
						<div className="flex items-center gap-2">
							{[...tool.type]
								.sort((a, b) => a.localeCompare(b))
								.map((type) => (
									<ToolType key={type} type={type} />
								))}
						</div>
					)}
				</header>
				{tool?.description && <p className="text-sm">{tool.description}</p>}
			</div>
		</a>
	)
}

function ToolType({ type }: { type: string }) {
	const label = (() => {
		switch (type) {
			case 'mac':
				return 'Mac'
			case 'ios':
				return 'iOS'
			case 'chrome':
				return 'Chromium'
			case 'multiplatform':
				return 'Multiplatform'
			default:
				return null
		}
	})()

	const iconClassName = cn(
		'w-4 h-4',
		// type === 'macos' && 'text-[#000]',
		// type === 'ios' && 'text-[#000]',
		// type === 'chrome' && 'text-[#4285F4]',
	)
	return (
		<span className="inline-block text-xs text-muted-foreground">{label}</span>
	)
}
