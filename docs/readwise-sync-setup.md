# Readwise Sync API Setup

This document explains how to set up and use the Readwise highlights sync functionality.

## Overview

The Readwise sync API allows you to automatically sync all your highlights from Readwise into your Postgres database. It's designed to run via cron jobs and handles:

- Incremental syncing (only fetches changes since last sync)
- Duplicate prevention using upsert operations
- Complete data model including books, highlights, and tags
- Comprehensive error handling and logging

## Environment Variables

Add these to your `.env` file:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"

# API Authentication
API_KEY="your-secure-api-key-here"

# Readwise Integration
READWISE_ACCESS_TOKEN="your-readwise-access-token-here"
```

### Getting Your Readwise Access Token

1. Go to [readwise.io/access_token](https://readwise.io/access_token)
2. Copy your access token
3. Add it to your `.env` file as `READWISE_ACCESS_TOKEN`

## Database Setup

1. **Run Prisma migrations** (create the migration first):
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Or push the schema directly** (for development):
   ```bash
   npx prisma db push
   ```

## API Endpoints

### POST `/api/commonplace/sync`

Syncs highlights from Readwise to your database.

**Authentication**: Required (API key)

**Headers**:
```
Authorization: Bearer your-api-key
# OR
x-api-key: your-api-key
```

**Response**:
```json
{
  "success": true,
  "message": "Sync completed successfully",
  "bookCount": 42,
  "highlightCount": 1337
}
```

### GET `/api/commonplace/sync`

Gets sync status and database statistics.

**Authentication**: Required (API key)

**Response**:
```json
{
  "stats": {
    "totalBooks": 42,
    "totalHighlights": 1337,
    "totalTags": 89
  },
  "recentSyncs": [
    {
      "id": 1,
      "syncedAt": "2024-01-01T12:00:00Z",
      "status": "success",
      "message": "Successfully synced 5 books and 23 highlights",
      "bookCount": 5,
      "highlightCount": 23
    }
  ]
}
```

## Usage Examples

### Manual Sync via cURL

```bash
curl -X POST "http://localhost:3000/api/commonplace/sync" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json"
```

### Daily Cron Job

Add this to your crontab to sync daily at 2 AM:

```bash
0 2 * * * curl -X POST "https://yourdomain.com/api/commonplace/sync" -H "Authorization: Bearer your-api-key" > /dev/null 2>&1
```

### Using a service like GitHub Actions

```yaml
name: Sync Readwise
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Sync Readwise
        run: |
          curl -X POST "${{ secrets.SYNC_URL }}" \
            -H "Authorization: Bearer ${{ secrets.API_KEY }}" \
            -H "Content-Type: application/json"
```

## Database Schema

The sync creates the following tables:

- **readwise_books**: Book/article metadata from Readwise
- **readwise_highlights**: Individual highlights with text, notes, and metadata
- **readwise_tags**: Tag names (shared between books and highlights)
- **readwise_book_tags**: Many-to-many relationship between books and tags
- **readwise_highlight_tags**: Many-to-many relationship between highlights and tags
- **readwise_sync_logs**: Audit trail of sync operations

## Key Features

### Incremental Sync
- Only fetches data updated since the last successful sync
- Uses the `updatedAfter` parameter from Readwise API
- Significantly faster for regular syncs

### Duplicate Prevention
- Uses Prisma's `upsert` operations
- Books are identified by `user_book_id` from Readwise
- Highlights are identified by `readwise_id` from Readwise
- Tags are identified by name

### Error Handling
- Comprehensive error logging in `sync_logs` table
- Failed syncs don't prevent future syncs
- Detailed error messages for debugging

### Data Integrity
- Foreign key relationships ensure data consistency
- Soft deletes supported (via `is_deleted` fields)
- Timestamps track creation and updates

## Troubleshooting

### Common Issues

1. **"Invalid Readwise access token"**
   - Verify your token at [readwise.io/access_token](https://readwise.io/access_token)
   - Make sure `READWISE_ACCESS_TOKEN` is set correctly

2. **"Unauthorized"**
   - Check that `API_KEY` is set in your environment
   - Verify you're sending the correct header

3. **Database connection errors**
   - Verify `DATABASE_URL` is correct
   - Ensure Postgres is running and accessible
   - Run `npx prisma db push` to ensure schema is up to date

### Checking Logs

Query recent sync logs:

```sql
SELECT * FROM readwise_sync_logs ORDER BY synced_at DESC LIMIT 10;
```

Check for failed syncs:

```sql
SELECT * FROM readwise_sync_logs WHERE status = 'error' ORDER BY synced_at DESC;
```

## Rate Limiting

The Readwise API has rate limits:
- Default: 240 requests per minute
- Export endpoint: 20 requests per minute

The sync includes a 100ms delay between paginated requests to be respectful of these limits.
