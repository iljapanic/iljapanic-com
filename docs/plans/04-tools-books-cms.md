# 04 — Tools and books in the database, admin CRUD, Keystatic removal

- **Date**: 2026-09-02
- **Repo**: iljapanic-com
- **Lane**: factory
- **Blast radius**: new Drizzle tables + migration 0002, one-off import script, admin pages for tools and books, public `/tools`, `/bookshelf` and the `Tool`/`Book` components switched from Keystatic to the DB, Keystatic packages/config/content removed, tool and book images moved to R2.

All source paths are relative to the repository root. Depends on specs 01–03.

## Goal and end use

Tools (with sections such as "Daily drivers", "Chrome extensions") and books (with bookshelf sections such as "Non-fiction") move from Keystatic JSON files into Postgres and are managed at `/admin/tools` and `/admin/books`. The public `/tools` and `/bookshelf` pages and the MDX `<Tool slug="…" />` component read from the database. Keystatic is removed completely. Existing content (12 tools, 69 books, the two section lists) is imported once by a script; local images move to R2 during the import so nothing depends on `public/images/tools` or `public/images/books` afterwards.

## Decisions already made

- Schema (Drizzle, snake_case columns, timestamptz):
  - `tools`: `id` serial PK; `slug` text UNIQUE NOT NULL; `name` text NOT NULL; `description` text; `url` text NOT NULL; `simple_icon_slug` text; `icon_url` text (R2 public URL); `platforms` text[] NOT NULL DEFAULT '{}' (values `web|mac|ios|chrome|multiplatform`); `created_at`, `updated_at`.
  - `tool_sections`: `id` serial PK; `title` text NOT NULL; `position` integer NOT NULL; `created_at`, `updated_at`.
  - `tool_section_items`: `section_id` → tool_sections ON DELETE CASCADE; `tool_id` → tools ON DELETE CASCADE; `position` integer NOT NULL; PK (`section_id`, `tool_id`).
  - `books`: `id` serial PK; `slug` text UNIQUE NOT NULL; `title` text NOT NULL; `author` text; `url` text NOT NULL; `cover_url` text (R2); `keywords` text[] NOT NULL DEFAULT '{}'; `created_at`, `updated_at`.
  - `book_sections`, `book_section_items` — same shape as the tool equivalents.
- Public reads use plain Drizzle queries in `lib/tools.ts` and `lib/books.ts` (server-only by convention). No caching layer; pages that read the DB declare `export const dynamic = 'force-dynamic'` (they are already dynamic on Vercel because of the DB call; be explicit).
- Admin UI: plain server components + server actions + `<form action>`; shadcn `Button`, `Input`; the `ImageUploadField` from spec 03 for icons/covers. Section membership is edited on the section page as an ordered list of slugs (one per line in a textarea) — deliberately simple. Delete actions use a `<form>` with a confirm step on the client (a small `'use client'` `ConfirmButton` using `window.confirm`).
- Slugs: derived from the name/title via `slugify` on create, editable afterwards, unique.
- Import: `scripts/import-keystatic.ts` run once with `bun run scripts/import-keystatic.ts`; reads `content/tools/*.json`, `content/books/*.json`, `content/singletons/toolbox.json`, `content/singletons/bookshelf.json`; uploads each referenced local image (`public/images/tools/...`, `public/images/books/...`) to R2 under `tools/` and `books/` using `uploadObject` from `lib/storage.ts`; upserts by slug; idempotent (re-running updates rows and re-uploads images with new keys — acceptable). The tool entry `content/tools/vercel.json` carries a stray `crons` key that is ignored. Tool JSON files use `"keywords"` on some entries; ignore unknown keys.
- After import and verification, the implementer deletes: `keystatic.config.ts`, `schema/keystatic/**`, `lib/keystatic-reader.ts`, `content/tools/**`, `content/books/**`, `content/singletons/**`, `public/images/tools/**`, `public/images/books/**`, the `KEYSTATIC` mentions anywhere, and removes `@keystatic/core` and `@keystatic/next` from `package.json`. Contentlayer's `contentDirExclude` entries for `singletons`, `books`, `tools` stay harmless but are removed too (they are in `contentlayer.config.ts`, which this spec may edit for those three lines only).
- Package manager Bun; orchestrator commits; the import script is committed (it documents the migration) but never wired into `package.json` scripts.

