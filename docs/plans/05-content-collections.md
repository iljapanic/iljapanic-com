# 05 — Replace Contentlayer with Content Collections

- **Date**: 2026-09-02
- **Repo**: iljapanic-com
- **Lane**: factory
- **Blast radius**: content pipeline config, the five consumers of `contentlayer/generated`, `next.config.mjs`, `tsconfig.json`, `.gitignore`, ESLint ignores, package.json scripts/deps.

All source paths are relative to the repository root. Independent of specs 02–04 in code, but run after them to avoid concurrent edits.

## Goal and end use

Articles, notes, pages and posts keep living as Markdown/MDX files under `content/`, written in Obsidian. The unmaintained `contentlayer2` build step is replaced by Content Collections (`@content-collections/core`, `@content-collections/next`, `@content-collections/mdx`, `zod`), which does the same job (frontmatter validation, MDX compilation, typed `allNotes`-style exports) with an actively maintained, Next 16-compatible integration. Rendering and page output stay the same.

## Decisions already made

- Library: Content Collections 0.15.x (`@content-collections/core`), `@content-collections/next` 0.2.x, `@content-collections/mdx` 0.2.x, `zod` 4.x. Schema via a Zod object (`schema: z.object({...})`), NOT the removed `schema: (z) => …` form. `content` must be declared in the schema explicitly (`content: z.string()`) — the implicit property is deprecated.
- Config file `content-collections.ts` at the repository root; generated output in `.content-collections/generated` (gitignored); path alias `"content-collections": ["./.content-collections/generated"]` in `tsconfig.json`. Import from `'content-collections'`.
- `withContentCollections` wraps the Next config as the OUTERMOST plugin: `export default withContentCollections(withMDX(nextConfig))`. `next-contentlayer2` and `contentlayer2` are removed; `@next/mdx` stays (the home page imports `content/snippets/*.mdx` directly).
- `build:content` script is removed and `build` becomes plain `next build` (the Next plugin runs the content build). Dev server also runs it.
- Four collections: `articles` (`content/articles`, `**/*.mdx`), `notes` (`content/notes`, `**/*.{md,mdx}`), `pages` (`content/pages`), `posts` (`content/posts`), each with `exclude: ['_drafts/**', 'drafts/**']` (notes use `drafts/`, the others `_drafts/`). `content/snippets`, `content/_templates`, `.obsidian` are outside these directories and need no exclusion.
- Same MDX plugins as today: remark `remark-gfm`, `remark-wiki-link` (`{ aliasDivider: '|', hrefTemplate: (permalink) => `/${permalink}` }`); rehype `rehype-slug`, `rehype-autolink-headings` (`{ properties: { className: ['anchor'] } }`). `rehype-pretty-code` stays out (it was commented out).
- Document shape after `transform` mirrors what the app uses today so consumers change only their imports:
  - `type: 'Article' | 'Note' | 'Page' | 'Post'` literal
  - `slug: string` = file name without extension (`doc._meta.fileName.replace(/\.(mdx|md)$/, '')`)
  - `body: { code: string; raw: string }` where `code` = `await compileMDX(context, document, { remarkPlugins, rehypePlugins })` and `raw` = `document.content`
  - dates (`publishedAt`, `updatedAt`, `createdAt`) as ISO strings: schema `z.coerce.date().transform((d) => d.toISOString())` (frontmatter has both `2025-04-09` and full ISO forms, and one `2024-07-09T10:48`)
  - notes keep `directoryPath` (`doc._meta.directory` → the first path segment or `'_root'` when the file sits directly in `content/notes`) and `wordCount` (`document.content.split(/\s+/).filter(Boolean).length`)
  - all other frontmatter fields exactly as in `schema/contentlayer/*.ts` (same names, required/optional).
- `lib/content.ts` exports `allDocuments` (`[...allArticles, ...allNotes, ...allPages, ...allPosts]`) and the types `Article`, `Note`, `Page`, `Post`, `Document`, re-exported from `content-collections`.
- MDX rendering: `MDXContent` from `@content-collections/mdx/react` with `components={mdxComponents}` replaces `useMDXComponent` from `next-contentlayer2/hooks`.
- Package manager Bun; orchestrator commits.

## Constraints (with the why)

- Rendered HTML of existing pages must not change except for whitespace. — The user wants no visible change.
- Frontmatter validation must fail the build on a bad document, as Contentlayer did. — Catch mistakes early.
- Do not touch the content files. — They are an Obsidian vault.
- No `.contentlayer` references may remain anywhere (`tsconfig`, `.gitignore`, ESLint ignores, `package.json`).

