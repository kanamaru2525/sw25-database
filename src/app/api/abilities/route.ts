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
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const regulation = searchParams.get('regulation')
    const name = searchParams.get('name')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Prisma.SpecialSkillWhereInput = {}

    if (category && category !== 'ALL') {
      where.categoryCode = category as any
    }

    if (level) {
      where.level = parseInt(level)
    }

    if (regulation && regulation !== 'ALL') {
      where.regulation = regulation as any
    }

    if (name) {
      where.name = {
        contains: name,
      }
    }

    const [skills, total] = await Promise.all([
      prisma.specialSkill.findMany({
        where,
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [
          { categoryCode: 'asc' },
          { level: 'asc' },
          { name: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.specialSkill.count({ where }),
    ])

    return NextResponse.json({
      skills,
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
