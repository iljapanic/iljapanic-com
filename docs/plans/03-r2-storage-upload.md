# 03 — Cloudflare R2 storage helper and admin image upload

- **Date**: 2026-09-02
- **Repo**: iljapanic-com
- **Lane**: factory
- **Blast radius**: `lib/storage.ts`, one admin-only upload route, one client upload field component, `next.config.mjs` remote image pattern, package.json deps.

All source paths are relative to the repository root. Depends on spec 02 (`requireAdmin` in `lib/admin.ts`, `app/admin/**` tree).

## Goal and end use

Give the admin a way to put images (tool icons, book covers, later anything else) into a Cloudflare R2 bucket and get back a public URL that `next/image` can render. Uploads go through a small authenticated route handler on the server, so the bucket needs no CORS configuration and credentials never reach the browser. Spec 04 uses the upload field inside the tools and books forms.

## Decisions already made

- Storage: Cloudflare R2 via the S3-compatible API. SDK: `@aws-sdk/client-s3` only (no presigner; uploads are server-side).
- Endpoint `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, `region: 'auto'`, credentials from `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`, bucket `R2_BUCKET_NAME`, public base `R2_PUBLIC_URL` (no trailing slash). All five must be set; missing → throw naming the variable, inside the function that needs it.
- Upload path: `POST /api/admin/upload` (multipart form field `file`, optional text field `folder`), admin session required via `requireAdmin()`. Response `{ url, key }`.
- Object keys: `${folder}/${yyyy}/${slugifiedBaseName}-${8 random hex}.${ext}`; `folder` restricted to `[a-z0-9-]{1,32}`, default `uploads`. Allowed content types: `image/png`, `image/jpeg`, `image/webp`, `image/svg+xml`, `image/gif`, `image/avif`. Max size 4 MB (Vercel request body limit is 4.5 MB).
- Objects are uploaded with `ContentType` set and `CacheControl: 'public, max-age=31536000, immutable'` (keys are unique, so long caching is safe).
- Deletion helper exists (`deleteObject(key)`) but no delete route yet.
- `next/image`: the hostname of `R2_PUBLIC_URL` is added to `images.remotePatterns` in `next.config.mjs` by reading the env var at config time; if the var is unset at build time, throw with a clear message (fail fast).
- Package manager Bun; orchestrator commits.

## Constraints (with the why)

- No presigned URLs / browser-direct uploads. — Avoids bucket CORS setup and keeps the flow simple for one admin.
- `lib/storage.ts` is server-only by convention (no `server-only` package installed): never import it from a `'use client'` file. — Credentials.
- Do not add a general-purpose media library UI. — Out of scope; spec 04 needs only a field.
- Keep the existing code style; no repo-wide formatting.

## Files to touch

Create:
- `lib/storage.ts` — `getStorageConfig()`, `uploadObject({ key, body, contentType })` → public URL, `deleteObject(key)`, `publicUrl(key)`, `buildObjectKey({ folder, fileName })`.
- `app/api/admin/upload/route.ts` — `POST` handler.
- `components/admin/image-upload-field.tsx` — `'use client'`; props `{ name: string; value?: string | null; onChange?: (url: string | null) => void; folder?: string; label?: string }`; renders a hidden input carrying the current URL (so plain `<form action>` server actions can read it), a preview thumbnail when a value exists, a file input, an upload button state, and a "Remove" button that clears the value (does not delete the object). Uploads via `fetch('/api/admin/upload', { method: 'POST', body: FormData })`, toasts errors.
- `app/admin/(protected)/uploads/page.tsx` — a tiny test page: heading "Upload test" and one `<ImageUploadField name="url" folder="test" />` plus the resulting URL printed beneath. Exists so the feature is verifiable on its own; spec 04 may delete it.

Edit:
- `next.config.mjs` — add the R2 public hostname to `images.remotePatterns`.
- `package.json` — add `@aws-sdk/client-s3`; `bun install` allowed.
- `bun.lock`.
- `components/admin/admin-nav.tsx` — add a link to `/admin/uploads`.

## Do NOT touch

- `.env`, `.env.example`, `db/**`, `drizzle/**`, `lib/auth*.ts`, `lib/admin.ts`, `lib/readwise*.ts`, `app/api/auth/**`, `app/api/commonplace/**`, `app/api/cron/**`, `app/(main)/**`, `app/(plain)/**`, `content/**`, `public/**`, `keystatic*`, `contentlayer*`, `schema/**`, `styles/**`, `tsconfig.json`, `vercel.json`.

## Steps

0. Confirm `.env` defines the five `R2_*` names. Confirm `requireAdmin` exists in `lib/admin.ts`.
1. `bun add @aws-sdk/client-s3`.
2. `lib/storage.ts` as described. `S3Client` created lazily and cached at module level. `uploadObject` uses `PutObjectCommand` with `Body` as `Uint8Array`/`Buffer`. `publicUrl(key)` = `${R2_PUBLIC_URL}/${key}`.
3. Route handler: `await requireAdmin()` (it redirects on failure; for an API route instead check the session directly with `auth.api.getSession` and return 401 JSON — do this, do not redirect). Parse `await request.formData()`, validate `file` is a `File`, type in the allow list, size ≤ 4 MB, `folder` matches the regex. `await uploadObject(...)`, return `{ url, key }` with 201. Errors → 400 with `{ error }`. `export const runtime = 'nodejs'`.
4. Upload field component and the test page.
5. `next.config.mjs`: `const r2PublicUrl = process.env.R2_PUBLIC_URL; if (!r2PublicUrl) throw new Error('R2_PUBLIC_URL is not set')`; push `{ protocol: 'https', hostname: new URL(r2PublicUrl).hostname, pathname: '/**' }` into `remotePatterns`.
6. Nav link.

## Acceptance criteria

- `bunx tsc --noEmit` exits 0; `bun run lint` no errors; `bun run build` exits 0 and lists `/api/admin/upload` and `/admin/uploads`.
- `grep -n "R2_PUBLIC_URL" next.config.mjs` matches; `grep -rn "from '@/lib/storage'" components/` prints nothing.
- HTTP (dev server running; admin cookie jar obtained the same way as in spec 02 — read the magic-link token from the `verification` table):
  - Unauthenticated `curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:3000/api/admin/upload -F file=@public/icon.png` (or any small PNG in `public/`) prints `401`.
  - Authenticated upload of a PNG prints `201` and a JSON body whose `url` starts with the `R2_PUBLIC_URL` value; `curl -s -o /dev/null -w '%{http_code}' "<that url>"` prints `200` and `content-type: image/png` (use `-I`).
  - Authenticated upload of a `.txt` file prints `400`.
  - Authenticated `GET /admin/uploads` returns 200 and contains "Upload test".
- Delete the test object afterwards with `deleteObject` via a `bun -e` one-liner (or leave it; it is under `test/`). Delete `cookies.txt`.

## Verification method

Tier: typecheck + build, then drive the upload over HTTP and fetch the object back from the public URL.

### Prerequisites
Bun, Node ≥ 22, `.env` with `R2_*` populated and the bucket configured with public access at `R2_PUBLIC_URL`, spec 02 applied.

### Targeted automated checks
- From the repository root: `bunx tsc --noEmit` → 0. `bun run build` → 0. The curl sequence above (covers auth gate, validation, upload, public read-back).

### Repository-wide checks
- `bun run lint` → 0 errors.

### Manual/browser verification
- Surface `/admin/uploads`: choose a PNG, see the preview and the URL. If the bucket is not publicly readable, the read-back returns 403/404 → report BLOCKED with the status and say the bucket needs public access or a custom domain.

### Portability confirmation
No planner paths, hosts, or planner-only tools; port 3000 is Next's default.

## Out of scope
- Presigned browser uploads, image resizing, a media library, deleting objects from the UI.

## Open questions
- None requiring the user. Implementer may choose the hex id length ≥ 8 (flag in report).
