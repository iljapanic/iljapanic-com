import { count, desc } from 'drizzle-orm'
import { format } from 'date-fns'
import { db } from '@/db'
import {
	readwiseBooks,
	readwiseHighlights,
	readwiseSyncRuns,
	readwiseTags,
} from '@/db/schema'
import { SyncButton } from '@/components/admin/sync-button'
import { requireAdmin } from '@/lib/admin'

export const metadata = {
	title: 'Dashboard',
}

export default async function AdminDashboardPage() {
	await requireAdmin()

	const [runs, [books], [highlights], [tags]] = await Promise.all([
		db
			.select()
			.from(readwiseSyncRuns)
			.orderBy(desc(readwiseSyncRuns.startedAt))
			.limit(5),
		db.select({ value: count() }).from(readwiseBooks),
		db.select({ value: count() }).from(readwiseHighlights),
		db.select({ value: count() }).from(readwiseTags),
	])

	return (
		<section className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-medium">Readwise</h1>
				<SyncButton />
			</div>

			<dl className="grid grid-cols-3 gap-4">
				<Stat label="Books" value={books.value} />
				<Stat label="Highlights" value={highlights.value} />
				<Stat label="Tags" value={tags.value} />
			</dl>

			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b text-left text-muted-foreground">
							<th className="py-2 pr-4 font-normal">Started</th>
							<th className="py-2 pr-4 font-normal">Status</th>
							<th className="py-2 pr-4 font-normal">Trigger</th>
							<th className="py-2 pr-4 font-normal">Books</th>
							<th className="py-2 pr-4 font-normal">Highlights</th>
							<th className="py-2 font-normal">Message</th>
						</tr>
					</thead>
					<tbody>
						{runs.length === 0 && (
							<tr>
								<td colSpan={6} className="py-4 text-muted-foreground">
									No sync runs yet.
								</td>
							</tr>
						)}
						{runs.map((run) => (
							<tr key={run.id} className="border-b align-top">
								<td className="py-2 pr-4 whitespace-nowrap">
									{format(run.startedAt, 'yyyy-MM-dd HH:mm')}
								</td>
								<td className="py-2 pr-4">{run.status}</td>
								<td className="py-2 pr-4">{run.trigger}</td>
								<td className="py-2 pr-4">{run.bookCount ?? '–'}</td>
								<td className="py-2 pr-4">{run.highlightCount ?? '–'}</td>
								<td className="py-2 text-muted-foreground">
									{run.message ?? ''}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	)
}

function Stat({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-md border p-4">
			<dt className="text-sm text-muted-foreground">{label}</dt>
			<dd className="text-2xl font-medium">{value}</dd>
		</div>
	)
}
