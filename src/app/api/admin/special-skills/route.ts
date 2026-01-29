import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: その他技能一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const regulation = searchParams.get('regulation')

    const where: any = {}
    
    // 検索条件
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { summary: { contains: search } },
      ]
    }
    
    // カテゴリーフィルター
    if (category && category !== 'ALL') {
      where.categoryCode = category
    }
    
    // レギュレーションフィルター
    if (regulation && regulation !== 'ALL') {
      where.regulation = regulation
    }

    const skills = await prisma.specialSkill.findMany({
      where,
      include: {
        category: {
          include: {
            customFields: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: [
        { categoryCode: 'asc' },
        { level: 'asc' },
        { name: 'asc' },
      ],
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
    
    console.log('Received data:', data)

    const skill = await prisma.specialSkill.create({
      data: {
        categoryCode: data.category,
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
        regulation: data.regulation || 'TYPE_I', // 空文字列の場合はデフォルト値を設定
        // カスタムフィールド（JSON形式）
        customFields: data.customFields || null,
      },
    })

    return NextResponse.json(skill)
  } catch (error) {
    console.error('Failed to create special skill:', error)
    console.error('Error details:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { 
        error: 'データの作成に失敗しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
