import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user.isAdmin) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      )
    }

    const data = await request.json()

    const item = await prisma.item.create({
      data: {
        itemType: data.itemType?.toUpperCase() || 'WEAPON',
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
        regulation: data.regulation || 'TYPE_I',
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Create item error:', error)
    return NextResponse.json(
      { error: 'アイテムの作成に失敗しました' },
      { status: 500 }
    )
  }
}
