import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  try {
    const deities = await prisma.deity.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ deities })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'データ取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  try {
    const data = await request.json()
    
    const deity = await prisma.deity.create({
      data: {
        name: data.name,
        order: data.order || 0,
      },
    })

    return NextResponse.json({ deity })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'データ作成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
