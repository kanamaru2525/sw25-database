import { PrismaClient, SkillCategory } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

const categories = [
  { code: SkillCategory.ENHANCER, name: '練技', order: 1 },
  { code: SkillCategory.BARD_SONG, name: '呪歌', order: 2 },
  { code: SkillCategory.BARD_SONG_FINALE, name: '終律', order: 3 },
  { code: SkillCategory.RIDER, name: '騎芸', order: 4 },
  { code: SkillCategory.ALCHEMIST, name: '賦術', order: 5 },
  { code: SkillCategory.GEOMANCER, name: '鎮域', order: 6 },
  { code: SkillCategory.WARLEADER_KOUHAI, name: '鼓吠', order: 7 },
  { code: SkillCategory.WARLEADER_JINRITSU, name: '陣律', order: 8 },
  { code: SkillCategory.DARKHUNTER, name: '相域', order: 9 },
]

async function main() {
  console.log('カテゴリーのシード開始...')

  for (const category of categories) {
    const existing = await prisma.skillCategoryConfig.findUnique({
      where: { code: category.code },
    })

    if (existing) {
      console.log(`${category.name}は既に存在します`)
      // 既存の場合は名前とorderを更新
      await prisma.skillCategoryConfig.update({
        where: { code: category.code },
        data: {
          name: category.name,
          order: category.order,
        },
      })
      console.log(`${category.name}を更新しました`)
    } else {
      await prisma.skillCategoryConfig.create({
        data: category,
      })
      console.log(`${category.name}を作成しました`)
    }
  }

  console.log('カテゴリーのシード完了！')
}

main()
  .catch((e) => {
    console.error('エラー:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
