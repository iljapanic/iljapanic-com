import { saveBookSections } from '@/app/admin/(protected)/books/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { requireAdmin } from '@/lib/admin'
import { getBookSections, listBooks } from '@/lib/books'

export const metadata = {
	title: 'Book sections',
}

const textareaClassName =
	'flex w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden'

export default async function AdminBookSectionsPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string; saved?: string }>
}) {
	await requireAdmin()

	const [{ error, saved }, sections, books] = await Promise.all([
		searchParams,
		getBookSections(),
		listBooks(),
	])

	return (
		<section className="flex flex-col gap-6">
			<h1 className="text-2xl font-medium">Book sections</h1>
			{error && <p className="text-sm text-destructive">{error}</p>}
			{saved && <p className="text-sm text-muted-foreground">Saved.</p>}
			<p className="text-sm text-muted-foreground">
				One book slug per line, in display order. Available slugs:{' '}
				{books.map((book) => book.slug).join(', ') || 'none'}.
			</p>

			<form action={saveBookSections} className="flex flex-col gap-8">
				{sections.map((section) => (
					<fieldset
						key={section.id}
						className="flex flex-col gap-3 rounded-md border p-4"
					>
						<input type="hidden" name="ids" value={section.id} />
						<div className="grid grid-cols-[1fr_6rem] gap-3">
							<label className="flex flex-col gap-1 text-sm text-muted-foreground">
								Title
								<Input
									name={`title-${section.id}`}
									defaultValue={section.title}
									required
								/>
							</label>
							<label className="flex flex-col gap-1 text-sm text-muted-foreground">
								Position
								<Input
									name={`position-${section.id}`}
									type="number"
									defaultValue={sections.indexOf(section)}
								/>
							</label>
						</div>
						<label className="flex flex-col gap-1 text-sm text-muted-foreground">
							Books
							<textarea
								name={`slugs-${section.id}`}
								rows={Math.max(4, section.books.length + 1)}
								defaultValue={section.books.map((book) => book.slug).join('\n')}
								className={textareaClassName}
							/>
						</label>
						<label className="flex items-center gap-1.5 text-sm text-destructive">
							<input type="checkbox" name={`remove-${section.id}`} value="1" />
							Remove this section
						</label>
					</fieldset>
				))}

				<fieldset className="flex flex-col gap-3 rounded-md border border-dashed p-4">
					<legend className="px-1 text-sm text-muted-foreground">
						New section
					</legend>
					<div className="grid grid-cols-[1fr_6rem] gap-3">
						<label className="flex flex-col gap-1 text-sm text-muted-foreground">
							Title
							<Input name="new-title" placeholder="Leave empty to skip" />
						</label>
						<label className="flex flex-col gap-1 text-sm text-muted-foreground">
							Position
							<Input
								name="new-position"
								type="number"
								defaultValue={sections.length}
							/>
						</label>
					</div>
					<label className="flex flex-col gap-1 text-sm text-muted-foreground">
						Books
						<textarea name="new-slugs" rows={4} className={textareaClassName} />
					</label>
				</fieldset>

				<div>
					<Button type="submit">Save sections</Button>
				</div>
			</form>
		</section>
	)
}
