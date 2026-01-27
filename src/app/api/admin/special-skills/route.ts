import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: その他技能一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { summary: { contains: search } },
          ],
        }
      : {}

    const skills = await prisma.specialSkill.findMany({
      where,
      orderBy: { id: 'asc' },
    })

    return NextResponse.json({
      skills,
      total: skills.length,
    })
  } catch (error) {
    console.error('Failed to fetch special skills:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: その他技能作成
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const skill = await prisma.specialSkill.create({
      data: {
        category: data.category,
        level: data.level ? parseInt(data.level) : null,
        name: data.name,
        duration: data.duration || null,
        resistance: data.resistance || null,
        cost: data.cost || null,
        attribute: data.attribute || null,
        target: data.target || null,
        rangeShape: data.rangeShape || null,
        summary: data.summary,
        page: data.page,
        regulation: data.regulation,
      },
    })

    return NextResponse.json(skill)
  } catch (error) {
    console.error('Failed to create special skill:', error)
    return NextResponse.json(
      { error: 'データの作成に失敗しました' },
      { status: 500 }
    )
  }
}
