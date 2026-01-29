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
    
    const regulation = await prisma.regulationConfig.update({
      where: { id: params.id },
      data: {
        code: data.code,
        name: data.name,
        order: data.order || 0,
        description: data.description || null,
      },
    })

    return NextResponse.json({ regulation })
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
    
    await prisma.regulationConfig.delete({
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
