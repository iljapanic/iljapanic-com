# 07 — Consolidate frontmatter dates to publishedAt and updatedAt

- **Date**: 2026-09-02
- **Repo**: iljapanic-com
- **Lane**: factory
- **Blast radius**: frontmatter of files under `content/notes`, `content/pages`, `content/posts`, `content/articles` (including draft folders), the two Obsidian templates in `content/_templates`, the `createdAt` field in `content-collections.ts`.

All source paths are relative to the repository root. Runs after spec 05 (Content Collections) is merged; the schema file it edits does not exist before that.

## Goal and end use

The author writes in Obsidian and wants exactly two date fields in frontmatter: `publishedAt` (the official publish date, editable) and `updatedAt` (last tended, maintained automatically by the `update-time-on-edit` plugin). `createdAt` is removed everywhere and must not come back; legacy keys from an older site version are mapped onto the two canonical ones. Rendering does not change.

## Decisions already made

- Canonical keys: `publishedAt`, `updatedAt`. Values stay as they are (`YYYY-MM-DD` or full ISO); the schema coerces both.
- `createdAt` is deleted from every content file and from the schema. Where a file has `createdAt` but no `publishedAt`, `publishedAt` takes the `createdAt` value before deletion (five files: `content/pages/links.md`, `content/notes/drafts/llm-clay.md`, `content/notes/drafts/enclothed-cognition.md`, `content/notes/drafts/civil inattention.md`, `content/notes/drafts/overton-window.md`; re-derive the list with grep, do not trust this one blindly).
- Legacy key mapping (drafts only, verified by grep on 2026-09-02): `date` → `publishedAt`; `updated`, `updatedOn`, `dateUpdated` → `updatedAt`; `published` → `isPublished`. If the target key already exists, keep the existing target and drop the legacy key. Keys `type`, `slug`, and an empty `description` are removed (the schema never had them and the slug comes from the file name). Empty legacy values (`date: ''`) are dropped, not mapped.
- Templates: `content/_templates/posts-template.md` loses the `createdAt` and `type` lines. `content/_templates/note-template.md` is already correct and stays byte-identical.
- The Obsidian plugin config (`content/.obsidian/plugins/update-time-on-edit/data.json`, gitignored) was already changed by the orchestrator: `enableCreateTime: false`. Do not touch `content/.obsidian/**`.
- Edits preserve everything else in each file byte-for-byte: key order of untouched keys, quoting style, body content, trailing newline. Use a small script that rewrites only the frontmatter block, or careful per-file `sed`; do not reformat YAML.
- Package manager Bun; orchestrator commits.

## Constraints (with the why)

- Only the frontmatter block (between the first two `---` lines) may change. — The body is the author's writing.
- Files with spaces in their names exist (`answer engines.md`, `ambient informatics.md`, `civil inattention.md`); quote paths. — Shell word-splitting silently skips them.
- The site must render identically: `updatedAt` drives "Last tended" on notes, `publishedAt` drives dates and sorting; `createdAt` was never rendered. — Verify with the same five-page curl diff used in spec 05.

## Files to touch

- Every file under `content/notes/**`, `content/pages/**`, `content/posts/**`, `content/articles/**` that contains one of: `createdAt`, `date:`, `updated:`, `updatedOn:`, `dateUpdated:`, `published:`, `type:`, `slug:`, or an empty `description:` in its frontmatter.
- `content/_templates/posts-template.md`.
- `content-collections.ts` — remove `createdAt` from the notes and pages schemas (and posts/articles if present).

## Do NOT touch

`content/.obsidian/**`, `content/snippets/**`, `content/_templates/note-template.md`, everything outside `content/` except `content-collections.ts`, `.env*`, `db/**`, `drizzle/**`, `app/**`, `components/**`, `lib/**`.

## Steps

0. From the repository root, produce and save the inventory: `grep -rlE "^(createdAt|date|updated|updatedOn|dateUpdated|published|type|slug|description):" content/notes content/pages content/posts content/articles` and, per file, the matching lines. Record `bun run build` passing and capture the five baseline pages (`/`, `/writing`, `/going-beyond-hci`, `/super-normal-design`, `/colophon`) as in spec 05.
1. Write a one-off script in the scratch area (not in the repo) that, for each inventoried file, parses the frontmatter block line-by-line and applies the mapping rules above, writing back only if something changed. Print a per-file summary of the operations applied.
2. Run it. Re-run the inventory grep: it must return nothing for `createdAt`, `date:`, `updated:`, `updatedOn:`, `dateUpdated:`, `published:`, `type:`, `slug:`.
3. Edit the posts template.
4. Remove `createdAt` from `content-collections.ts`.
5. `bun run build` passes; curl the five pages again and diff against the baseline: no differences beyond whitespace or hashed asset names.
6. `git diff --stat` shows only content files, the template, and `content-collections.ts`. Spot-check three diffs by eye for unintended body changes (`git diff -- "content/notes/drafts/civil inattention.md"` etc.).

## Acceptance criteria

- `grep -rnE "^createdAt:" content/notes content/pages content/posts content/articles content/_templates` prints nothing.
- `grep -rnE "^(date|updated|updatedOn|dateUpdated|published|type|slug):" content/notes content/pages content/posts content/articles` prints nothing.
- `grep -n "createdAt" content-collections.ts` prints nothing.
- Every file that previously had `createdAt` still has a `publishedAt` line (count the files from the Step 0 inventory; each must match `^publishedAt:`).
- `bun run build` exits 0; the five-page diff is clean; `bunx tsc --noEmit` exits 0.
- `git diff --stat` lists no files outside the "Files to touch" set; `git diff` contains no changed body lines (every changed line is inside a frontmatter block).

## Verification method

Tier: build + rendered-page diff against a baseline captured before the change.

### Prerequisites
Bun, Node ≥ 22, `.env` present (build reads `R2_PUBLIC_URL`; other routes need the DB).

### Targeted automated checks
- Inventory greps before and after (covers every legacy key).
- `bun run build` (covers schema validation of every document).
- Five-page curl diff (covers rendering parity).

### Repository-wide checks
- `bunx tsc --noEmit`, `git diff --check`.

### Manual/browser verification
- Open `/super-normal-design`: "Last tended in May 9, 2025" still shows. Evidence: the curl diff.

### Portability confirmation
No planner paths or tools; port 3000 default.

## Out of scope
- Changing date values, publishing drafts, reformatting frontmatter, editing Obsidian settings (done separately), touching `content/snippets`.

## Open questions
- None. Implementer may decide script language (Bun/TypeScript preferred).
