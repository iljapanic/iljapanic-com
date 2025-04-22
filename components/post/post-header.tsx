import React from 'react'
import { format, parseISO } from 'date-fns'

import { cn } from '@/lib/utils'

interface PostHeaderProps {
	title: string
	postType?: string
	subtitle?: string
	date?: string
	showDate?: boolean
	asH2?: boolean
	className?: string
}

export function PostHeader({
	title,
	postType,
	subtitle,
	date,
	showDate = false,
	asH2 = false,
	className,
}: PostHeaderProps) {
	return (
		<header className={cn(className)}>
			{showDate && date && (
				<div className="mb-8 font-serif italic text-muted-foreground">
					{postType === 'Note' && 'Last tended in '}
					{postType === 'Article' && 'Published '}
					<time dateTime={date} className="">
						{format(parseISO(date), 'LLLL d, yyyy')}
					</time>
				</div>
			)}

			{(postType === 'Article' || postType === 'Note') && (
				<div className="mb-2 flex items-center gap-4">
					<div className="inline-block rounded-full border border-muted px-2 py-0.5 text-xs font-medium leading-none text-muted-foreground">
						{postType}
					</div>
				</div>
			)}

			{/* title */}
			{asH2 ? (
				<h2 className="mb-0 mt-0">{title}</h2>
			) : (
				<h1 className="mb-0 mt-0">{title}</h1>
			)}

			{/* subtitle (optional) */}
			{subtitle && (
				<p className="mt-2 leading-snug text-muted-foreground">{subtitle}</p>
			)}
		</header>
	)
}
