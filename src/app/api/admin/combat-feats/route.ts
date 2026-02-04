import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: 特技一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const includeVagrancy = searchParams.get('includeVagrancy') === 'true'

    const where: any = search
      ? {
          OR: [
            { name: { contains: search } },
            { summary: { contains: search } },
          ],
        }
      : {}

    // ヴァグランツを含めない場合はフィルタリング
    if (!includeVagrancy) {
      where.vagrancy = false
    }

    const feats = await prisma.combatFeat.findMany({
      where,
      orderBy: { id: 'asc' },
    })

    return NextResponse.json({
      feats,
      total: feats.length,
    })
  } catch (error) {
    console.error('Failed to fetch combat feats:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 特技作成
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const feat = await prisma.combatFeat.create({
      data: {
        type: data.type,
        name: data.name,
        requirement: data.requirement || null,
        target: data.target || null,
        risk: data.risk || null,
        summary: data.summary,
        page: data.page,
        regulation: data.regulation || '',
        vagrancy: data.vagrancy || false,
      },
    })

    return NextResponse.json(feat)
  } catch (error) {
    console.error('Failed to create combat feat:', error)
    return NextResponse.json(
      { error: 'データの作成に失敗しました' },
      { status: 500 }
    )
  }
}
