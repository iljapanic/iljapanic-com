import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from '@/db/schema'

function createDb() {
	const connectionString = process.env.DATABASE_URL

	if (!connectionString) {
		throw new Error('DATABASE_URL is not set')
	}

	const pool = new Pool({ connectionString })
	return drizzle({ client: pool, schema })
}

type Db = ReturnType<typeof createDb>

// Cache the client on globalThis in development so HMR does not open a new
// pool on every reload.
const globalForDb = globalThis as unknown as { drizzleDb?: Db }

export const db = globalForDb.drizzleDb ?? createDb()

if (process.env.NODE_ENV !== 'production') {
	globalForDb.drizzleDb = db
}

export { schema }
