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
    const itemType = searchParams.get('itemType') || 'weapon'
    const category = searchParams.get('category')
    const rank = searchParams.get('rank')
    const regulations = searchParams.getAll('regulations[]')
    const name = searchParams.get('name')
    const price = searchParams.get('price')
    const priceAbove = searchParams.get('priceAbove') === 'true'
    const priceBelow = searchParams.get('priceBelow') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause for unified Item table
    const where: Prisma.ItemWhereInput = {
      itemType: itemType.toUpperCase() as any, // WEAPON, ARMOR, or ACCESSORY
    }

    if (category) {
      // For accessories, search in usage field; for weapons/armors, search in category field
      if (itemType === 'accessory') {
        where.usage = { contains: category }
      } else {
        where.category = { contains: category }
      }
    }

    if (rank && rank !== 'ALL') {
      where.rank = rank as any
    }

    if (regulations && regulations.length > 0) {
      where.regulation = { in: regulations as any }
    }

    if (name) {
      where.name = { contains: name }
    }

    if (price) {
      const priceValue = parseInt(price)
      if (priceAbove) {
        where.price = { gte: priceValue }
      } else if (priceBelow) {
        where.price = { lte: priceValue }
      } else {
        where.price = priceValue
      }
    }

    // Query unified Item table
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        orderBy: [
          { rank: 'asc' },
          { name: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.item.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      items: items.map(item => ({ ...item, itemType: itemType })),
      pagination: {
        total,
        page,
        limit,
        totalPages,
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
