import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'

// .envファイルを読み込む
dotenv.config()

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

async function main() {
  try {
    // ItemType enum を作成（存在しない場合のみ）
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
          CREATE TYPE "ItemType" AS ENUM ('WEAPON', 'ARMOR', 'ACCESSORY');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `)
    console.log('✓ ItemType enum created or already exists')

    // deity カラムを追加（存在しない場合のみ）
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
          ALTER TABLE "Spell" ADD COLUMN "deity" TEXT;
      EXCEPTION
          WHEN duplicate_column THEN null;
      END $$;
    `)
    console.log('✓ deity column added or already exists')

    console.log('Database update completed successfully')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
