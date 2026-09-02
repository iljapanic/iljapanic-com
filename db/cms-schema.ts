import {
	integer,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
} from 'drizzle-orm/pg-core'

export const TOOL_PLATFORMS = [
	'web',
	'mac',
	'ios',
	'chrome',
	'multiplatform',
] as const
export type ToolPlatform = (typeof TOOL_PLATFORMS)[number]

export const tools = pgTable('tools', {
	id: serial('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	description: text('description'),
	url: text('url').notNull(),
	simpleIconSlug: text('simple_icon_slug'),
	iconUrl: text('icon_url'),
	platforms: text('platforms').array().notNull().default([]),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
})

export const toolSections = pgTable('tool_sections', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	position: integer('position').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
})

export const toolSectionItems = pgTable(
	'tool_section_items',
	{
		sectionId: integer('section_id')
			.notNull()
			.references(() => toolSections.id, { onDelete: 'cascade' }),
		toolId: integer('tool_id')
			.notNull()
			.references(() => tools.id, { onDelete: 'cascade' }),
		position: integer('position').notNull(),
	},
	(table) => [primaryKey({ columns: [table.sectionId, table.toolId] })],
)

export const books = pgTable('books', {
	id: serial('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	title: text('title').notNull(),
	author: text('author'),
	url: text('url').notNull(),
	coverUrl: text('cover_url'),
	keywords: text('keywords').array().notNull().default([]),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
})

export const bookSections = pgTable('book_sections', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	position: integer('position').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
})

export const bookSectionItems = pgTable(
	'book_section_items',
	{
		sectionId: integer('section_id')
			.notNull()
			.references(() => bookSections.id, { onDelete: 'cascade' }),
		bookId: integer('book_id')
			.notNull()
			.references(() => books.id, { onDelete: 'cascade' }),
		position: integer('position').notNull(),
	},
	(table) => [primaryKey({ columns: [table.sectionId, table.bookId] })],
)

export type ToolRow = typeof tools.$inferSelect
export type NewToolRow = typeof tools.$inferInsert
export type ToolSectionRow = typeof toolSections.$inferSelect
export type BookRow = typeof books.$inferSelect
export type NewBookRow = typeof books.$inferInsert
export type BookSectionRow = typeof bookSections.$inferSelect
