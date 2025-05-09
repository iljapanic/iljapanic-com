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

	// Group notes by directory path
	const groupedNotes = notes.reduce(
		(acc, note) => {
			const key = note.directoryPath || '_root'
			if (!acc[key]) {
				acc[key] = []
			}
			// TODO: Address potential type mismatch here if linter error persists from Post component
			acc[key].push(note)
			return acc
		},
		{} as Record<string, Note[]>,
	)

	// Sort notes within each group alphabetically by title
	Object.keys(groupedNotes).forEach((key) => {
		groupedNotes[key].sort((a, b) => a.title.localeCompare(b.title))
	})

	// Separate root notes and directory keys
	const rootNotes = groupedNotes['_root'] || []
	const directoryKeys = Object.keys(groupedNotes)
		.filter((key) => key !== '_root')
		.sort((a, b) => a.localeCompare(b)) // Sort directory keys alphabetically

	// Find the current note to determine default open accordion item
	// const currentNote = notes.find((note) => isCurrent(note))
	// const defaultValue = currentNote?.directoryPath // Use directory path as default value

	return (
		<aside>
			<h3 className="mb-4 mt-0">
				<Link
					href="/garden"
					className="font-serif text-sm italic text-foreground/90"
				>
					Garden
				</Link>
			</h3>
			{/* Render root notes as plain links */}
			{rootNotes.length > 0 && (
				<ul className="space-y-2">
					{rootNotes.map((note) => (
						<li key={note._id}>
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

			{/* Render directories and their notes */}
			{directoryKeys.length > 0 && (
				<div className="mt-2 w-full">
					{directoryKeys.map((key) => {
						const groupNotes = groupedNotes[key]
						return (
							<div key={key} className="mb-2">
								<div className="text-xs font-medium text-foreground/80">
									{key}
								</div>
								<ul className="ml-2 mt-1">
									{groupNotes.map((note) => (
										<li
											key={note._id}
											className={cn(
												'border-l border-muted py-0.5 pl-3',
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
							</div>
						)
					})}
				</div>
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
				'text-xs text-foreground/70 no-underline hover:text-foreground',
				isCurrent && 'text-brand hover:text-brand', // Active state style
			)}
		>
			{children}
			<span className="ml-2 text-[9px] text-muted-foreground/40">
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
			<PopoverTrigger asChild>
				<Button
					className="gap-1.5 rounded-full font-serif italic shadow-lg"
					size="sm"
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
