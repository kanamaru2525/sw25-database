import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user.isAdmin) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      )
    }

    const { id } = await context.params
    const data = await request.json()

    const item = await prisma.item.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category || null,
        rank: data.rank || null,
        usage: data.usage || null,
        minStrength: data.minStrength || null,
        hit: data.hit || null,
        power: data.power || null,
        critical: data.critical || null,
        extraDamage: data.extraDamage || null,
        range: data.range || null,
        evasion: data.evasion || null,
        defense: data.defense || null,
        price: data.price,
        summary: data.summary,
        page: data.page,
        regulation: data.regulation || '',
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Update item error:', error)
    return NextResponse.json(
      { error: 'アイテムの更新に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user.isAdmin) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      )
    }

    const { id } = await context.params

    await prisma.item.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete item error:', error)
    return NextResponse.json(
      { error: 'アイテムの削除に失敗しました' },
      { status: 500 }
    )
  }
}