## Constraints (with the why)

- Every admin page and server action calls `requireAdmin()`. — Layout checks do not cover server actions or client navigations.
- Public pages must not 500 when a section references a slug that no longer exists; skip it. — Admin edits happen live.
- No new UI libraries, no form libraries, no client-side state beyond the upload field and the confirm button. — Boring code.
- Keep the visual output of `/tools`, `/bookshelf` and the MDX tool chip identical to today (same markup and classes). — The user asked for no visible change.
- Fail fast: the import script throws on a missing file or a missing env var; it does not skip silently.

## Files to touch

Create:
- `db/cms-schema.ts` (tables above) and `export * from './cms-schema'` in `db/schema.ts`; `drizzle/0002_*.sql` + meta via `bun run db:generate`; apply with `bun run db:migrate` (both authorised).
- `lib/tools.ts` — `getToolBySlug`, `getToolSections()` → `{ id, title, tools: Tool[] }[]` ordered by position, `listTools()`.
- `lib/books.ts` — `getBookBySlug`, `getBookSections()`, `listBooks()`.
- `scripts/import-keystatic.ts`.
- `app/admin/(protected)/tools/page.tsx` (list + "New tool" link), `app/admin/(protected)/tools/new/page.tsx`, `app/admin/(protected)/tools/[id]/page.tsx` (edit + delete), `app/admin/(protected)/tools/actions.ts` (`createTool`, `updateTool`, `deleteTool`, `saveToolSections`), `app/admin/(protected)/tools/sections/page.tsx` (sections editor: title, position, textarea of slugs; add/remove section).
- Same five files under `app/admin/(protected)/books/…` with `book` naming.
- `components/admin/tool-form.tsx`, `components/admin/book-form.tsx` (server components rendering `<form action>` with the fields; reuse `ImageUploadField`), `components/admin/confirm-button.tsx` (`'use client'`).

Edit:
- `app/(main)/tools/page.tsx`, `app/(main)/bookshelf/page.tsx`, `app/(main)/page.tsx` (replace the `keystaticReader` import and the bookshelf read; the home page currently only computes `randomBooks` for a commented-out section — replace with `getBookSections()` and keep the variable), `app/(main)/writing/page.tsx` (drop the unused `keystaticReader` import).
- `components/tools/tool.tsx`, `components/mdx/tool.tsx`, `components/books/book.tsx`, `components/books/books-grid.tsx` — accept the DB record (or slug + lookup via `lib/*`), same markup.
- `components/admin/admin-nav.tsx` — links to Tools, Books.
- `next.config.mjs` — no change expected (R2 host added in spec 03).
- `contentlayer.config.ts` — remove the three Keystatic-related exclude lines only.
- `package.json`, `bun.lock` — remove `@keystatic/core`, `@keystatic/next` (`bun remove` authorised).
- `.env.example` — no Keystatic vars are present; leave as is.

Delete (after import verified): listed under Decisions.

## Do NOT touch

- `.env`, `db/index.ts`, `db/auth-schema.ts`, `drizzle/0000_*`, `drizzle/0001_*`, `lib/auth*.ts`, `lib/admin.ts`, `lib/storage.ts`, `lib/readwise*.ts`, `app/api/**`, `app/(plain)/**`, `content/articles/**`, `content/notes/**`, `content/pages/**`, `content/posts/**`, `content/snippets/**`, `content/_templates/**`, `styles/**`, `tsconfig.json`, `vercel.json`, `components/mdx/**` except `components/mdx/tool.tsx`, `components/post/**`, `components/globals/**`, `components/ui/**`.

## Steps

