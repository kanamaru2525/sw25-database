import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

async function checkFairySpells() {
  try {
    const spells = await prisma.spell.findMany({
      where: {
        type: 'YOSEI'
      },
      select: {
        name: true,
        level: true,
        fairyAttributes: true
      },
      take: 20
    })

    console.log('妖精魔法データ:')
    spells.forEach(spell => {
      console.log(`- ${spell.name} (Lv.${spell.level}) [${spell.fairyAttributes.join(', ') || '属性なし'}]`)
    })
    console.log(`\n合計: ${spells.length}件`)
  } catch (error) {
    console.error('エラー:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkFairySpells()
