import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT: カテゴリーを更新
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  try {
    const params = await context.params
    const categoryId = params.categoryId
    const data = await request.json()

    const category = await prisma.skillCategoryConfig.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        order: data.order,
      },
      include: {
        customFields: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Failed to update category:', error)
    return NextResponse.json(
      { 
        error: 'カテゴリーの更新に失敗しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// DELETE: カテゴリーを削除
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  try {
    const params = await context.params
    const categoryId = params.categoryId

    // カテゴリーに紐づくデータがあるかチェック
    const skillCount = await prisma.specialSkill.count({
      where: { categoryCode: categoryId as any },
    })

    if (skillCount > 0) {
      return NextResponse.json(
        { 
          error: 'このカテゴリーには技能データが紐づいています。先にデータを削除してください。',
          count: skillCount
        },
        { status: 400 }
      )
    }

    // カスタムフィールドも一緒に削除される（onDelete: Cascade）
    await prisma.skillCategoryConfig.delete({
      where: { id: categoryId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return NextResponse.json(
      { 
        error: 'カテゴリーの削除に失敗しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
