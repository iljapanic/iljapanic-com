// One-off migration of the Keystatic JSON content into Postgres.
//
//   bun run scripts/import-keystatic.ts
//
// Reads content/tools/*.json, content/books/*.json and the two section
// singletons, uploads every referenced local image to R2 and upserts rows
// by slug. Re-running is safe: rows are updated in place (images are
// re-uploaded under new keys) and the section lists are rewritten.
// Missing files or env vars throw; nothing is skipped silently.
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import {
	books,
	bookSections,
	bookSectionItems,
	TOOL_PLATFORMS,
	tools,
	toolSections,
	toolSectionItems,
	type ToolPlatform,
} from '../db/schema'
import { buildObjectKey, getStorageConfig, uploadObject } from '../lib/storage'

const root = process.cwd()
const contentDir = path.join(root, 'content')
const publicDir = path.join(root, 'public')

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	webp: 'image/webp',
	svg: 'image/svg+xml',
	gif: 'image/gif',
	avif: 'image/avif',
}

type ToolJson = {
	name: string
	description?: string
	url: string
	simpleIconSlug?: string
	type?: string[]
	icon?: string | null
}

type BookJson = {
	title: string
	url: string
	cover?: string | null
	author?: string
	keywords?: string[]
}

type SectionsJson<K extends string> = {
	sections: ({ sectionTitle: string } & Record<K, string[]>)[]
}

const summary = {
	toolsUpserted: 0,
	booksUpserted: 0,
	imagesUploaded: 0,
	toolSectionsWritten: 0,
	bookSectionsWritten: 0,
}

async function readJsonDir<T>(
	dir: string,
): Promise<{ slug: string; data: T }[]> {
	const names = (await readdir(dir)).filter((name) => name.endsWith('.json'))
	names.sort()
	return Promise.all(
		names.map(async (name) => ({
			slug: name.slice(0, -'.json'.length),
			data: JSON.parse(await readFile(path.join(dir, name), 'utf8')) as T,
		})),
	)
}

async function readJson<T>(file: string): Promise<T> {
	return JSON.parse(await readFile(file, 'utf8')) as T
}

// `publicPath` is the value stored in the JSON, e.g. /images/tools/arc/icon.svg.
async function uploadLocalImage(
	publicPath: string,
	folder: string,
	fileName: string,
): Promise<string> {
	const filePath = path.join(publicDir, publicPath)
	const extension = path.extname(publicPath).slice(1).toLowerCase()
	const contentType = CONTENT_TYPE_BY_EXTENSION[extension]
	if (!contentType) {
		throw new Error(`Unsupported image extension for ${publicPath}`)
	}

	let body: Buffer
	try {
		body = await readFile(filePath)
	} catch {
		throw new Error(`Referenced image is missing on disk: ${filePath}`)
	}

	const key = buildObjectKey({ folder, fileName, extension })
	const url = await uploadObject({
		key,
		body: new Uint8Array(body),
		contentType,
	})
	summary.imagesUploaded += 1
	return url
}

function toPlatforms(type: string[] | undefined, slug: string): ToolPlatform[] {
	const values = type ?? []
	for (const value of values) {
		if (!(TOOL_PLATFORMS as readonly string[]).includes(value)) {
			throw new Error(`Unknown platform "${value}" in tool ${slug}`)
		}
	}
	return values as ToolPlatform[]
}

// Two tools carry stale Keystatic paths under /uploads/tools/; the files
// live under public/images/tools/. Two more reference /uploads/icons/ files
// that exist nowhere; they get no icon and a Simple Icons slug instead.
const MISSING_ICON_FALLBACK: Record<string, string> = {
	'/uploads/icons/supabase.svg': 'supabase',
	'/uploads/icons/Vercel_light.svg': 'vercel',
}

