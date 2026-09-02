# 06 — Cleanup: unused dependencies, dead imports, test page

- **Date**: 2026-09-02
- **Repo**: iljapanic-com
- **Lane**: factory
- **Blast radius**: `package.json` / `bun.lock`, the files ESLint flags for unused imports, the temporary `/admin/uploads` page and its nav link, `README`-level docs only if they mention removed tools.

All source paths are relative to the repository root. Runs after spec 05 is merged.

## Goal and end use

Leave the repository tidy after the migration: no npm packages that nothing imports, no lint warnings for unused imports, no leftover admin test page. Behaviour and rendered output do not change.

## Decisions already made

- Removal is grep-driven: a package is removed only if a repository-wide grep (excluding `node_modules`, `.next`, `.content-collections`, `docs/`, `bun.lock`) finds no import, `require`, `@plugin`, `@import` or config reference. The audit on 2026-09-02 found these unused: `next-mdx-remote`, `remark-obsidian`, `rehype-highlight`, `remark-prism`, `styled-components`, `@microlink/react`, `usehooks-ts`, `@react-hook/size`, `@n8tb1t/use-scroll-position`, `react-headroom`, `slugify` (the repo uses its own `slugify` in `lib/utils.ts`), `@react-pdf/renderer`, `tailwindcss-fluid-type`, `tailwindcss-animate` (Tailwind v4 config has `plugins: []`), `@icons-pack/react-simple-icons`, `postcss-nesting`, `autoprefixer` (`postcss.config.mjs` only loads `@tailwindcss/postcss`), `@types/uuid` (uuid 14 ships its own types). Re-verify each before removing; if spec 05 already removed `rehype-pretty-code` / `shiki`, skip them, otherwise include them if unused.
- Keep: `@mdx-js/loader`, `@mdx-js/react` (peer dependencies of `@next/mdx`), `uuid` (used by resume components), `tailwind.config.ts` (loaded through `@config` in `styles/globals.css`), `scripts/import-keystatic.ts` (documents the one-off migration), `docs/readwise-api-docs.md`.
- Unused-import warnings: fix every `@typescript-eslint/no-unused-vars` warning ESLint reports by deleting the unused import or binding. Do not restructure code, do not rename, do not touch logic. The two `@next/next/no-img-element` warnings stay (the raw `<img>` for Readwise covers is intentional; the resume attachment one is out of scope).
- Delete `app/admin/(protected)/uploads/page.tsx` and the "Uploads" link in `components/admin/admin-nav.tsx`. `ImageUploadField` stays (used by the tool and book forms).
- Package manager Bun (`bun remove …`); orchestrator commits.

## Constraints (with the why)

- Removing a binding that is referenced only in a comment or commented-out JSX is fine; removing one that is referenced in live code is not. Run the typecheck after every batch. — Warnings can be stale.
- No repo-wide formatter run. — Keep the diff to intended lines.
- Do not delete `content/**`, `public/**`, or any route. — Not cleanup.

## Files to touch

- `package.json`, `bun.lock` (via `bun remove`).
- Every file ESLint currently reports with an unused-import warning (list them with `bun run lint` before editing; expected around 15 files under `app/` and `components/`, plus `content-collections.ts`/`lib/` only if spec 05 left something).
- `components/admin/admin-nav.tsx`.
- Delete `app/admin/(protected)/uploads/page.tsx`.

## Do NOT touch

`.env*`, `content/**`, `public/**`, `db/**`, `drizzle/**`, `lib/**` (unless a lint warning points there), `scripts/**`, `docs/**`, `styles/**`, `tailwind.config.ts`, `next.config.mjs`, `vercel.json`, `tsconfig.json`, `AGENTS.md`, `CLAUDE.md`.

## Steps

0. From the repository root: `bun run lint` and save the warning list. `bunx tsc --noEmit` must pass before you start.
1. For each candidate package, run the grep described above; remove the confirmed-unused ones in one `bun remove` command.
2. `bunx tsc --noEmit` and `bun run build` must still pass. If the build fails because of a removed package, restore that one package with `bun add` at its previous version and note it in the report.
3. Fix the unused-import warnings file by file. Re-run `bun run lint` until the only remaining warnings are the two `no-img-element` ones.
4. Delete the uploads test page and its nav link.
5. `bunx tsc --noEmit`, `bun run lint`, `bun run build`, `git diff --check`.

## Acceptance criteria

- `bun run lint` reports 0 errors and at most 2 warnings, both `@next/next/no-img-element`.
- `bunx tsc --noEmit` exits 0; `bun run build` exits 0; `git diff --check` is clean.
- `grep -E '"(next-mdx-remote|remark-obsidian|rehype-highlight|remark-prism|styled-components|@microlink/react|usehooks-ts|@react-hook/size|@n8tb1t/use-scroll-position|react-headroom|slugify|@react-pdf/renderer|tailwindcss-fluid-type|tailwindcss-animate|@icons-pack/react-simple-icons|postcss-nesting|autoprefixer|@types/uuid)"' package.json` prints nothing (minus any package you had to restore, which the report must name).
- `test ! -f "app/admin/(protected)/uploads/page.tsx"` and `grep -c "/admin/uploads" components/admin/admin-nav.tsx` prints 0.
- `git diff HEAD --stat` shows no files outside the lists above.

## Verification method

Tier: typecheck + lint + build. No server needed.

### Prerequisites
Bun, Node ≥ 22, `.env` present (the build reads `R2_PUBLIC_URL`).

### Targeted automated checks
- `bun run lint` warning count as above.
- `bun run build` → 0 (covers packages that were referenced only at build time).

### Repository-wide checks
- `bunx tsc --noEmit`, `git diff --check`.

### Manual/browser verification
- None required. If in doubt about a removed package, `bun run build` is the arbiter.

### Portability confirmation
No planner paths or planner-only tools.

## Out of scope
- Fixing `no-img-element` warnings, refactors, renaming, formatting, README rewrites, removing `docs/plans`.

## Open questions
- None. Implementer decides the order of edits.
