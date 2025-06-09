'use client'

import Markdown from 'markdown-to-jsx'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function ResumeItemDescription({
	description,
}: {
	description: string
	maxLines: number
}) {
	const [isExpanded, setIsExpanded] = useState(false)

	const toggleExpand = () => {
		setIsExpanded((prevIsExpanded) => !prevIsExpanded)
	}

	return (
		<div className="text-sm leading-snug">
			<Markdown
				className={cn('inline', !isExpanded && 'line-clamp-2')}
				options={{
					overrides: {
						a: {
							props: {
								target: '_blank',
								rel: 'noopener noreferrer',
							},
						},
					},
				}}
			>
				{description}
			</Markdown>{' '}
			<button
				onClick={toggleExpand}
				className="inline font-serif font-medium italic text-muted-foreground"
			>
				{isExpanded ? 'Read less' : 'Read more'}
			</button>
		</div>
	)
}
