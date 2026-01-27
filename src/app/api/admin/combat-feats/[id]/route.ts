import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT: 特技更新
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const id = parseInt(params.id)
    const data = await request.json()

    const feat = await prisma.combatFeat.update({
      where: { id },
      data: {
        type: data.type,
        name: data.name,
        requirement: data.requirement || null,
        target: data.target || null,
        risk: data.risk || null,
        summary: data.summary,
        page: data.page,
        regulation: data.regulation,
      },
    })

    return NextResponse.json(feat)
  } catch (error) {
    console.error('Failed to update combat feat:', error)
    return NextResponse.json(
      { error: 'データの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE: 特技削除
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const id = parseInt(params.id)

    await prisma.combatFeat.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete combat feat:', error)
    return NextResponse.json(
      { error: 'データの削除に失敗しました' },
      { status: 500 }
    )
  }
}
