import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const spellTypes: Array<{ type: string; level?: number; biblioRankMin?: number; biblioRankMax?: number }> = []
    
    // パラメータ解析
    let i = 0
    while (searchParams.has(`spellTypes[${i}][type]`)) {
      const type = searchParams.get(`spellTypes[${i}][type]`)
      const levelStr = searchParams.get(`spellTypes[${i}][level]`)
      const bMin = searchParams.get(`spellTypes[${i}][biblioRankMin]`)
      const bMax = searchParams.get(`spellTypes[${i}][biblioRankMax]`)
      
      if (type) {
        spellTypes.push({
          type,
          level: levelStr ? parseInt(levelStr) : undefined,
          biblioRankMin: bMin ? parseInt(bMin) : undefined,
          biblioRankMax: bMax ? parseInt(bMax) : undefined
        })
      }
      i++
    }
    
    const fairyAttributes = searchParams.getAll('fairyAttributes[]')
    const basicFairyMaxLevel = searchParams.get('basicFairyMaxLevel')
    const includeSpecialFairy = searchParams.get('includeSpecialFairy') === 'true'
    const maxSpecialRank = searchParams.get('maxSpecialRank')
    const deity = searchParams.get('deity')
    const regulations = searchParams.getAll('regulations[]')
    const nameParam = searchParams.get('name')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Prisma.SpellWhereInput = {}

    if (spellTypes.length > 0) {
      const typeConditions: Prisma.SpellWhereInput[] = []
      
      spellTypes.forEach((st, idx) => {
        const condition: Prisma.SpellWhereInput = { type: st.type as any }

        // 秘奥魔法の処理
        if (st.type === 'HIOU') {
          const bMin = searchParams.get(`spellTypes[${idx}][biblioRankMin]`)
          const bMax = searchParams.get(`spellTypes[${idx}][biblioRankMax]`)
          
          if (bMin && bMax) {
            condition.biblioRank = { gte: parseInt(bMin), lte: parseInt(bMax) }
          } else if (st.level !== undefined) {
            const maxRank = Math.min(5, Math.ceil(st.level / 3))
            condition.biblioRank = { gte: 1, lte: maxRank }
          }
        } 
        // 妖精魔法の特殊処理
        else if (st.type === 'YOSEI') {
          const fairyConditions: Prisma.SpellWhereInput[] = []
          // フロントエンドから送られてきた「技能レベル（生レベル）」を優先
          const rawSkillLevel = basicFairyMaxLevel ? parseInt(basicFairyMaxLevel) : st.level;

          // 1. 基本妖精魔法: 契約属性に関わらず常に表示
          if (rawSkillLevel !== undefined) {
            fairyConditions.push({
              level: { lte: rawSkillLevel },
              OR: [
                { attribute: { contains: '基本', mode: 'insensitive' } },
                // 属性が空、かつ fairyAttributes も空の場合を基本魔法として扱う
                { AND: [
                  { attribute: null },
                  { fairyAttributes: { isEmpty: true } }
                ]}
              ]
            })
          }

          // 2. 属性魔法: 契約している属性のいずれかを持つ魔法
          if (fairyAttributes.length > 0 && st.level !== undefined) {
            fairyConditions.push({
              level: { lte: st.level },
              fairyAttributes: { hasSome: fairyAttributes }
            })
          }
          
          // 3. 特殊妖精魔法: 6属性契約時のみ表示
          if (includeSpecialFairy && maxSpecialRank) {
            fairyConditions.push({
              level: { lte: parseInt(maxSpecialRank) },
              attribute: { contains: '特殊', mode: 'insensitive' }
            })
          }

          if (fairyConditions.length > 0) {
            condition.OR = fairyConditions
          } else if (st.level !== undefined) {
            condition.level = { lte: st.level }
          }
        } 
        // その他の魔法のレベル制限
        else if (st.level !== undefined) {
          condition.level = { lte: st.level }
        }

        // 神聖魔法の処理
        if (st.type === 'SHINSEI' && deity) {
          condition.AND = [
            { OR: [{ deity: deity }, { deity: null }, { deity: '' }] }
          ]
        }
        
        typeConditions.push(condition)
      })
      
      where.OR = typeConditions
    }

    if (regulations.length > 0) {
      where.regulation = { in: regulations as any }
    }

    if (nameParam) {
      where.name = { contains: nameParam, mode: 'insensitive' }
    }

    const [spells, total] = await Promise.all([
      prisma.spell.findMany({
        where,
        orderBy: [{ type: 'asc' }, { level: 'asc' }, { name: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.spell.count({ where }),
    ])

    return NextResponse.json({
      spells,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('[API /spells] Error:', error)
    return NextResponse.json({ error: '検索処理中にエラーが発生しました' }, { status: 500 })
  }
}