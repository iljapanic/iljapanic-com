import { parseAsInteger, parseAsString } from 'nuqs/server'
import { PostHeader } from '@/components/post/post-header'
import { CommonplaceItem } from '@/components/commonplace/commonplace-item'
import { CommonplacePagination } from '@/components/commonplace/commonplace-pagination'
import { TagCloud } from '@/components/commonplace/tag-cloud'
import { getCommonplaceData, getAvailableTags } from '@/app/actions/commonplace'

const title = 'Commonplace'
const subtitle = 'A collection of highlights from my reading'

export const metadata = {
	title: title,
	description: subtitle,
}

export default async function Page({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined }
}) {
	const page = parseAsInteger.withDefault(1).parseServerSide(searchParams.page)
	const tagsParam = parseAsString
		.withDefault('')
		.parseServerSide(searchParams.tags)

	// Parse pipe-delimited tags
	const selectedTags = tagsParam
		? tagsParam.split('|').filter((tag) => tag.trim())
		: []

	try {
		// Fetch data and available tags in parallel
		const [data, availableTagsWithCount] = await Promise.all([
			getCommonplaceData(page, selectedTags),
			getAvailableTags(selectedTags),
		])

		if (!data) {
			return (
				<div>
					<div className="post-wrapper mx-auto mb-16">
						<PostHeader title={title} subtitle={subtitle} />
					</div>
					<div className="post-wrapper mx-auto">
						<div className="text-center text-muted-foreground">
							Unable to load commonplace items. Please try again later.
						</div>
					</div>
				</div>
			)
		}

		return (
			<div>
				<div className="post-wrapper mx-auto mb-16">
					<PostHeader title={title} subtitle={subtitle} />
				</div>

				{/* Tag Cloud */}
				<div className="post-wrapper mx-auto mb-8">
					<TagCloud
						availableTags={availableTagsWithCount}
						selectedTags={selectedTags}
					/>
				</div>

				<div className="post-wrapper mx-auto">
					{data.data.length > 0 ? (
						<div className="space-y-12">
							{data.data.map((book) => (
								<CommonplaceItem key={book.id} book={book} />
							))}
						</div>
					) : (
						<div className="text-center text-muted-foreground">
							{selectedTags.length > 0
								? `No highlights found for the selected ${selectedTags.length === 1 ? 'tag' : 'tags'}: ${selectedTags.join(', ')}`
								: 'No shared highlights found.'}
						</div>
					)}

					{data.pagination.totalPages > 1 && (
						<div className="mt-16">
							<CommonplacePagination
								currentPage={data.pagination.page}
								totalPages={data.pagination.totalPages}
								hasNextPage={data.pagination.hasNextPage}
								hasPreviousPage={data.pagination.hasPreviousPage}
							/>
						</div>
					)}
				</div>
			</div>
		)
	} catch (error) {
		console.error('Error loading commonplace page:', error)
		return (
			<div>
				<div className="post-wrapper mx-auto mb-16">
					<PostHeader title={title} subtitle={subtitle} />
				</div>
				<div className="post-wide-wrapper mx-auto">
					<div className="text-center text-muted-foreground">
						An error occurred while loading the data. Please try again later.
					</div>
				</div>
			</div>
		)
	}
}
