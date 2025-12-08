import { notFound } from 'next/navigation'
import { getCommonplaceBookBySlug } from '@/app/actions/commonplace'
import { CommonplaceItem } from '@/components/commonplace/commonplace-item'
import { PostHeader } from '@/components/post/post-header'
import { ArrowLeft, Undo2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PageProps {
	params: {
		slug: string
	}
}

export async function generateMetadata({ params }: PageProps) {
	const book = await getCommonplaceBookBySlug(params.slug)

	if (!book) {
		return {
			title: 'Book Not Found',
			description: 'The requested commonplace book could not be found.',
		}
	}

	return {
		title: book.title,
		description: `Highlights from ${book.title}${book.author ? ` by ${book.author}` : ''}`,
	}
}

export default async function CommonplaceBookPage({ params }: PageProps) {
	const book = await getCommonplaceBookBySlug(params.slug)

	if (!book) {
		notFound()
	}

	return (
		<div>
			<div className="post-wrapper mx-auto mb-12">
				<Link href="/commonplace">
					<Button variant="ghost" size="sm">
						<Undo2 className="mr-2 size-4" />
						Back to commonplace
					</Button>
				</Link>
			</div>

			<div className="post-wrapper mx-auto">
				<CommonplaceItem book={book} isCollapsed={false} />
			</div>
		</div>
	)
}
