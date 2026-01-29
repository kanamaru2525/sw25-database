import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

const pool = globalForPrisma.pool ?? new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  max: 1, // Vercel環境では接続数を制限
  idleTimeoutMillis: 30000, // 30秒でアイドル接続を切断
  connectionTimeoutMillis: 10000, // 10秒で接続タイムアウト
  ssl: {
    rejectUnauthorized: false,
  },
})

const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL || '',
    },
  },
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.pool = pool
}
