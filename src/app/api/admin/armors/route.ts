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
    const category = searchParams.get('category') || ''
    const rank = searchParams.get('rank') || ''
    const regulation = searchParams.get('regulation') || ''

    const where: any = {}
    
    if (search) {
      where.name = { contains: search }
    }
    
    if (category) {
      where.category = category
    }
    
    if (rank) {
      where.rank = rank
    }
    
    if (regulation) {
      where.regulation = regulation
    }

    const [armors, total] = await Promise.all([
      prisma.armor.findMany({
        where,
        orderBy: [
          { category: 'asc' },
          { rank: 'asc' },
          { name: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.armor.count({ where }),
    ])

    return NextResponse.json({
      armors,
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
    
    const armor = await prisma.armor.create({
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
      { error: 'データ作成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
