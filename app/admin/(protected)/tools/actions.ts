'use server'

import { and, eq, inArray, ne } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import {
	TOOL_PLATFORMS,
	tools,
	toolSections,
	toolSectionItems,
	type ToolPlatform,
} from '@/db/schema'
import { requireAdmin } from '@/lib/admin'
import { getStorageConfig } from '@/lib/storage'
import { slugify } from '@/lib/utils'

function withError(path: string, message: string): never {
	redirect(`${path}?error=${encodeURIComponent(message)}`)
}

function text(formData: FormData, name: string): string {
	const value = formData.get(name)
	return typeof value === 'string' ? value.trim() : ''
}

function optional(formData: FormData, name: string): string | null {
	return text(formData, name) || null
}

// Absolute http(s) URL, or an error redirect to `path`.
function contentUrl(formData: FormData, path: string): string {
	const value = text(formData, 'url')
	let parsed: URL | null = null
	try {
		parsed = new URL(value)
	} catch {
		parsed = null
	}
	if (
		!parsed ||
		(parsed.protocol !== 'http:' && parsed.protocol !== 'https:')
	) {
		withError(path, 'URL must be an absolute http(s) URL')
	}
	return value
}

// Empty means no image; anything else must live on the R2 public host.
function imageUrl(
	formData: FormData,
	name: string,
	path: string,
): string | null {
	const value = optional(formData, name)
	if (value !== null && !value.startsWith(`${getStorageConfig().publicUrl}/`)) {
		withError(path, 'Image URL must point at the media bucket')
	}
	return value
}

function platforms(formData: FormData, path: string): ToolPlatform[] {
	const values = formData.getAll('platforms')
	for (const value of values) {
		if (
			typeof value !== 'string' ||
			!(TOOL_PLATFORMS as readonly string[]).includes(value)
		) {
			withError(path, `Unknown platform: ${String(value)}`)
		}
	}
	return values as ToolPlatform[]
}

function position(raw: string, path: string, label: string): number {
	if (!/^\d+$/.test(raw)) {
		withError(path, `${label}: position must be a non-negative whole number`)
	}
	const value = Number(raw)
	if (!Number.isSafeInteger(value)) {
		withError(path, `${label}: position is too large`)
	}
	return value
}

function isUniqueViolation(error: unknown): boolean {
	const code = (error as { code?: unknown })?.code
	const causeCode = (error as { cause?: { code?: unknown } })?.cause?.code
	return code === '23505' || causeCode === '23505'
}

function revalidate() {
	revalidatePath('/tools')
	revalidatePath('/admin/tools')
}

async function slugTaken(slug: string, exceptId?: number): Promise<boolean> {
	const [row] = await db
		.select({ id: tools.id })
		.from(tools)
		.where(
			exceptId === undefined
				? eq(tools.slug, slug)
				: and(eq(tools.slug, slug), ne(tools.id, exceptId)),
		)
		.limit(1)
	return Boolean(row)
}

export async function createTool(formData: FormData) {
	await requireAdmin()

	const path = '/admin/tools/new'
	const name = text(formData, 'name')
	if (!name) withError(path, 'Name is required')
	const url = contentUrl(formData, path)
	const slug = slugify(name)
	if (!slug) withError(path, 'Name must produce a non-empty slug')
	const duplicateMessage = `A tool with slug "${slug}" already exists`
	if (await slugTaken(slug)) withError(path, duplicateMessage)

	const values = {
		slug,
		name,
		url,
		description: optional(formData, 'description'),
		simpleIconSlug: optional(formData, 'simpleIconSlug'),
		iconUrl: imageUrl(formData, 'iconUrl', path),
		platforms: platforms(formData, path),
	}

	let id: number | undefined
	try {
		const [row] = await db
			.insert(tools)
			.values(values)
			.returning({ id: tools.id })
		id = row.id
	} catch (error) {
		if (!isUniqueViolation(error)) throw error
	}
	if (id === undefined) withError(path, duplicateMessage)

	revalidate()
	redirect(`/admin/tools/${id}`)
}

