import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: カスタムフィールドを一括作成（初期化用）
export async function POST() {
  try {
    // 各カテゴリーのカスタムフィールド定義
    // 共通フィールド（level, name, summary, page, regulation, duration, resistance, cost, attribute, target, rangeShape）は除外
    
    const fieldDefinitions = [
      // 1. 練技 (ENHANCER) - 共通フィールドのみなのでカスタムフィールドなし
      {
        categoryCode: 'ENHANCER',
        fields: [],
      },
      
      // 2. 呪歌 (BARD_SONG)
      {
        categoryCode: 'BARD_SONG',
        fields: [
          {
            fieldKey: 'hasSinging',
            fieldLabel: '歌唱',
            fieldType: 'select',
            placeholder: null,
            options: { values: ['有', '無'] },
            order: 1,
            required: true,
          },
          {
            fieldKey: 'pet',
            fieldLabel: 'ペット',
            fieldType: 'select',
            placeholder: null,
            options: { values: ['なし', '小鳥', '蛙', '虫'] },
            order: 2,
            required: false,
          },
          {
            fieldKey: 'condition',
            fieldLabel: '条件',
            fieldType: 'select',
            placeholder: null,
            options: { values: ['なし', '➘N', '♡M', '➚L'] },
            order: 3,
            required: false,
          },
          {
            fieldKey: 'baseNote',
            fieldLabel: '基礎楽素',
            fieldType: 'select',
            placeholder: null,
            options: { values: ['➘N', '♡M', '➚L'] },
            order: 4,
            required: false,
          },
          {
            fieldKey: 'skillValue',
            fieldLabel: '巧奏値',
            fieldType: 'number',
            placeholder: '例: 10',
            options: null,
            order: 5,
            required: false,
          },
          {
            fieldKey: 'additionalNote',
            fieldLabel: '追加楽素',
            fieldType: 'select',
            placeholder: null,
            options: { values: ['なし', '➘N', '♡M', '➚L'] },
            order: 6,
            required: false,
          },
        ],
      },
      
      // 3. 終律 (BARD_FINALE) - 共通フィールドのみ
      {
        categoryCode: 'BARD_FINALE',
        fields: [],
      },
      
      // 4. 騎芸 (RIDER)
      {
        categoryCode: 'RIDER',
        fields: [
          {
            fieldKey: 'prerequisite',
            fieldLabel: '前提',
            fieldType: 'text',
            placeholder: '例: 騎芸Lv3',
            options: null,
            order: 1,
            required: false,
          },
          {
            fieldKey: 'correspondence',
            fieldLabel: '対応',
            fieldType: 'text',
            placeholder: null,
            options: null,
            order: 2,
            required: false,
          },
          {
            fieldKey: 'applicablePart',
            fieldLabel: '適用部位',
            fieldType: 'text',
            placeholder: '例: 頭部、胴体',
            options: null,
            order: 3,
            required: false,
          },
        ],
      },
      
      // 5. 賦術 (ALCHEMIST) - 共通フィールドのみ
      {
        categoryCode: 'ALCHEMIST',
        fields: [],
      },
      
      // 6. 鎮域 (GEOMANCER) - 共通フィールドのみ
      {
        categoryCode: 'GEOMANCER',
        fields: [],
      },
      
      // 7. 鼓吠 (WARLEADER_KOUHAI)
      {
        categoryCode: 'WARLEADER_KOUHAI',
        fields: [
          {
            fieldKey: 'lineage',
            fieldLabel: '系統',
            fieldType: 'select',
            placeholder: null,
            options: { values: ['鼓舞系', '攻撃系', '回避系', '防御系', '抵抗系'] },
            order: 1,
            required: false,
          },
          {
            fieldKey: 'rank',
            fieldLabel: 'ランク',
            fieldType: 'text',
            placeholder: '例: A',
            options: null,
            order: 2,
            required: false,
          },
          {
            fieldKey: 'jingiCost',
            fieldLabel: '陣気コスト',
            fieldType: 'text',
            placeholder: '例: 3',
            options: null,
            order: 3,
            required: false,
          },
          {
            fieldKey: 'jingiAccumulation',
            fieldLabel: '陣気蓄積',
            fieldType: 'text',
            placeholder: '例: +1',
            options: null,
            order: 4,
            required: false,
          },
        ],
      },
      
      // 8. 陣律 (WARLEADER_JINRITSU)
      {
        categoryCode: 'WARLEADER_JINRITSU',
        fields: [
          {
            fieldKey: 'prerequisite',
            fieldLabel: '前提',
            fieldType: 'text',
            placeholder: '例: 鼓吠ランクB以上',
            options: null,
            order: 1,
            required: false,
          },
          {
            fieldKey: 'useCondition',
            fieldLabel: '使用条件',
            fieldType: 'text',
            placeholder: null,
            options: null,
            order: 2,
            required: false,
          },
          {
            fieldKey: 'jingiCost',
            fieldLabel: '陣気コスト',
            fieldType: 'text',
            placeholder: '例: 5',
            options: null,
            order: 3,
            required: false,
          },
        ],
      },
      
      // 9. 操気 (DARKHUNTER) - 共通フィールドのみ（prerequisiteはカスタム）
      {
        categoryCode: 'DARKHUNTER',
        fields: [
          {
            fieldKey: 'prerequisite',
            fieldLabel: '前提',
            fieldType: 'text',
            placeholder: '例: 操気Lv5',
            options: null,
            order: 1,
            required: false,
          },
        ],
      },
    ]

    const results = []
    
    for (const categoryDef of fieldDefinitions) {
      // カテゴリーを取得
      const category = await prisma.skillCategoryConfig.findUnique({
        where: { code: categoryDef.categoryCode },
      })
      
      if (!category) {
        console.warn(`Category ${categoryDef.categoryCode} not found, skipping...`)
        continue
      }
      
      // フィールドを作成
      for (const field of categoryDef.fields) {
        // 既存チェック
        const existing = await prisma.skillFieldConfig.findUnique({
          where: {
            categoryId_fieldKey: {
              categoryId: category.id,
              fieldKey: field.fieldKey,
            },
          },
        })
        
        if (existing) {
          // 既存の場合は更新
          const updated = await prisma.skillFieldConfig.update({
            where: { id: existing.id },
            data: {
              fieldLabel: field.fieldLabel,
              fieldType: field.fieldType,
              placeholder: field.placeholder,
              options: field.options || undefined,
              order: field.order,
              required: field.required,
            },
          })
          results.push({
            action: 'updated',
            category: categoryDef.categoryCode,
            field: updated,
          })
        } else {
          // 新規作成
          const created = await prisma.skillFieldConfig.create({
            data: {
              categoryId: category.id,
              fieldKey: field.fieldKey,
              fieldLabel: field.fieldLabel,
              fieldType: field.fieldType,
              placeholder: field.placeholder,
              options: field.options || undefined,
              order: field.order,
              required: field.required,
            },
          })
          results.push({
            action: 'created',
            category: categoryDef.categoryCode,
            field: created,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.length}件のフィールドを処理しました`,
      results,
    })
  } catch (error) {
    console.error('Failed to seed fields:', error)
    return NextResponse.json(
      { 
        error: 'フィールドの作成に失敗しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
