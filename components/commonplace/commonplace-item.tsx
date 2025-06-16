'use client'

import { format } from 'date-fns'
import Link from 'next/link'
import { useState } from 'react'
import { CommonplaceBook } from '@/app/actions/commonplace'
import Markdown from 'markdown-to-jsx'

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { ExternalLink, MessageSquareMore, StickyNote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCategoryLabel } from '@/lib/readwise'
import { TagCloud } from '@/components/commonplace/tag-cloud'

interface CommonplaceItemProps {
	book: CommonplaceBook
	isCollapsed?: boolean
}

export function CommonplaceItem({
	book,
	isCollapsed = true,
}: CommonplaceItemProps) {
	const [collapsed, setCollapsed] = useState(isCollapsed)

	return (
		<article className="rounded bg-card p-4 shadow-sm">
			{/* Book Header */}
			<header>
				<div className="flex items-center justify-between gap-4">
					{book.coverImageUrl && (
						<div className="shrink-0">
							<img
								src={book.coverImageUrl}
								alt={book.title}
								className="size-16 rounded object-cover"
							/>
						</div>
					)}
					<div className="flex-1">
						<h3 className="my-0">
							{book.sourceUrl ? (
								<a
									href={book.sourceUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									{book.title}
									<ExternalLink className="ml-2 inline-block size-3 text-muted-foreground" />
								</a>
							) : (
								book.title
							)}
						</h3>
						<div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
							{book.author && (
								<p className="mt-0">
									{book.category && <>{getCategoryLabel(book.category)} </>}by{' '}
									{book.author}
								</p>
							)}

							{book.highlights.length > 0 && (
								<>
									<span>•</span>
									<span>
										<Link
											href={`/commonplace/${book.slug}`}
											className="text-current no-underline"
										>
											{book.highlights.length} highlights
										</Link>
									</span>
								</>
							)}
						</div>
					</div>
				</div>
			</header>

			{/* Highlights */}
			{book.highlights.length > 0 && (
				<div className="mt-6 space-y-4">
					{(collapsed ? book.highlights.slice(0, 3) : book.highlights).map(
						(highlight) => (
							<div key={highlight.id}>
								<blockquote className="my-0">
									<Markdown
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
										{highlight.text}
									</Markdown>
									{highlight.note && (
										<Popover>
											<PopoverTrigger asChild className="cursor-pointer">
												<MessageSquareMore className="mb-1.5 ml-2 inline-block size-4 text-foreground" />
											</PopoverTrigger>
											<PopoverContent>
												<p className="my-0 text-sm">{highlight.note}</p>
											</PopoverContent>
										</Popover>
									)}
								</blockquote>
							</div>
						),
					)}
					{collapsed && book.highlights.length > 3 && (
						<div className="pl-4">
							<button
								onClick={() => setCollapsed(false)}
								className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
							>
								Show all highlights ({book.highlights.length})
							</button>
						</div>
					)}
				</div>
			)}

			{book.tags.length > 0 && (
				<div className="mt-6 flex flex-wrap gap-2">
					{book.tags
						.filter((tag) => tag.toLowerCase() !== '@share')
						.map((tag, index, filteredTags) => (
							<Link
								key={tag}
								href={`/commonplace?tags=${tag}`}
								className="inline-block text-xs text-muted-foreground no-underline hover:text-foreground"
							>
								#{tag.replace(/\s+/g, '-')}
							</Link>
						))}
				</div>
			)}
		</article>
	)
}
