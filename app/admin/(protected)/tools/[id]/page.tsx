import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { deleteTool, updateTool } from '@/app/admin/(protected)/tools/actions'
import { ConfirmButton } from '@/components/admin/confirm-button'
import { ToolForm } from '@/components/admin/tool-form'
import { db } from '@/db'
import { tools } from '@/db/schema'
import { requireAdmin } from '@/lib/admin'

export const metadata = {
	title: 'Edit tool',
}

export default async function AdminEditToolPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>
	searchParams: Promise<{ error?: string; saved?: string }>
}) {
	await requireAdmin()

	const [{ id: rawId }, { error, saved }] = await Promise.all([
		params,
		searchParams,
	])
	const id = Number(rawId)
	if (!Number.isInteger(id)) notFound()

	const [tool] = await db.select().from(tools).where(eq(tools.id, id)).limit(1)
	if (!tool) notFound()

	return (
		<section className="flex flex-col gap-6">
			<h1 className="text-2xl font-medium">{tool.name}</h1>
			{error && <p className="text-sm text-destructive">{error}</p>}
			{saved && <p className="text-sm text-muted-foreground">Saved.</p>}

			<ToolForm
				action={updateTool.bind(null, tool.id)}
				tool={tool}
				submitLabel="Save"
			/>

			<form action={deleteTool.bind(null, tool.id)} className="border-t pt-6">
				<ConfirmButton
					variant="destructive"
					size="sm"
					message={`Delete "${tool.name}"? It is removed from every section.`}
				>
					Delete tool
				</ConfirmButton>
			</form>
		</section>
	)
}
