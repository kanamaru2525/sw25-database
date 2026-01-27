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
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const where = search ? {
      name: { contains: search }
    } : {}

    const [spells, total] = await Promise.all([
      prisma.spell.findMany({
        where,
        orderBy: [
          { type: 'asc' },
          { level: 'asc' },
          { name: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.spell.count({ where }),
    ])

    return NextResponse.json({
      spells,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
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
    
    const spell = await prisma.spell.create({
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
      { error: 'データ作成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
