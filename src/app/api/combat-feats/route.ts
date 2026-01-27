import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const regulations = searchParams.getAll('regulations[]')
    const name = searchParams.get('name')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Prisma.CombatFeatWhereInput = {}

    if (type && type !== 'ALL') {
      where.type = type as any
    }

    if (regulations && regulations.length > 0) {
      where.regulation = { in: regulations as any }
    }

    if (name) {
      where.OR = [
        { name: { contains: name } },
        { summary: { contains: name } },
      ]
    }

    const [feats, total] = await Promise.all([
      prisma.combatFeat.findMany({
        where,
        orderBy: [
          { type: 'asc' },
          { name: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.combatFeat.count({ where }),
    ])

    return NextResponse.json({
      feats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: '検索処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
