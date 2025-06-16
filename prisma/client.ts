import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

if (typeof window === 'undefined') {
  globalThis.prisma = prisma
}
