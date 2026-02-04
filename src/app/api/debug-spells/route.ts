import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const action = request.nextUrl.searchParams.get('action')

    if (action === 'fairy-data') {
      // 妖精魔法のすべてのデータを取得
      const spells = await prisma.spell.findMany({
        where: { type: 'YOSEI' },
        orderBy: [{ level: 'asc' }, { name: 'asc' }],
        take: 200,
      })

      // データを分類
      const basicMagic = spells.filter(s => s.attribute?.includes('基本') || (s.attribute === null && s.fairyAttributes.length === 0))
      const attributeMagic = spells.filter(s => s.fairyAttributes.length > 0)
      const specialMagic = spells.filter(s => s.attribute?.includes('特殊'))

      // 詳細を表示
      const result = spells.map(spell => ({
        id: spell.id,
        name: spell.name,
        level: spell.level,
        attribute: spell.attribute,
        fairyAttributes: spell.fairyAttributes,
      }))

      return NextResponse.json({
        total: spells.length,
        basic: basicMagic.length,
        attribute: attributeMagic.length,
        special: specialMagic.length,
        spells: result,
      })
    }

    // デフォルト：妖精魔法の統計
    const fairySpells = await prisma.spell.findMany({
      where: { type: 'YOSEI' },
    })

    const attributeValues = new Set<string | null>()
    fairySpells.forEach(spell => {
      attributeValues.add(spell.attribute)
    })

    return NextResponse.json({
      totalFairySpells: fairySpells.length,
      uniqueAttributes: Array.from(attributeValues),
      fairyAttributeExamples: fairySpells.slice(0, 10).map(s => ({
        name: s.name,
        attribute: s.attribute,
        fairyAttributes: s.fairyAttributes,
      })),
    })
  } catch (error) {
    console.error('[API /debug-spells] Error:', error)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
