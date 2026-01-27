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
    const regulation = searchParams.get('regulation') || ''

    const where: any = {}
    
    if (search) {
      where.name = { contains: search }
    }
    
    if (regulation) {
      where.regulation = regulation
    }

    const [accessories, total] = await Promise.all([
      prisma.accessory.findMany({
        where,
        orderBy: [
          { usage: 'asc' },
          { name: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.accessory.count({ where }),
    ])

    return NextResponse.json({
      accessories,
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
    
    const accessory = await prisma.accessory.create({
      data: {
        name: data.name,
        usage: data.usage,
        price: parseInt(data.price),
        summary: data.summary,
        page: data.page,
        regulation: data.regulation,
      },
    })

    return NextResponse.json({ accessory })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'データ作成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