function resolveToolIcon(
	icon: string,
	slug: string,
): { path: string } | { simpleIconSlug: string } {
	const remapped = icon.replace(/^\/uploads\/tools\//, '/images/tools/')
	if (remapped !== icon) {
		console.warn(`  warning: ${slug} icon ${icon} remapped to ${remapped}`)
		return { path: remapped }
	}
	const fallback = MISSING_ICON_FALLBACK[icon]
	if (fallback) {
		console.warn(
			`  warning: ${slug} icon ${icon} is missing; using simple icon "${fallback}"`,
		)
		return { simpleIconSlug: fallback }
	}
	return { path: icon }
}

async function importTools() {
	const entries = await readJsonDir<ToolJson>(path.join(contentDir, 'tools'))

	for (const { slug, data } of entries) {
		if (!data.name || !data.url) {
			throw new Error(`Tool ${slug} is missing name or url`)
		}

		let iconUrl: string | null = null
		let simpleIconSlug = data.simpleIconSlug || null
		if (data.icon) {
			const resolved = resolveToolIcon(data.icon, slug)
			if ('path' in resolved) {
				iconUrl = await uploadLocalImage(resolved.path, 'tools', `${slug}-icon`)
			} else {
				simpleIconSlug = resolved.simpleIconSlug
			}
		}

		const values = {
			slug,
			name: data.name,
			description: data.description || null,
			url: data.url,
			simpleIconSlug,
			iconUrl,
			platforms: toPlatforms(data.type, slug),
		}

		await db
			.insert(tools)
			.values(values)
			.onConflictDoUpdate({
				target: tools.slug,
				set: { ...values, updatedAt: new Date() },
			})
		summary.toolsUpserted += 1
	}
}

async function importBooks() {
	const entries = await readJsonDir<BookJson>(path.join(contentDir, 'books'))

	for (const { slug, data } of entries) {
		if (!data.title || !data.url) {
			throw new Error(`Book ${slug} is missing title or url`)
		}

		const coverUrl = data.cover
			? await uploadLocalImage(data.cover, 'books', `${slug}-cover`)
			: null

		const values = {
			slug,
			title: data.title,
			author: data.author || null,
			url: data.url,
			coverUrl,
			keywords: data.keywords ?? [],
		}

		await db
			.insert(books)
			.values(values)
			.onConflictDoUpdate({
				target: books.slug,
				set: { ...values, updatedAt: new Date() },
			})
		summary.booksUpserted += 1
	}
}

async function importToolSections() {
	const { sections } = await readJson<SectionsJson<'tools'>>(
		path.join(contentDir, 'singletons', 'toolbox.json'),
	)

	await db.transaction(async (tx) => {
		await tx.delete(toolSections)

		for (const [position, section] of sections.entries()) {
			const [row] = await tx
				.insert(toolSections)
				.values({ title: section.sectionTitle, position })
				.returning({ id: toolSections.id })

			for (const [itemPosition, slug] of section.tools.entries()) {
				const [tool] = await tx
					.select({ id: tools.id })
					.from(tools)
					.where(eq(tools.slug, slug))
				if (!tool) {
					throw new Error(
						`toolbox.json section "${section.sectionTitle}" references unknown tool ${slug}`,
					)
				}
				await tx.insert(toolSectionItems).values({
					sectionId: row.id,
					toolId: tool.id,
					position: itemPosition,
				})
			}
			summary.toolSectionsWritten += 1
		}
	})
}

async function importBookSections() {
	const { sections } = await readJson<SectionsJson<'books'>>(
		path.join(contentDir, 'singletons', 'bookshelf.json'),
	)

	await db.transaction(async (tx) => {
		await tx.delete(bookSections)

		for (const [position, section] of sections.entries()) {
			const [row] = await tx
				.insert(bookSections)
				.values({ title: section.sectionTitle, position })
				.returning({ id: bookSections.id })

			for (const [itemPosition, slug] of section.books.entries()) {
				const [book] = await tx
					.select({ id: books.id })
					.from(books)
					.where(eq(books.slug, slug))
				if (!book) {
					throw new Error(
						`bookshelf.json section "${section.sectionTitle}" references unknown book ${slug}`,
					)
				}
				await tx.insert(bookSectionItems).values({
					sectionId: row.id,
					bookId: book.id,
					position: itemPosition,
				})
			}
			summary.bookSectionsWritten += 1
		}
	})
}

async function main() {
	// Fail before touching the database if the R2 configuration is incomplete.
	getStorageConfig()

	await importTools()
	await importBooks()
	await importToolSections()
	await importBookSections()

	console.log('Import finished')
	console.log(`  tools upserted:        ${summary.toolsUpserted}`)
	console.log(`  books upserted:        ${summary.booksUpserted}`)
	console.log(`  images uploaded:       ${summary.imagesUploaded}`)
	console.log(`  tool sections written: ${summary.toolSectionsWritten}`)
	console.log(`  book sections written: ${summary.bookSectionsWritten}`)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
