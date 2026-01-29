import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// カテゴリー設定とフィールド設定の初期化
export async function POST() {
  try {
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
      await prisma.skillCategoryConfig.upsert({
        where: { code: cat.code as any },
        create: cat as any,
        update: { name: cat.name, order: cat.order },
      })
    }

    // 2. 呪歌・終律用のカスタムフィールドを作成
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
    }

    // 3. 騎芸用のカスタムフィールドを作成
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
    }

    return NextResponse.json({
      success: true,
      message: '特殊技能の初期化が完了しました',
    })
  } catch (error) {
    console.error('初期化エラー:', error)
    return NextResponse.json(
      { error: '初期化に失敗しました', details: String(error) },
      { status: 500 }
    )
  }
}
