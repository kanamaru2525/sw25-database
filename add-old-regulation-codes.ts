import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function addOldRegulationCodes() {
  console.log('古いレギュレーションコードを追加しています...\n')
  
  const oldRegulations = [
    { code: 'TYPE_I', name: 'ルルブ1', order: 101 },
    { code: 'TYPE_II', name: 'ルルブ2', order: 102 },
    { code: 'TYPE_III', name: 'ルルブ3', order: 103 },
  ]

  for (const reg of oldRegulations) {
    const result = await prisma.regulationConfig.upsert({
      where: { code: reg.code },
      update: {},
      create: reg,
    })
    console.log(`✓ ${reg.code} (${reg.name})`)
  }

  console.log('\n完了！')
}

addOldRegulationCodes()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
