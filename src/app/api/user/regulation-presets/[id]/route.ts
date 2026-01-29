import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// マップ値をenum値に変換
const mapToEnumValue = (code: string): string => {
  const mapping: Record<string, string> = {
    'Ⅰ': 'TYPE_I',
    'Ⅱ': 'TYPE_II',
    'Ⅲ': 'TYPE_III',
  }
  return mapping[code] || code
}

// PUT: プリセット更新
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const params = await context.params
    const id = params.id
    const data = await request.json()

    // 自分のプリセットかチェック
    const existing = await prisma.regulationPreset.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    // マップ値をenum値に変換
    const enumRegulations = data.regulations.map(mapToEnumValue)

    const preset = await prisma.regulationPreset.update({
      where: { id },
      data: {
        name: data.name,
        regulations: enumRegulations as any,
      },
    })

    return NextResponse.json(preset)
  } catch (error) {
    console.error('Failed to update preset:', error)
    return NextResponse.json(
      { error: 'プリセットの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE: プリセット削除
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const params = await context.params
    const id = params.id

    // 自分のプリセットかチェック
    const existing = await prisma.regulationPreset.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    await prisma.regulationPreset.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete preset:', error)
    return NextResponse.json(
      { error: 'プリセットの削除に失敗しました' },
      { status: 500 }
    )
  }
}