export async function updateTool(id: number, formData: FormData) {
	await requireAdmin()

	const path = `/admin/tools/${id}`
	if (!Number.isSafeInteger(id) || id <= 0)
		withError('/admin/tools', 'Invalid tool id')
	const name = text(formData, 'name')
	if (!name) withError(path, 'Name is required')
	const url = contentUrl(formData, path)
	const slug = slugify(text(formData, 'slug'))
	if (!slug) withError(path, 'Slug must not be empty')
	const duplicateMessage = `A tool with slug "${slug}" already exists`
	if (await slugTaken(slug, id)) withError(path, duplicateMessage)

	const values = {
		slug,
		name,
		url,
		description: optional(formData, 'description'),
		simpleIconSlug: optional(formData, 'simpleIconSlug'),
		iconUrl: imageUrl(formData, 'iconUrl', path),
		platforms: platforms(formData, path),
		updatedAt: new Date(),
	}

	let duplicate = false
	try {
		await db.update(tools).set(values).where(eq(tools.id, id))
	} catch (error) {
		if (!isUniqueViolation(error)) throw error
		duplicate = true
	}
	if (duplicate) withError(path, duplicateMessage)

	revalidate()
	redirect(`${path}?saved=1`)
}

export async function deleteTool(id: number) {
	await requireAdmin()

	if (!Number.isSafeInteger(id) || id <= 0)
		withError('/admin/tools', 'Invalid tool id')

	await db.delete(tools).where(eq(tools.id, id))

	revalidate()
	redirect('/admin/tools')
}

// The sections editor posts every section at once: for each existing id a
// title, position and textarea of slugs (one per line), an optional remove
// checkbox, plus an optional new section. Any invalid input aborts the save.
export async function saveToolSections(formData: FormData) {
	await requireAdmin()

	const path = '/admin/tools/sections'

	const ids: number[] = []
	for (const raw of formData.getAll('ids')) {
		if (typeof raw !== 'string' || !/^\d+$/.test(raw) || Number(raw) <= 0) {
			withError(path, `Malformed section id: ${String(raw)}`)
		}
		ids.push(Number(raw))
	}
	if (ids.length) {
		const existing = await db
			.select({ id: toolSections.id })
			.from(toolSections)
			.where(inArray(toolSections.id, ids))
		const known = new Set(existing.map((row) => row.id))
		const missing = ids.filter((id) => !known.has(id))
		if (missing.length) {
			withError(path, `Unknown section ids: ${missing.join(', ')}`)
		}
	}

	type Draft = { id?: number; title: string; position: number; slugs: string[] }
	const drafts: Draft[] = []
	const removeIds: number[] = []

	function parseSlugs(raw: string): string[] {
		const seen = new Set<string>()
		return raw
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter((line) => line && !seen.has(line) && seen.add(line))
	}

	for (const id of ids) {
		if (formData.get(`remove-${id}`)) {
			removeIds.push(id)
			continue
		}
		const title = text(formData, `title-${id}`)
		if (!title) withError(path, `Section ${id} needs a title`)
		drafts.push({
			id,
			title,
			position: position(text(formData, `position-${id}`), path, title),
			slugs: parseSlugs(text(formData, `slugs-${id}`)),
		})
	}

	const newTitle = text(formData, 'new-title')
	if (newTitle) {
		drafts.push({
			title: newTitle,
			position: position(text(formData, 'new-position'), path, newTitle),
			slugs: parseSlugs(text(formData, 'new-slugs')),
		})
	}

	const allSlugs = [...new Set(drafts.flatMap((draft) => draft.slugs))]
	const rows = allSlugs.length
		? await db
				.select({ id: tools.id, slug: tools.slug })
				.from(tools)
				.where(inArray(tools.slug, allSlugs))
		: []
	const idBySlug = new Map(rows.map((row) => [row.slug, row.id]))
	const unknown = allSlugs.filter((slug) => !idBySlug.has(slug))
	if (unknown.length) {
		withError(path, `Unknown tool slugs: ${unknown.join(', ')}`)
	}

	await db.transaction(async (tx) => {
		if (removeIds.length) {
			await tx.delete(toolSections).where(inArray(toolSections.id, removeIds))
		}

		for (const draft of drafts) {
			let sectionId = draft.id
			if (sectionId === undefined) {
				const [row] = await tx
					.insert(toolSections)
					.values({ title: draft.title, position: draft.position })
					.returning({ id: toolSections.id })
				sectionId = row.id
			} else {
				await tx
					.update(toolSections)
					.set({
						title: draft.title,
						position: draft.position,
						updatedAt: new Date(),
					})
					.where(eq(toolSections.id, sectionId))
				await tx
					.delete(toolSectionItems)
					.where(eq(toolSectionItems.sectionId, sectionId))
			}

			if (draft.slugs.length) {
				await tx.insert(toolSectionItems).values(
					draft.slugs.map((slug, index) => ({
						sectionId,
						toolId: idBySlug.get(slug)!,
						position: index,
					})),
				)
			}
		}
	})

	revalidate()
	redirect(`${path}?saved=1`)
}
