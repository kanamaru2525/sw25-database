import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: カテゴリー設定とそのカスタムフィールドを取得
export async function GET() {
  try {
    const categories = await prisma.skillCategoryConfig.findMany({
      include: {
        customFields: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Failed to fetch category configs:', error)
    return NextResponse.json(
      { error: 'カテゴリー設定の取得に失敗しました' },
      { status: 500 }
    )
  }
}