0. Confirm specs 01–03 applied: `drizzle/0000_*`, `drizzle/0001_*` exist; `/admin` works; `lib/storage.ts` exists. Count source files: `ls content/tools/*.json | wc -l` (expect 12), `ls content/books/*.json | wc -l` (expect 69).
1. Schema + migration + migrate.
2. `lib/tools.ts`, `lib/books.ts`.
3. Import script; run it; print a summary (tools upserted, books upserted, images uploaded, sections written). Re-run once to prove idempotency (row counts unchanged).
4. Switch public pages/components to the DB. Keep markup identical; `Book` and `Tool` may become synchronous components receiving a record, with the lookup moved to the page — but `components/mdx/tool.tsx` must keep the `slug` prop because MDX files call `<Tool slug="…" />`.
5. Admin pages, forms, actions, nav.
6. Remove Keystatic: packages, config, schema, reader, content JSON, local images, exclude lines. `grep -rni "keystatic" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.contentlayer . | grep -v bun.lock | grep -v docs/plans` must print nothing.
7. Optionally delete `app/admin/(protected)/uploads/page.tsx` from spec 03 and its nav link (implementer's choice; flag it).

## Acceptance criteria

- `bunx tsc --noEmit` 0; `bun run lint` 0 errors; `bun run build` 0 and lists `/tools`, `/bookshelf`, `/admin/tools`, `/admin/books`.
- The Keystatic grep above prints nothing; `test ! -d content/tools && test ! -d content/books && test ! -d content/singletons && test ! -f keystatic.config.ts`.
- `bun -e` script using `db`: `select count(*) from tools` = 12, `from books` = 69, `from tool_sections` = 2, `from book_sections` = number of sections in the old `bookshelf.json` (record it in Step 0 before deleting), every `tools.icon_url`/`books.cover_url` that is non-null starts with the `R2_PUBLIC_URL` value, and no `icon_url`/`cover_url` starts with `/images/`.
- `curl -s http://localhost:3000/tools` contains "Daily drivers", "Chrome extensions", and 8 tool links (`href="https://` occurrences inside the tools list ≥ 8). `curl -s http://localhost:3000/bookshelf` contains ≥ 60 `<img` (or `<img` via next/image) tags whose `src` includes `/_next/image?url=` with the R2 host encoded, or the R2 host directly.
- With the admin cookie jar: `GET /admin/tools` 200 lists 12 tools; creating a tool through the server action (drive the form with `curl -b cookies.txt -F …` against the page's action is impractical — instead call the exported action from a `bun -e` script is also impractical because of `requireAdmin`; therefore verify create/update/delete via the browser or by temporarily running the dev server and using the form in a real browser, and record the resulting row in the DB with a `bun -e` count before/after). If no browser is available, report that part as NOT VERIFIED rather than done.
- A page rendered from MDX that uses `<Tool slug="obsidian" />` (search `content/` for `<Tool`; if none exists, create a throwaway check by rendering `components/mdx/tool.tsx` in the `/admin/uploads` test page temporarily and remove it afterwards) shows the tool name and icon.

## Verification method

Tier: typecheck + build, migration applied and queried back, import script run twice, public pages curled, admin CRUD driven in a browser.

### Prerequisites
Bun, Node ≥ 22, `.env` populated, specs 01–03 applied, network to Neon and R2.

### Targeted automated checks
- `bunx tsc --noEmit`, `bun run build` from the repository root → 0.
- Import script run → summary printed; second run → identical counts.
- DB count queries above.

### Repository-wide checks
- `bun run lint` → 0 errors.

### Manual/browser verification
- `/admin/tools`: create "Test tool" with an uploaded PNG icon → appears in the list and in the DB; edit its description → persisted; delete → gone. Same for `/admin/books`. `/admin/tools/sections`: move a slug between sections → `/tools` reflects it. Evidence: DB counts and a screenshot or the curl of `/tools`.

### Portability confirmation
No planner paths or planner-only tools; port 3000 default.

## Out of scope
- Drag-and-drop ordering, rich text, search, pagination in admin lists, image deletion from R2, per-tool pages.
- The home page's commented-out bookshelf section stays commented out.

## Open questions
- Whether book `keywords` should be editable in the form. Implementer may decide (default: a comma-separated text input). Flag in report.
- Whether to keep the `/admin/uploads` test page. Implementer may decide.
