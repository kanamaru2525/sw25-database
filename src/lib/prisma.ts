import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

// Vercel Serverless環境用の接続プール設定
const createPool = () => {
  try {
    // 本番環境では必ずDIRECT_URLを使用（接続プーリングなし）
    const connectionString = process.env.NODE_ENV === 'production'
      ? process.env.DIRECT_URL
      : (process.env.DIRECT_URL || process.env.DATABASE_URL)

    if (!connectionString) {
      const error = new Error('DATABASE_URL or DIRECT_URL must be set')
      console.error('[Prisma] Configuration error:', error)
      throw error
    }

    console.log('[Prisma] Creating connection pool...', {
      env: process.env.NODE_ENV,
      hasDirectUrl: !!process.env.DIRECT_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    })

    const pool = new Pool({
      connectionString,
      max: 1, // Serverless環境では1接続のみ
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: {
        rejectUnauthorized: false,
      },
    })

    pool.on('error', (err) => {
      console.error('[Prisma] Pool error:', err)
    })

    console.log('[Prisma] Pool created successfully')
    return pool
  } catch (error) {
    console.error('[Prisma] Failed to create pool:', error)
    throw error
  }
}

const createPrismaClient = () => {
  try {
    const pool = globalForPrisma.pool ?? createPool()
    const adapter = new PrismaPg(pool)

    console.log('[Prisma] Creating PrismaClient...')
    
    const client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
    })

    console.log('[Prisma] PrismaClient created successfully')
    
    // グローバルにキャッシュ（開発環境のみ）
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.pool = pool
    }
    
    return client
  } catch (error) {
    console.error('[Prisma] Failed to create PrismaClient:', error)
    throw error
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// グローバルにキャッシュ（開発環境のみ）
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
