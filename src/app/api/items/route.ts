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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (itemType === 'weapon') {
      const where: Prisma.WeaponWhereInput = {}

      if (category) {
        where.category = { contains: category }
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

      const [items, total] = await Promise.all([
        prisma.weapon.findMany({
          where,
          orderBy: [
            { rank: 'asc' },
            { name: 'asc' },
          ],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.weapon.count({ where }),
      ])

      return NextResponse.json({
        items: items.map(item => ({ ...item, itemType: 'weapon' })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    } else if (itemType === 'armor') {
      const where: Prisma.ArmorWhereInput = {}

      if (category) {
        where.category = { contains: category }
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

      const [items, total] = await Promise.all([
        prisma.armor.findMany({
          where,
          orderBy: [
            { rank: 'asc' },
            { name: 'asc' },
          ],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.armor.count({ where }),
      ])

      return NextResponse.json({
        items: items.map(item => ({ ...item, itemType: 'armor' })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    } else {
      const where: Prisma.AccessoryWhereInput = {}

      if (regulations && regulations.length > 0) {
        where.regulation = { in: regulations as any }
      }

      if (name) {
        where.name = { contains: name }
      }

      const [items, total] = await Promise.all([
        prisma.accessory.findMany({
          where,
          orderBy: [
            { name: 'asc' },
          ],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.accessory.count({ where }),
      ])

      return NextResponse.json({
        items: items.map(item => ({ ...item, itemType: 'accessory' })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    }
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: '検索処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
