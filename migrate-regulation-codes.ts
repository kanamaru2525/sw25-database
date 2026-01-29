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

async function migrateRegulationCodes() {
  console.log('既存データのregulationコードを新形式に移行しています...\n')

  const mapping = [
    { old: 'TYPE_I', new: 'Ⅰ' },
    { old: 'TYPE_II', new: 'Ⅱ' },
    { old: 'TYPE_III', new: 'Ⅲ' },
  ]

  for (const { old, new: newCode } of mapping) {
    console.log(`${old} → ${newCode} に更新中...`)

    const [weapons, armors, items, spells, combatFeats, specialSkills] = await Promise.all([
      prisma.$executeRaw`UPDATE "Weapon" SET regulation = ${newCode} WHERE regulation = ${old}`,
      prisma.$executeRaw`UPDATE "Armor" SET regulation = ${newCode} WHERE regulation = ${old}`,
      prisma.$executeRaw`UPDATE "Item" SET regulation = ${newCode} WHERE regulation = ${old}`,
      prisma.$executeRaw`UPDATE "Spell" SET regulation = ${newCode} WHERE regulation = ${old}`,
      prisma.$executeRaw`UPDATE "CombatFeat" SET regulation = ${newCode} WHERE regulation = ${old}`,
      prisma.$executeRaw`UPDATE "SpecialSkill" SET regulation = ${newCode} WHERE regulation = ${old}`,
    ])

    console.log(`  Weapon: ${weapons}件`)
    console.log(`  Armor: ${armors}件`)
    console.log(`  Item: ${items}件`)
    console.log(`  Spell: ${spells}件`)
    console.log(`  CombatFeat: ${combatFeats}件`)
    console.log(`  SpecialSkill: ${specialSkills}件`)
    console.log()
  }

  console.log('移行完了！')
}

migrateRegulationCodes()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
