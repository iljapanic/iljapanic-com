import React from 'react'
import Image from 'next/image'

import type { Book as BookRecord } from '@/lib/books'
import { cn } from '@/lib/utils'

interface BookProps {
	book: BookRecord
	className?: string
}

export function Book({ book, className }: BookProps) {
	return (
		<article className={cn('group', className)}>
			<a
				href={book.url}
				target="_blank"
				rel="noreferrer"
				className="no-underline"
			>
				{book.coverUrl && (
					<div>
						<Image
							src={book.coverUrl}
							width={100}
							height={100}
							alt={book.title}
							className="w-full opacity-80 saturate-[0.75] transition-all duration-300 group-hover:opacity-100 group-hover:saturate-100 dark:saturate-[0.6]"
						/>
					</div>
				)}

				<h3 className="mb-1 mt-1.5 text-xs leading-tight text-foreground/70">
					{book.title}
				</h3>

				{/* authors */}
				{book.author && (
					<div className="text-xs text-muted-foreground">{book.author}</div>
				)}
			</a>
		</article>
	)
}
