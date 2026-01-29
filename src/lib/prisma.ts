import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

// Vercel Serverless環境用の接続プール設定
const createPool = () => {
  // 本番環境では必ずDIRECT_URLを使用（接続プーリングなし）
  const connectionString = process.env.NODE_ENV === 'production'
    ? process.env.DIRECT_URL
    : (process.env.DIRECT_URL || process.env.DATABASE_URL)

  if (!connectionString) {
    throw new Error('DATABASE_URL or DIRECT_URL must be set')
  }

  console.log('[Prisma] Connecting to database...', {
    env: process.env.NODE_ENV,
    hasDirectUrl: !!process.env.DIRECT_URL,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
  })

  return new Pool({
    connectionString,
    max: 1, // Serverless環境では1接続のみ
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: {
      rejectUnauthorized: false,
    },
  })
}

const pool = globalForPrisma.pool ?? createPool()
const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
})

// グローバルにキャッシュ（開発環境のみ）
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.pool = pool
}
