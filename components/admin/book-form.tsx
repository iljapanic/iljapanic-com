import { ImageUploadField } from '@/components/admin/image-upload-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Book } from '@/lib/books'

export function BookForm({
	action,
	book,
	submitLabel,
}: {
	action: (formData: FormData) => Promise<void>
	book?: Book
	submitLabel: string
}) {
	return (
		<form action={action} className="flex max-w-md flex-col gap-4">
			<Field label="Title" htmlFor="title">
				<Input id="title" name="title" defaultValue={book?.title} required />
			</Field>

			{book && (
				<Field label="Slug" htmlFor="slug">
					<Input id="slug" name="slug" defaultValue={book.slug} required />
				</Field>
			)}

			<Field label="Author" htmlFor="author">
				<Input id="author" name="author" defaultValue={book?.author ?? ''} />
			</Field>

			<Field label="URL" htmlFor="url">
				<Input
					id="url"
					name="url"
					type="url"
					defaultValue={book?.url}
					required
				/>
			</Field>

			<Field label="Keywords (comma-separated)" htmlFor="keywords">
				<Input
					id="keywords"
					name="keywords"
					defaultValue={book?.keywords.join(', ') ?? ''}
				/>
			</Field>

			<ImageUploadField
				name="coverUrl"
				value={book?.coverUrl}
				folder="books"
				label="Cover"
			/>

			<div>
				<Button type="submit">{submitLabel}</Button>
			</div>
		</form>
	)
}

function Field({
	label,
	htmlFor,
	children,
}: {
	label: string
	htmlFor: string
	children: React.ReactNode
}) {
	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={htmlFor} className="text-sm text-muted-foreground">
				{label}
			</label>
			{children}
		</div>
	)
}
