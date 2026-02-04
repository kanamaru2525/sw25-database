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

    if (!session.user.id) {
      return NextResponse.json(
        { error: 'ユーザー ID が見つかりません' },
        { status: 400 }
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
    
    console.log('[API] POST /regulation-presets - session:', {
      exists: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
    })
    
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // ユーザーが存在するか確認
    let user = null
    if (session.user.id) {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
      })
      console.log('[API] Found user by id:', user?.id)
    }

    // ユーザーが見つからない場合、メールアドレスで検索
    if (!user && session.user.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      })
      console.log('[API] Found user by email:', user?.id)
    }

    // それでも見つからない場合は作成
    if (!user) {
      console.log('[API] Creating new user with email:', session.user.email)
      user = await prisma.user.create({
        data: {
          email: session.user.email || `discord_${Date.now()}`,
          name: session.user.name || 'Anonymous',
          image: session.user.image,
          discordId: (session.user as any).discordId,
          isAdmin: (session.user as any).isAdmin || false,
        },
      })
      console.log('[API] New user created:', user.id)
    }

    if (!user?.id) {
      return NextResponse.json(
        { error: 'ユーザーの取得に失敗しました' },
        { status: 400 }
      )
    }

    const preset = await prisma.regulationPreset.create({
      data: {
        userId: user.id,
        name: data.name,
        regulations: data.regulations || [],
      },
    })

    return NextResponse.json(preset)
  } catch (error) {
    console.error('Failed to create preset:', error)
    const errorMessage = error instanceof Error ? error.message : 'プリセットの作成に失敗しました'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
