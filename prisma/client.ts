import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/prisma/generated/client/client'

declare global {
  var prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required to initialize Prisma')
}

const adapter = new PrismaPg({ connectionString })

export const prisma = globalThis.prisma ?? new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
})

if (typeof window === 'undefined') {
  globalThis.prisma = prisma
}
