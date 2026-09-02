import { relations } from 'drizzle-orm'
import {
	boolean,
	index,
	integer,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
} from 'drizzle-orm/pg-core'

export const readwiseBooks = pgTable(
	'readwise_books',
	{
		id: serial('id').primaryKey(),
		readwiseId: integer('readwise_id').notNull().unique(),
		slug: text('slug').notNull().unique(),
		title: text('title').notNull(),
		author: text('author'),
		readableTitle: text('readable_title'),
		source: text('source').notNull(),
		category: text('category').notNull(),
		coverImageUrl: text('cover_image_url'),
		sourceUrl: text('source_url'),
		readwiseUrl: text('readwise_url').notNull(),
		uniqueUrl: text('unique_url'),
		documentNote: text('document_note'),
		summary: text('summary'),
		asin: text('asin'),
		externalId: text('external_id'),
		highlightCount: integer('highlight_count').notNull().default(0),
		lastHighlightAt: timestamp('last_highlight_at', { withTimezone: true }),
		readwiseUpdatedAt: timestamp('readwise_updated_at', { withTimezone: true }),
		syncedAt: timestamp('synced_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index('readwise_books_last_highlight_at_idx').on(table.lastHighlightAt),
	],
)

export const readwiseHighlights = pgTable(
	'readwise_highlights',
	{
		id: serial('id').primaryKey(),
		readwiseId: integer('readwise_id').notNull().unique(),
		bookId: integer('book_id')
			.notNull()
			.references(() => readwiseBooks.id, { onDelete: 'cascade' }),
		text: text('text').notNull(),
		note: text('note'),
		location: integer('location'),
		locationType: text('location_type'),
		color: text('color'),
		highlightedAt: timestamp('highlighted_at', { withTimezone: true }),
		url: text('url'),
		endLocation: integer('end_location'),
		externalId: text('external_id'),
		readwiseUrl: text('readwise_url').notNull(),
		isFavorite: boolean('is_favorite').notNull().default(false),
		readwiseCreatedAt: timestamp('readwise_created_at', { withTimezone: true }),
		readwiseUpdatedAt: timestamp('readwise_updated_at', { withTimezone: true }),
		syncedAt: timestamp('synced_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [index('readwise_highlights_book_id_idx').on(table.bookId)],
)

export const readwiseTags = pgTable('readwise_tags', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique(),
	label: text('label').notNull(),
})

export const readwiseBookTags = pgTable(
	'readwise_book_tags',
	{
		bookId: integer('book_id')
			.notNull()
			.references(() => readwiseBooks.id, { onDelete: 'cascade' }),
		tagId: integer('tag_id')
			.notNull()
			.references(() => readwiseTags.id, { onDelete: 'cascade' }),
	},
	(table) => [
		primaryKey({ columns: [table.bookId, table.tagId] }),
		index('readwise_book_tags_tag_id_idx').on(table.tagId),
	],
)

export const readwiseHighlightTags = pgTable(
	'readwise_highlight_tags',
	{
		highlightId: integer('highlight_id')
			.notNull()
			.references(() => readwiseHighlights.id, { onDelete: 'cascade' }),
		tagId: integer('tag_id')
			.notNull()
			.references(() => readwiseTags.id, { onDelete: 'cascade' }),
	},
	(table) => [
		primaryKey({ columns: [table.highlightId, table.tagId] }),
		index('readwise_highlight_tags_tag_id_idx').on(table.tagId),
	],
)

export const readwiseSyncRuns = pgTable('readwise_sync_runs', {
	id: serial('id').primaryKey(),
	startedAt: timestamp('started_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	finishedAt: timestamp('finished_at', { withTimezone: true }),
	status: text('status', { enum: ['running', 'success', 'error'] }).notNull(),
	trigger: text('trigger', { enum: ['cron', 'manual'] }).notNull(),
	message: text('message'),
	bookCount: integer('book_count'),
	highlightCount: integer('highlight_count'),
	removedBookCount: integer('removed_book_count'),
})

export const readwiseBooksRelations = relations(readwiseBooks, ({ many }) => ({
	highlights: many(readwiseHighlights),
	bookTags: many(readwiseBookTags),
}))

export const readwiseHighlightsRelations = relations(
	readwiseHighlights,
	({ one, many }) => ({
		book: one(readwiseBooks, {
			fields: [readwiseHighlights.bookId],
			references: [readwiseBooks.id],
		}),
		highlightTags: many(readwiseHighlightTags),
	}),
)

export const readwiseTagsRelations = relations(readwiseTags, ({ many }) => ({
	bookTags: many(readwiseBookTags),
	highlightTags: many(readwiseHighlightTags),
}))

export const readwiseBookTagsRelations = relations(
	readwiseBookTags,
	({ one }) => ({
		book: one(readwiseBooks, {
			fields: [readwiseBookTags.bookId],
			references: [readwiseBooks.id],
		}),
		tag: one(readwiseTags, {
			fields: [readwiseBookTags.tagId],
			references: [readwiseTags.id],
		}),
	}),
)

export const readwiseHighlightTagsRelations = relations(
	readwiseHighlightTags,
	({ one }) => ({
		highlight: one(readwiseHighlights, {
			fields: [readwiseHighlightTags.highlightId],
			references: [readwiseHighlights.id],
		}),
		tag: one(readwiseTags, {
			fields: [readwiseHighlightTags.tagId],
			references: [readwiseTags.id],
		}),
	}),
)

export type ReadwiseBookRow = typeof readwiseBooks.$inferSelect
export type NewReadwiseBookRow = typeof readwiseBooks.$inferInsert
export type ReadwiseHighlightRow = typeof readwiseHighlights.$inferSelect
export type NewReadwiseHighlightRow = typeof readwiseHighlights.$inferInsert
export type ReadwiseTagRow = typeof readwiseTags.$inferSelect
export type NewReadwiseTagRow = typeof readwiseTags.$inferInsert
export type ReadwiseSyncRunRow = typeof readwiseSyncRuns.$inferSelect
export type NewReadwiseSyncRunRow = typeof readwiseSyncRuns.$inferInsert

export * from './auth-schema'
export * from './cms-schema'
