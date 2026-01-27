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
    
    const armor = await prisma.armor.update({
      where: { id: params.id },
      data: {
        name: data.name,
        category: data.category,
        rank: data.rank,
        usage: data.usage,
        minStrength: parseInt(data.minStrength),
        evasion: parseInt(data.evasion),
        defense: parseInt(data.defense),
        price: parseInt(data.price),
        summary: data.summary,
        page: data.page,
        regulation: data.regulation,
      },
    })

    return NextResponse.json({ armor })
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
    
    await prisma.armor.delete({
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
