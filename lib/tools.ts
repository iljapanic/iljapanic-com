// Server-side module: it queries the database directly.
// Never import this from a client component.
import { asc, eq } from 'drizzle-orm'
import { db } from '@/db'
import {
	tools,
	toolSections,
	toolSectionItems,
	type ToolRow,
} from '@/db/schema'

export type Tool = ToolRow

export type ToolSection = {
	id: number
	title: string
	tools: Tool[]
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
	const [tool] = await db
		.select()
		.from(tools)
		.where(eq(tools.slug, slug))
		.limit(1)

	return tool ?? null
}

export async function listTools(): Promise<Tool[]> {
	return db.select().from(tools).orderBy(asc(tools.name))
}

export async function getToolSections(): Promise<ToolSection[]> {
	const [sections, items] = await Promise.all([
		db
			.select()
			.from(toolSections)
			.orderBy(asc(toolSections.position), asc(toolSections.id)),
		db
			.select({ sectionId: toolSectionItems.sectionId, tool: tools })
			.from(toolSectionItems)
			.innerJoin(tools, eq(toolSectionItems.toolId, tools.id))
			.orderBy(asc(toolSectionItems.position)),
	])

	// The inner join drops items whose tool no longer exists, so a stale
	// membership never breaks the public page.
	return sections.map((section) => ({
		id: section.id,
		title: section.title,
		tools: items
			.filter((item) => item.sectionId === section.id)
			.map((item) => item.tool),
	}))
}
