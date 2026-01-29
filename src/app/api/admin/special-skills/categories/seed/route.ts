import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SkillCategory } from '@prisma/client'

// POST: カテゴリーを一括作成（初期化用）
export async function POST() {
  try {
    const categories = [
      { code: SkillCategory.ENHANCER, name: '練技', order: 1 },
      { code: SkillCategory.BARD_SONG, name: '呪歌', order: 2 },
      { code: SkillCategory.BARD_FINALE, name: '終律', order: 3 },
      { code: SkillCategory.RIDER, name: '騎芸', order: 4 },
      { code: SkillCategory.ALCHEMIST, name: '賦術', order: 5 },
      { code: SkillCategory.GEOMANCER, name: '鎮域', order: 6 },
      { code: SkillCategory.WARLEADER_KOUHAI, name: '鼓吠', order: 7 },
      { code: SkillCategory.WARLEADER_JINRITSU, name: '陣律', order: 8 },
      { code: SkillCategory.DARKHUNTER, name: '相域', order: 9 },
    ]

    const results = []
    
    for (const category of categories) {
      const existing = await prisma.skillCategoryConfig.findUnique({
        where: { code: category.code },
      })

      if (existing) {
        // 既存の場合は更新
        const updated = await prisma.skillCategoryConfig.update({
          where: { code: category.code },
          data: {
            name: category.name,
            order: category.order,
          },
        })
        results.push({ action: 'updated', category: updated })
      } else {
        // 新規作成
        const created = await prisma.skillCategoryConfig.create({
          data: category,
        })
        results.push({ action: 'created', category: created })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.length}件のカテゴリーを処理しました`,
      results,
    })
  } catch (error) {
    console.error('Failed to seed categories:', error)
    return NextResponse.json(
      { 
        error: 'カテゴリーの作成に失敗しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
