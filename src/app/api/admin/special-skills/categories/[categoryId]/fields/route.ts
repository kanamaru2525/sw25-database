import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: フィールド追加
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  try {
    const params = await context.params
    const categoryId = params.categoryId
    const data = await request.json()

    const field = await prisma.skillFieldConfig.create({
      data: {
        categoryId,
        fieldKey: data.fieldKey,
        fieldLabel: data.fieldLabel,
        fieldType: typeof data.fieldType === 'string' ? data.fieldType.toLowerCase() : data.fieldType,
        placeholder: data.placeholder || null,
        options: data.options || null,
        order: data.order,
        required: data.required || false,
      },
    })

    return NextResponse.json(field)
  } catch (error) {
    console.error('Failed to create field:', error)
    return NextResponse.json(
      { error: 'フィールドの作成に失敗しました' },
      { status: 500 }
    )
  }
}
