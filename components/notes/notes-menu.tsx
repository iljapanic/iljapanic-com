import Link from 'next/link'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'

import { HamburgerMenuIcon } from '@radix-ui/react-icons'

import type { Note } from 'contentlayer/generated'
import { allNotes } from 'contentlayer/generated'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export async function NotesMenu({
	currentPageSlug,
}: {
	currentPageSlug: string
}) {
	const notes = await allNotes.filter((note) => note.isPublished)

	const isCurrent = (note: Note) => note.slug === currentPageSlug

	// Sort all notes alphabetically by title
	const sortedNotes = notes.sort((a, b) => a.title.localeCompare(b.title))

	return (
		<aside>
			<h3 className="mb-2 mt-0 md:mb-2">
				<Link
					href="/garden"
					className="font-serif text-sm italic text-foreground/90"
				>
					Garden
				</Link>
			</h3>

			{/* Render all notes as a simple alphabetical list */}
			{sortedNotes.length > 0 && (
				<ul className="space-y-0">
					{sortedNotes.map((note) => (
						<li
							key={note._id}
							className={cn(
								'border-l border-muted py-0.5 pl-2 md:pl-3',
								isCurrent(note) && 'border-brand',
							)}
						>
							<NotesMenuLink
								isCurrent={isCurrent(note)}
								slug={note.slug}
								children={note.title}
								wordCount={note.wordCount}
							/>
						</li>
					))}
				</ul>
			)}
		</aside>
	)
}

function NotesMenuLink({
	isCurrent,
	slug,
	children,
	wordCount,
}: {
	isCurrent: boolean
	slug: string
	children: React.ReactNode
	wordCount: number
}) {
	const getWordCountIndicator = (wordCount: number) => {
		if (wordCount < 100) {
			return '●'
		} else if (wordCount < 300) {
			return '●●'
		} else if (wordCount < 600) {
			return '●●●'
		} else if (wordCount > 1000 && wordCount < 3000) {
			return '●●●●'
		} else if (wordCount > 3000) {
			return '●●●●●'
		}
	}

	return (
		<Link
			href={`/${slug}`}
			className={cn(
				'inline-flex items-center text-xs text-foreground/70 no-underline hover:text-foreground',
				isCurrent && 'text-brand hover:text-brand', // Active state style
			)}
		>
			{children}
			<span className="ml-2 text-[6px] leading-none text-muted-foreground/40">
				{getWordCountIndicator(wordCount)}
			</span>
		</Link>
	)
}

export function NotesMenuMobile({
	currentPageSlug,
}: {
	currentPageSlug: string
}) {
	return (
		<Popover>
			<PopoverTrigger asChild className="z-50">
				<Button
					className="gap-1.5 rounded-full border bg-secondary/85 font-serif italic shadow backdrop-blur-sm"
					size="sm"
					variant="secondary"
				>
					<HamburgerMenuIcon className="h-4 w-4" /> Garden
				</Button>
			</PopoverTrigger>
			<PopoverContent>
				<NotesMenu currentPageSlug={currentPageSlug} />
			</PopoverContent>
		</Popover>
	)
}
