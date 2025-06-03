'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'

import { Cross as Hamburger } from 'hamburger-react'

import { cn } from '@/lib/utils'
import type { Note } from 'contentlayer/generated'

function getWordCountIndicator(wordCount: number): string {
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
	return ''
}

function isCurrent(note: Note, currentPageSlug: string) {
	return note.slug === currentPageSlug
}

export function NotesMenu({
	currentPageSlug,
	notes,
}: {
	currentPageSlug: string
	notes: Note[]
}) {
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
						<Link
							href={`/${note.slug}`}
							className={cn(
								'flex items-center border-l py-1.5 pl-2 text-xs text-foreground/70 no-underline hover:text-foreground',
								isCurrent(note, currentPageSlug) &&
									'border-brand text-brand hover:text-brand', // Active state style
							)}
						>
							{note.title}
							<span className="ml-2 text-[6px] leading-none text-muted-foreground/40">
								{getWordCountIndicator(note.wordCount)}
							</span>
						</Link>
					))}
				</ul>
			)}
		</aside>
	)
}

export function NotesMenuMobile({
	currentPageSlug,
	notes,
}: {
	currentPageSlug: string
	notes: Note[]
}) {
	// Sort all notes alphabetically by title
	const sortedNotes = notes.sort((a, b) => a.title.localeCompare(b.title))

	const [isOpen, setIsOpen] = useState(false)

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild className="z-50">
				<button
					className={cn(
						'inline-flex w-fit items-center rounded-full pl-1 pr-3 font-serif text-sm italic text-primary-foreground shadow backdrop-blur-sm transition-colors',
						isOpen ? 'bg-primary/75' : 'bg-primary/90',
					)}
				>
					<div className="-m-2.5">
						<Hamburger
							toggled={isOpen}
							toggle={setIsOpen}
							size={14}
							duration={0.3}
						/>
					</div>
					Garden
				</button>
			</PopoverTrigger>
			<PopoverContent className="mb-2 w-[58vw]">
				<aside>
					<h3 className="mb-2 mt-0">
						<Link
							href="/garden"
							className="font-serif text-sm italic text-foreground/90"
						>
							Garden
						</Link>
					</h3>
					{sortedNotes.length > 0 && (
						<ul className="space-y-1.5">
							{sortedNotes.map((note) => (
								<Link
									href={`/${note.slug}`}
									className={cn(
										'flex items-center justify-between text-xs text-foreground/70 no-underline hover:text-foreground',
										isCurrent(note, currentPageSlug) &&
											'text-brand hover:text-brand', // Active state style
									)}
								>
									{note.title}
									<div className="text-[6px] leading-none text-muted-foreground/40">
										{getWordCountIndicator(note.wordCount)}
									</div>
								</Link>
							))}
						</ul>
					)}
				</aside>
			</PopoverContent>
		</Popover>
	)
}
