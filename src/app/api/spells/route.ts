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
    
    // 複数の魔法タイプとレベルの組み合わせを取得
    const spellTypes: Array<{ type: string; level?: number }> = []
    let index = 0
    while (searchParams.has(`spellTypes[${index}][type]`)) {
      const type = searchParams.get(`spellTypes[${index}][type]`)
      const levelStr = searchParams.get(`spellTypes[${index}][level]`)
      if (type) {
        spellTypes.push({
          type,
          level: levelStr ? parseInt(levelStr) : undefined
        })
      }
      index++
    }
    
    // 後方互換性のため、古い形式もサポート
    const spellType = searchParams.get('spellType')
    const level = searchParams.get('level')
    if (spellType && spellType !== 'ALL' && spellTypes.length === 0) {
      spellTypes.push({
        type: spellType,
        level: level ? parseInt(level) : undefined
      })
    }
    
    const regulations = searchParams.getAll('regulations[]')
    const name = searchParams.get('name')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // 妖精魔法の属性フィルタリング
    const fairyAttributes = searchParams.getAll('fairyAttributes[]')
    const includeBasicFairy = searchParams.get('includeBasicFairy') === 'true'
    const maxFairyRank = searchParams.get('maxFairyRank')
    const includeSpecialFairy = searchParams.get('includeSpecialFairy') === 'true'
    const maxSpecialRank = searchParams.get('maxSpecialRank')
    
    // 神聖魔法の神フィルタリング
    const deity = searchParams.get('deity')

    const where: Prisma.SpellWhereInput = {}

    // 複数の魔法タイプ+レベルの条件を構築
    if (spellTypes.length > 0) {
      const typeConditions: Prisma.SpellWhereInput[] = []
      
      spellTypes.forEach(st => {
        const condition: Prisma.SpellWhereInput = {
          type: st.type as any
        }
        
        // レベルが指定されている場合（指定レベル以下）
        if (st.level !== undefined) {
          condition.level = { lte: st.level }
        }
        
        // 妖精魔法で属性が選択されている場合
        if (st.type === 'YOSEI' && fairyAttributes.length > 0) {
          const fairyConditions: Prisma.SpellWhereInput[] = []
          
          // 選択された各属性の妖精魔法
          fairyAttributes.forEach(attr => {
            fairyConditions.push({
              type: 'YOSEI',
              fairyAttributes: {
                has: attr
              }
            })
          })
          
          // 基本妖精魔法（4属性以上契約時）
          if (includeBasicFairy && maxFairyRank) {
            fairyConditions.push({
              type: 'YOSEI',
              fairyAttributes: {
                isEmpty: true
              },
              name: {
                contains: '基本妖精魔法'
              },
              level: {
                lte: parseInt(maxFairyRank)
              }
            })
          }
          
          // 特殊妖精魔法（全属性契約時のみ）
          if (includeSpecialFairy && maxSpecialRank) {
            fairyConditions.push({
              type: 'YOSEI',
              fairyAttributes: {
                isEmpty: true
              },
              name: {
                contains: '特殊妖精魔法'
              },
              level: {
                lte: parseInt(maxSpecialRank)
              }
            })
          }
          
          condition.OR = fairyConditions
        }
        
        // 神聖魔法で神が選択されている場合
        if (st.type === 'SHINSEI' && deity) {
          condition.OR = [
            { deity: deity },
            { deity: null }
          ]
        }
        
        typeConditions.push(condition)
      })
      
      if (typeConditions.length > 0) {
        where.OR = typeConditions
      }
    }

    if (regulations && regulations.length > 0) {
      where.regulation = { in: regulations as any }
    }

    if (name) {
      where.name = {
        contains: name,
      }
    }

    const [spells, total] = await Promise.all([
      prisma.spell.findMany({
        where,
        orderBy: [
          { type: 'asc' },
          { level: 'asc' },
          { name: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.spell.count({ where }),
    ])

    return NextResponse.json({
      spells,
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
