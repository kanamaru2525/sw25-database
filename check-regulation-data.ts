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

async function checkRegulations() {
  console.log('Itemテーブルのregulation値を確認中...\n')
  
  const items = await prisma.item.findMany({
    select: { id: true, name: true, regulation: true, itemType: true },
    take: 10
  })
  
  console.log('最初の10件のアイテム:')
  items.forEach(item => {
    console.log(`  ${item.itemType}: ${item.name} - regulation: ${item.regulation}`)
  })
  
  console.log('\n\nRegulationConfigテーブルの内容:')
  const regulations = await prisma.regulationConfig.findMany({
    orderBy: { order: 'asc' }
  })
  
  regulations.forEach(reg => {
    console.log(`  code: ${reg.code}, name: ${reg.name}`)
  })
}

checkRegulations()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
