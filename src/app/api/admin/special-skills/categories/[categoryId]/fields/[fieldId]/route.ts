import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT: フィールド更新
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string; fieldId: string }> }
) {
  try {
    const params = await context.params
    const fieldId = params.fieldId
    const data = await request.json()

    const field = await prisma.skillFieldConfig.update({
      where: { id: fieldId },
      data: {
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
    console.error('Failed to update field:', error)
    return NextResponse.json(
      { error: 'フィールドの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE: フィールド削除
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string; fieldId: string }> }
) {
  try {
    const params = await context.params
    const fieldId = params.fieldId

    await prisma.skillFieldConfig.delete({
      where: { id: fieldId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete field:', error)
    return NextResponse.json(
      { error: 'フィールドの削除に失敗しました' },
      { status: 500 }
    )
  }
}
