import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT: その他技能更新
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const id = parseInt(params.id)
    const data = await request.json()

    const skill = await prisma.specialSkill.update({
      where: { id },
      data: {
        category: data.category,
        level: data.level ? parseInt(data.level) : null,
        name: data.name,
        duration: data.duration || null,
        resistance: data.resistance || null,
        cost: data.cost || null,
        attribute: data.attribute || null,
        target: data.target || null,
        rangeShape: data.rangeShape || null,
        summary: data.summary,
        page: data.page,
        regulation: data.regulation,
      },
    })

    return NextResponse.json(skill)
  } catch (error) {
    console.error('Failed to update special skill:', error)
    return NextResponse.json(
      { error: 'データの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE: その他技能削除
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const id = parseInt(params.id)

    await prisma.specialSkill.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete special skill:', error)
    return NextResponse.json(
      { error: 'データの削除に失敗しました' },
      { status: 500 }
    )
  }
}
