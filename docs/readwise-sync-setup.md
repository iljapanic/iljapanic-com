# Readwise sync

The commonplace page is fed by a daily sync from Readwise into a Neon Postgres
database via Drizzle ORM. Only Readwise books tagged `@share` are fetched and
stored; every run is a full reconcile, so tag removals, deleted highlights and
edits all propagate.

## Environment variables

| Variable                | Used by                                         |
| ----------------------- | ----------------------------------------------- |
| `DATABASE_URL`          | Drizzle client (`db/index.ts`) and drizzle-kit  |
| `READWISE_ACCESS_TOKEN` | Sync job (`lib/readwise-sync.ts`)               |
| `API_KEY`               | `/api/commonplace/sync` and `/api/commonplace/shared` |
| `CRON_SECRET`           | `/api/cron/readwise-sync`                       |

Every variable is required where it is read; a missing value throws or returns
a 500 with an explicit message. There are no fallbacks. `.env.example` lists
all of them. Get the Readwise token at
[readwise.io/access_token](https://readwise.io/access_token).

## Database

Schema lives in `db/schema.ts`, migrations in `drizzle/`.

```bash
bun run db:generate   # write a new migration from schema changes into drizzle/
bun run db:migrate    # apply pending migrations to DATABASE_URL
bun run db:studio     # browse the database
```

`bun run db:push` exists for local experimentation only; never use it against
production. Commit generated migration files.

Tables (all prefixed `readwise_` so later CMS tables do not collide):

- `readwise_books`: one row per shared Readwise book, keyed by `readwise_id`,
  with a unique `slug` used in `/commonplace/<slug>` URLs.
- `readwise_highlights`: highlights per book, keyed by `readwise_id`.
- `readwise_tags`: normalised tag names (`name`) plus display `label`.
- `readwise_book_tags`, `readwise_highlight_tags`: many-to-many links.
- `readwise_sync_runs`: one row per sync run with status, trigger and counts.

## Scheduled sync (Vercel cron)

`vercel.json` schedules `GET /api/cron/readwise-sync` at `0 0 * * *` (midnight
UTC). Vercel sends `Authorization: Bearer <CRON_SECRET>`; the route returns 401
without it and 500 if `CRON_SECRET` is unset.

## Manual trigger

```bash
curl -X POST https://iljapanic.com/api/commonplace/sync \
  -H "Authorization: Bearer $API_KEY"
```

The `x-api-key: $API_KEY` header works too. Response:

```json
{ "runId": 12, "bookCount": 77, "highlightCount": 540, "removedBookCount": 0, "durationMs": 8123 }
```

## Status endpoint

```bash
curl https://iljapanic.com/api/commonplace/sync -H "Authorization: Bearer $API_KEY"
```

Returns `stats` (`totalBooks`, `totalHighlights`, `totalTags`) and
`recentRuns`, the last 10 rows of `readwise_sync_runs` newest first.

## Reconcile algorithm

`runReadwiseSync(trigger)` in `lib/readwise-sync.ts`:

- Lists every book via `GET /api/v2/books/` and keeps those with a tag equal
  to `@share` (case-insensitive). Nothing else is fetched.
- Exports those books in chunks of 50 via `GET /api/v2/export/?ids=...`,
  dropping deleted books and deleted or discarded highlights. Tag names are
  trimmed, lower-cased and whitespace-joined with `-`; `@share` itself is
  never stored.
- Assigns slugs: existing rows keep theirs; new books get `slugify(title)`
  (max 80 chars) suffixed with the Readwise id on collision.
- In one transaction: deletes books no longer shared (cascading), upserts
  tags, books and highlights, rebuilds the tag link tables, and deletes tags
  nothing references any more.
- Records the run in `readwise_sync_runs` (`running` → `success` or `error`
  with the message) and returns the counts.

HTTP 429 from Readwise is retried up to 3 times honouring `Retry-After`; any
other error aborts the run and is recorded on the run row.
