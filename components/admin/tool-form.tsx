import { ImageUploadField } from '@/components/admin/image-upload-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TOOL_PLATFORMS } from '@/db/schema'
import type { Tool } from '@/lib/tools'

const PLATFORM_LABELS: Record<(typeof TOOL_PLATFORMS)[number], string> = {
	web: 'Web',
	mac: 'Mac',
	ios: 'iOS',
	chrome: 'Chrome',
	multiplatform: 'Multi-platform',
}

export function ToolForm({
	action,
	tool,
	submitLabel,
}: {
	action: (formData: FormData) => Promise<void>
	tool?: Tool
	submitLabel: string
}) {
	return (
		<form action={action} className="flex max-w-md flex-col gap-4">
			<Field label="Name" htmlFor="name">
				<Input id="name" name="name" defaultValue={tool?.name} required />
			</Field>

			{tool && (
				<Field label="Slug" htmlFor="slug">
					<Input id="slug" name="slug" defaultValue={tool.slug} required />
				</Field>
			)}

			<Field label="Description" htmlFor="description">
				<textarea
					id="description"
					name="description"
					defaultValue={tool?.description ?? ''}
					rows={3}
					className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden"
				/>
			</Field>

			<Field label="URL" htmlFor="url">
				<Input
					id="url"
					name="url"
					type="url"
					defaultValue={tool?.url}
					required
				/>
			</Field>

			<Field
				label="Simple Icons slug (simpleicons.org)"
				htmlFor="simpleIconSlug"
			>
				<Input
					id="simpleIconSlug"
					name="simpleIconSlug"
					defaultValue={tool?.simpleIconSlug ?? ''}
				/>
			</Field>

			<fieldset className="flex flex-col gap-2">
				<legend className="text-sm text-muted-foreground">Platforms</legend>
				<div className="flex flex-wrap gap-4">
					{TOOL_PLATFORMS.map((platform) => (
						<label key={platform} className="flex items-center gap-1.5 text-sm">
							<input
								type="checkbox"
								name="platforms"
								value={platform}
								defaultChecked={tool?.platforms.includes(platform) ?? false}
							/>
							{PLATFORM_LABELS[platform]}
						</label>
					))}
				</div>
			</fieldset>

			<ImageUploadField
				name="iconUrl"
				value={tool?.iconUrl}
				folder="tools"
				label="Icon (used when no Simple Icons slug is set)"
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
