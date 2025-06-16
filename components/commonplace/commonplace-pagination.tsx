'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination'

interface CommonplacePaginationProps {
	currentPage: number
	totalPages: number
	hasNextPage: boolean
	hasPreviousPage: boolean
}

export function CommonplacePagination({
	currentPage,
	totalPages,
	hasNextPage,
	hasPreviousPage,
}: CommonplacePaginationProps) {
	const searchParams = useSearchParams()

	const createPageUrl = (page: number) => {
		const params = new URLSearchParams(searchParams.toString())
		params.set('page', page.toString())
		return `/commonplace?${params.toString()}`
	}

	const getVisiblePages = () => {
		const delta = 2
		const range = []
		const rangeWithDots = []

		for (
			let i = Math.max(2, currentPage - delta);
			i <= Math.min(totalPages - 1, currentPage + delta);
			i++
		) {
			range.push(i)
		}

		if (currentPage - delta > 2) {
			rangeWithDots.push(1, '...')
		} else {
			rangeWithDots.push(1)
		}

		rangeWithDots.push(...range)

		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push('...', totalPages)
		} else if (totalPages > 1) {
			rangeWithDots.push(totalPages)
		}

		return rangeWithDots
	}

	const visiblePages = getVisiblePages()

	return (
		<Pagination>
			<PaginationContent>
				{hasPreviousPage && (
					<PaginationItem>
						<Link href={createPageUrl(currentPage - 1)} passHref legacyBehavior>
							<PaginationPrevious />
						</Link>
					</PaginationItem>
				)}

				{visiblePages.map((page, index) =>
					typeof page === 'number' ? (
						<PaginationItem key={page}>
							<Link href={createPageUrl(page)} passHref legacyBehavior>
								<PaginationLink isActive={page === currentPage}>
									{page}
								</PaginationLink>
							</Link>
						</PaginationItem>
					) : (
						<PaginationItem key={`ellipsis-${index}`}>
							<PaginationEllipsis />
						</PaginationItem>
					),
				)}

				{hasNextPage && (
					<PaginationItem>
						<Link href={createPageUrl(currentPage + 1)} passHref legacyBehavior>
							<PaginationNext />
						</Link>
					</PaginationItem>
				)}
			</PaginationContent>
		</Pagination>
	)
}
