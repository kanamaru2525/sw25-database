import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: 新しいカテゴリーを作成
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('Creating category:', data)

    const category = await prisma.skillCategoryConfig.create({
      data: {
        code: data.code,
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
    console.error('Failed to create category:', error)
    return NextResponse.json(
      { 
        error: 'カテゴリーの作成に失敗しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
