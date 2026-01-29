import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  try {
    const params = await context.params
    const data = await request.json()
    
    const spell = await prisma.spell.update({
      where: { id: params.id },
      data: {
        name: data.name,
        type: data.type,
        level: parseInt(data.level),
        target: data.target,
        range: data.range,
        shape: data.shape,
        duration: data.duration,
        resistance: data.resistance,
        cost: data.cost,
        attribute: data.attribute || null,
        fairyAttributes: data.fairyAttributes || [],
        deity: data.deity || null,
        biblioRank: data.biblioRank ? parseInt(data.biblioRank) : null,
        summary: data.summary,
        magisphere: data.magisphere || null,
        page: data.page,
        regulation: data.regulation,
      },
    })

    return NextResponse.json({ spell })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'データ更新中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  try {
    const params = await context.params
    
    await prisma.spell.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'データ削除中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
