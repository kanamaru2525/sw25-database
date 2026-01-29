import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

// lib/prismaと同じ方法でprismaクライアントを初期化
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🚀 特殊技能の移行を開始します...')

  // 1. カテゴリー設定を作成
  console.log('\n📋 カテゴリー設定を作成中...')
  const categories = [
    { code: 'ENHANCER', name: '賦術', order: 1 },
    { code: 'BARD_SONG', name: '呪歌', order: 2 },
    { code: 'BARD_FINALE', name: '終律', order: 3 },
    { code: 'RIDER', name: '騎芸', order: 4 },
    { code: 'ALCHEMIST', name: '練技', order: 5 },
    { code: 'GEOMANCER', name: '相域', order: 6 },
    { code: 'WARLEADER_KOUHAI', name: '鼓吠', order: 7 },
    { code: 'WARLEADER_JINRITSU', name: '陣律', order: 8 },
    { code: 'DARKHUNTER', name: '操気', order: 9 },
  ]

  for (const cat of categories) {
    await prisma.skillCategoryConfig.upsert({
      where: { code: cat.code as any },
      create: cat as any,
      update: { name: cat.name, order: cat.order },
    })
    console.log(`  ✅ ${cat.name} (${cat.code})`)
  }

  // 2. 呪歌・終律用のカスタムフィールドを作成
  console.log('\n📝 呪歌・終律のカスタムフィールドを作成中...')
  const bardCategories = ['BARD_SONG', 'BARD_FINALE']
  
  for (const code of bardCategories) {
    const category = await prisma.skillCategoryConfig.findUnique({
      where: { code: code as any },
    })
    
    if (!category) continue

    const bardFields = [
      {
        categoryId: category.id,
        fieldKey: 'hasSinging',
        fieldLabel: '歌唱',
        fieldType: 'BOOLEAN',
        order: 1,
        required: false,
      },
      {
        categoryId: category.id,
        fieldKey: 'condition',
        fieldLabel: '条件',
        fieldType: 'TEXT',
        placeholder: 'なし、➘N、♡M、➚L など',
        order: 2,
        required: false,
      },
      {
        categoryId: category.id,
        fieldKey: 'baseNote',
        fieldLabel: '基礎楽素',
        fieldType: 'TEXT',
        placeholder: '➘N、♡M、➚L など',
        order: 3,
        required: false,
      },
      {
        categoryId: category.id,
        fieldKey: 'skillValue',
        fieldLabel: '巧奏値',
        fieldType: 'NUMBER',
        order: 4,
        required: false,
      },
      {
        categoryId: category.id,
        fieldKey: 'additionalNote',
        fieldLabel: '追加楽素',
        fieldType: 'TEXT',
        placeholder: '➘N、♡M、➚L など',
        order: 5,
        required: false,
      },
    ]

    for (const field of bardFields) {
      await prisma.skillFieldConfig.upsert({
        where: {
          categoryId_fieldKey: {
            categoryId: field.categoryId,
            fieldKey: field.fieldKey,
          },
        },
        create: field as any,
        update: field as any,
      })
    }
    console.log(`  ✅ ${code} のフィールドを作成しました`)
  }

  // 3. 騎芸用のカスタムフィールドを作成
  console.log('\n📝 騎芸のカスタムフィールドを作成中...')
  const riderCategory = await prisma.skillCategoryConfig.findUnique({
    where: { code: 'RIDER' as any },
  })

  if (riderCategory) {
    await prisma.skillFieldConfig.upsert({
      where: {
        categoryId_fieldKey: {
          categoryId: riderCategory.id,
          fieldKey: 'pet',
        },
      },
      create: {
        categoryId: riderCategory.id,
        fieldKey: 'pet',
        fieldLabel: 'ペット',
        fieldType: 'TEXT',
        placeholder: '小鳥、蛙、虫 など',
        order: 1,
        required: false,
      } as any,
      update: {
        fieldLabel: 'ペット',
        fieldType: 'TEXT',
        placeholder: '小鳥、蛙、虫 など',
        order: 1,
        required: false,
      } as any,
    })
    console.log('  ✅ 騎芸のフィールドを作成しました')
  }

  // 4. 既存データの移行（もしあれば）
  console.log('\n🔄 既存データの移行チェック中...')
  
  // 古いテーブル構造からデータを取得して移行
  // ※実際のデータがある場合のみ実行
  try {
    const oldSkills = await prisma.$queryRaw`
      SELECT * FROM "SpecialSkill"
    ` as any[]

    if (oldSkills.length > 0) {
      console.log(`  📦 ${oldSkills.length}件のデータを移行します...`)
      
      for (const skill of oldSkills) {
        const customFields: any = {}
        
        // 古いフィールドをcustomFieldsに移行
        if (skill.hasSinging !== null) customFields.hasSinging = skill.hasSinging
        if (skill.pet) customFields.pet = skill.pet
        if (skill.condition) customFields.condition = skill.condition
        if (skill.baseNote) customFields.baseNote = skill.baseNote
        if (skill.skillValue !== null) customFields.skillValue = skill.skillValue
        if (skill.additionalNote) customFields.additionalNote = skill.additionalNote

        // 新しい構造で保存
        await prisma.specialSkill.update({
          where: { id: skill.id },
          data: {
            customFields: Object.keys(customFields).length > 0 ? customFields : null,
          },
        })
      }
      
      console.log('  ✅ データ移行完了')
    } else {
      console.log('  ℹ️  移行対象のデータがありません')
    }
  } catch (error) {
    console.log('  ℹ️  既存データなし、または既に移行済み')
  }

  console.log('\n✨ 移行完了！')
}

main()
  .catch((e) => {
    console.error('❌ エラーが発生しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
