import { createTool } from '@/app/admin/(protected)/tools/actions'
import { ToolForm } from '@/components/admin/tool-form'
import { requireAdmin } from '@/lib/admin'

export const metadata = {
	title: 'New tool',
}

export default async function AdminNewToolPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>
}) {
	await requireAdmin()

	const { error } = await searchParams

	return (
		<section className="flex flex-col gap-6">
			<h1 className="text-2xl font-medium">New tool</h1>
			{error && <p className="text-sm text-destructive">{error}</p>}
			<ToolForm action={createTool} submitLabel="Create tool" />
		</section>
	)
}
