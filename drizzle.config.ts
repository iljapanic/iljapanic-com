import { defineConfig } from 'drizzle-kit'

// Bun loads `.env` automatically for `bun run` scripts, so no dotenv import.
const url = process.env.DATABASE_URL

if (!url) {
	throw new Error('DATABASE_URL is not set')
}

export default defineConfig({
	dialect: 'postgresql',
	schema: './db/schema.ts',
	out: './drizzle',
	dbCredentials: { url },
})
