import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET: ユーザーのプリセット一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const presets = await prisma.regulationPreset.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ presets })
  } catch (error) {
    console.error('Failed to fetch presets:', error)
    return NextResponse.json(
      { error: 'プリセットの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: プリセット作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const data = await request.json()

    const preset = await prisma.regulationPreset.create({
      data: {
        userId: session.user.id,
        name: data.name,
        regulations: data.regulations,
      },
    })

    return NextResponse.json(preset)
  } catch (error) {
    console.error('Failed to create preset:', error)
    return NextResponse.json(
      { error: 'プリセットの作成に失敗しました' },
      { status: 500 }
    )
  }
}
