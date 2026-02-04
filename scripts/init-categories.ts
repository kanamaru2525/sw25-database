import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// 接続プールを作成
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL or DIRECT_URL must be set')
}

const pool = new Pool({
  connectionString,
  max: 1,
  ssl: { rejectUnauthorized: false },
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
})

async function main() {
  console.log('🚀 特殊技能の初期化を開始します...')

  // 1. カテゴリー設定を作成
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
    const result = await prisma.skillCategoryConfig.upsert({
      where: { code: cat.code },
      create: cat,
      update: { name: cat.name, order: cat.order },
    })
    console.log(`✅ カテゴリー作成: ${result.name} (${result.code})`)
  }

  // 2. 呪歌・終律用のカスタムフィールドを作成
  const bardCategories = ['BARD_SONG', 'BARD_FINALE']
  
  for (const code of bardCategories) {
    const category = await prisma.skillCategoryConfig.findUnique({
      where: { code },
    })
    
    if (!category) continue

    const bardFields = [
      {
        categoryId: category.id,
        fieldKey: 'hasSinging',
        fieldLabel: '歌唱',
        fieldType: 'boolean',
        order: 1,
        required: false,
      },
      {
        categoryId: category.id,
        fieldKey: 'condition',
        fieldLabel: '条件',
        fieldType: 'text',
        placeholder: 'なし、➘N、♡M、➚L など',
        order: 2,
        required: false,
      },
      {
        categoryId: category.id,
        fieldKey: 'baseNote',
        fieldLabel: '基礎楽素',
        fieldType: 'text',
        placeholder: '➘N、♡M、➚L など',
        order: 3,
        required: false,
      },
      {
        categoryId: category.id,
        fieldKey: 'skillValue',
        fieldLabel: '巧奏値',
        fieldType: 'number',
        order: 4,
        required: false,
      },
      {
        categoryId: category.id,
        fieldKey: 'additionalNote',
        fieldLabel: '追加楽素',
        fieldType: 'text',
        placeholder: '➘N、♡M、➚L など',
        order: 5,
        required: false,
      },
    ]

    for (const field of bardFields) {
      const result = await prisma.skillFieldConfig.upsert({
        where: {
          categoryId_fieldKey: {
            categoryId: field.categoryId,
            fieldKey: field.fieldKey,
          },
        },
        create: field,
        update: field,
      })
      console.log(`  ✅ フィールド作成: ${category.name} - ${result.fieldLabel}`)
    }
  }

  // 3. 騎芸用のカスタムフィールドを作成
  const riderCategory = await prisma.skillCategoryConfig.findUnique({
    where: { code: 'RIDER' },
  })

  if (riderCategory) {
    const result = await prisma.skillFieldConfig.upsert({
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
        fieldType: 'text',
        placeholder: '小鳥、蛙、虫 など',
        order: 1,
        required: false,
      },
      update: {
        fieldLabel: 'ペット',
        fieldType: 'text',
        placeholder: '小鳥、蛙、虫 など',
        order: 1,
        required: false,
      },
    })
    console.log(`  ✅ フィールド作成: ${riderCategory.name} - ${result.fieldLabel}`)
  }

  // 4. 鼓吠用のカスタムフィールドを作成
  const kouhaiCategory = await prisma.skillCategoryConfig.findUnique({
    where: { code: 'WARLEADER_KOUHAI' },
  })

  if (kouhaiCategory) {
    const kouhaiFields = [
      {
        categoryId: kouhaiCategory.id,
        fieldKey: 'targets',
        fieldLabel: '対象',
        fieldType: 'select',
        options: { values: ['全員', 'ファイター', 'グラップラー', 'フェンサー', 'シューター'] },
        order: 1,
        required: false,
      },
      {
        categoryId: kouhaiCategory.id,
        fieldKey: 'effect',
        fieldLabel: '効果',
        fieldType: 'text',
        order: 2,
        required: false,
      },
      {
        categoryId: kouhaiCategory.id,
        fieldKey: 'useTiming',
        fieldLabel: '使用タイミング',
        fieldType: 'text',
        placeholder: '主動作、補助動作、宣言特技 など',
        order: 3,
        required: false,
      },
    ]

    for (const field of kouhaiFields) {
      const result = await prisma.skillFieldConfig.upsert({
        where: {
          categoryId_fieldKey: {
            categoryId: field.categoryId,
            fieldKey: field.fieldKey,
          },
        },
        create: field,
        update: field,
      })
      console.log(`  ✅ フィールド作成: ${kouhaiCategory.name} - ${result.fieldLabel}`)
    }
  }

  console.log('✨ 初期化が完了しました！')
}

main()
  .catch((error) => {
    console.error('❌ エラー:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