## Files to touch

Create: `content-collections.ts`, `lib/content.ts`.
Edit: `next.config.mjs`, `tsconfig.json` (paths + `include`: replace `.contentlayer/generated` with `.content-collections/generated`), `.gitignore` (replace `.contentlayer` with `.content-collections`), the ESLint flat config at the repository root (replace the `.contentlayer/**` ignore with `.content-collections/**`), `package.json` + `bun.lock` (remove `contentlayer2`, `next-contentlayer2`, `rehype-pretty-code`, `shiki` if unused after this — check with grep — add `@content-collections/core`, `@content-collections/next`, `@content-collections/mdx`, `zod` as devDependencies; `bun install` authorised), `components/post/post.tsx`, `app/(main)/[slug]/page.tsx`, `app/(main)/[slug]/opengraph-image.tsx`, `app/(main)/writing/page.tsx`, `app/(main)/page.tsx`, `components/notes/notes-menu.tsx`.
Delete: `contentlayer.config.ts`, `schema/contentlayer/**`.

## Do NOT touch

`content/**`, `db/**`, `drizzle/**`, `lib/**` except the new `lib/content.ts`, `app/admin/**`, `app/api/**`, `components/**` except the two listed, `styles/**`, `mdx-components.tsx`, `components/mdx/**`, `.env*`, `vercel.json`.

## Steps

0. Record a baseline: with the current build, `curl` the rendered HTML of `/`, `/writing`, one article (`/going-beyond-hci`), one note (`/super-normal-design`), one page (`/colophon`) and save them to the scratch area, then stop the server. Also record `ls .contentlayer/generated` document counts per type (Contentlayer reported "Generated 22 documents").
1. Install packages; remove old ones; update scripts.
2. `content-collections.ts` with the four collections and shared plugin arrays.
3. `tsconfig.json`, `.gitignore`, ESLint ignore, `next.config.mjs`.
4. `lib/content.ts`.
5. Update the six consumers: imports from `'content-collections'` / `'@/lib/content'`, `MDXContent` component in `post.tsx` (`<MDXContent code={post.body.code} components={mdxComponents} />`).
6. Delete Contentlayer config/schema. `grep -rn "contentlayer" --exclude-dir=node_modules --exclude-dir=.next . | grep -v bun.lock | grep -v docs/` prints nothing.
7. Build, then diff the five pages against the baseline (`diff <(sed 's/[[:space:]]\+/ /g' before) <(… after)`); differences must be limited to whitespace, hashed asset names, or React hydration ids. Explain any other diff in the report.

## Acceptance criteria

- `bunx tsc --noEmit` 0; `bun run lint` 0 errors; `bun run build` 0; the build log shows Content Collections generating the same number of documents as the baseline (22 across the four collections — confirm the exact per-collection split from Step 0).
- The contentlayer grep prints nothing; `grep -n "content-collections" tsconfig.json .gitignore next.config.mjs` each match.
- Page diffs as in Step 7.
- Introduce a deliberate frontmatter error in a scratch copy? No — instead verify validation by temporarily adding a file `content/notes/__invalid.md` with a missing `title`, run `bun run build`, observe it fails with a validation error naming the file, then delete the file and confirm the build passes again. (This is the only permitted write under `content/`, and it must be removed.)

## Verification method

Tier: build + rendered-HTML diff against a baseline captured before the change.

### Prerequisites
Bun, Node ≥ 22; the dev/prod server needs `.env` because other routes hit the DB, but the content pages themselves do not.

### Targeted automated checks
- `bun run build` → 0 (covers config, schema, MDX compilation of every document).
- Baseline diff for five pages (covers rendering parity).
- Invalid-frontmatter check (covers validation).

### Repository-wide checks
- `bun run lint`, `bunx tsc --noEmit`.

### Manual/browser verification
- Open `/super-normal-design` and `/going-beyond-hci`: headings have anchor links, wiki links resolve to `/slug`, the abstract block renders on the article. Evidence: the curl diffs.

### Portability confirmation
No planner paths; port 3000 default.

## Out of scope
- Changing content, adding syntax highlighting, changing the MDX component map, touching `content/snippets` imports.

## Open questions
- If `remark-wiki-link` or `rehype-autolink-headings` typings conflict with `compileMDX` option types, cast the plugin arrays (`as any` is NOT acceptable; use the `PluggableList` type from `unified`). Implementer may decide details; flag in report.
