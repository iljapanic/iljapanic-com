'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TagWithCount } from '@/app/actions/commonplace'
import { Button } from '@/components/ui/button'

interface TagCloudProps {
	availableTags: TagWithCount[]
	selectedTags: string[]
}

export function TagCloud({ availableTags, selectedTags }: TagCloudProps) {
	const [showAllTags, setShowAllTags] = useState(false)
	const router = useRouter()
	const searchParams = useSearchParams()

	const handleTagToggle = (tagName: string) => {
		const newTags = selectedTags.includes(tagName)
			? selectedTags.filter((t) => t !== tagName)
			: [...selectedTags, tagName]

		// Create new search params
		const params = new URLSearchParams(searchParams.toString())

		// Remove page parameter when changing tags
		params.delete('page')

		// Update tags parameter using pipe delimiter
		if (newTags.length === 0) {
			params.delete('tags')
		} else {
			params.set('tags', newTags.join('|'))
		}

		// Navigate with new parameters
		const queryString = params.toString()
		router.push(`/commonplace${queryString ? `?${queryString}` : ''}`)
	}

	const handleClearAll = () => {
		// Create new search params without tags or page
		const params = new URLSearchParams(searchParams.toString())
		params.delete('tags')
		params.delete('page')

		const queryString = params.toString()
		router.push(`/commonplace${queryString ? `?${queryString}` : ''}`)
	}

	// Create active filter tags with display names and counts (if available)
	const activeFilterTags = selectedTags.map((tag) => {
		// Try to find count from previous filtering state if available
		// For active tags, we don't have accurate current counts, so just show the tag
		return {
			name: tag,
			displayName: tag.replace(/-/g, ' '),
			count: 0, // We don't show counts for active tags since they're not meaningful
			isActive: true,
		}
	})

	// Available tags for further filtering
	const availableFilterTags = availableTags.map((tag) => ({
		...tag,
		isActive: false,
	}))

	// Combine active and available tags
	const allTags = [...activeFilterTags, ...availableFilterTags]

	// Determine which tags to show
	const visibleTags = showAllTags ? allTags : allTags.slice(0, 10)
	const hasMoreTags = allTags.length > 10

	if (allTags.length === 0) {
		return null
	}

	return (
		<div>
			<div className="flex items-center justify-between">
				<h3 className="my-0 text-sm font-medium text-muted-foreground">
					{selectedTags.length > 0
						? `Filters (${selectedTags.length})`
						: 'Filters'}
				</h3>

				<div
					className={cn(
						'transition-opacity',
						selectedTags.length > 0 ? 'opacity-100' : 'opacity-0',
					)}
				>
					<Button onClick={handleClearAll} variant="ghost" size="xs">
						Clear all
					</Button>
				</div>
			</div>

			<div className="mt-2 space-y-2">
				<div className="flex flex-wrap gap-2">
					{visibleTags.map((tag) => (
						<button
							key={`${tag.isActive ? 'active' : 'available'}-${tag.name}`}
							onClick={() => handleTagToggle(tag.name)}
							className={cn(
								'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
								tag.isActive
									? 'border-primary bg-primary text-primary-foreground hover:bg-primary/80'
									: 'border-border bg-background hover:bg-muted',
							)}
						>
							{tag.displayName}
							{!tag.isActive && tag.count > 0 && ` (${tag.count})`}
							{tag.isActive && <X className="h-3 w-3" />}
						</button>
					))}
				</div>

				<div className="mt-2">
					{hasMoreTags && !showAllTags && (
						<Button
							onClick={() => setShowAllTags(true)}
							variant="ghost"
							size="xs"
						>
							Show all tags
						</Button>
					)}

					{showAllTags && hasMoreTags && (
						<Button
							onClick={() => setShowAllTags(false)}
							variant="ghost"
							size="xs"
						>
							Show less
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}
