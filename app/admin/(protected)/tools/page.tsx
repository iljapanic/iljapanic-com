import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { listTools } from '@/lib/tools'

export const metadata = {
	title: 'Tools',
}

export default async function AdminToolsPage() {
	await requireAdmin()

	const tools = await listTools()

	return (
		<section className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-medium">Tools</h1>
				<div className="flex items-center gap-4 text-sm">
					<Link href="/admin/tools/sections">Sections</Link>
					<Link href="/admin/tools/new">New tool</Link>
				</div>
			</div>

			<table className="w-full text-sm">
				<thead>
					<tr className="border-b text-left text-muted-foreground">
						<th className="py-2 pr-4 font-normal">Name</th>
						<th className="py-2 pr-4 font-normal">Slug</th>
						<th className="py-2 font-normal">Platforms</th>
					</tr>
				</thead>
				<tbody>
					{tools.length === 0 && (
						<tr>
							<td colSpan={3} className="py-4 text-muted-foreground">
								No tools yet.
							</td>
						</tr>
					)}
					{tools.map((tool) => (
						<tr key={tool.id} className="border-b">
							<td className="py-2 pr-4">
								<Link href={`/admin/tools/${tool.id}`}>{tool.name}</Link>
							</td>
							<td className="py-2 pr-4 text-muted-foreground">{tool.slug}</td>
							<td className="py-2 text-muted-foreground">
								{tool.platforms.join(', ')}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	)
}
