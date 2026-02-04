import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { Prisma, SpellType } from '@prisma/client'

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

    // デバッグログ：妖精魔法の検索パラメータ
    if (basicFairyMaxLevel) {
      console.log('[API /spells] 妖精魔法検索パラメータ')
      console.log('  basicFairyMaxLevel:', basicFairyMaxLevel)
      console.log('  fairyAttributes:', fairyAttributes)
      console.log('  includeSpecialFairy:', includeSpecialFairy)
      console.log('  maxSpecialRank:', maxSpecialRank)
    }

    const where: Prisma.SpellWhereInput = {}

    if (spellTypes.length > 0) {
      const typeConditions: Prisma.SpellWhereInput[] = []
      
      spellTypes.forEach((st, idx) => {
        const condition: Prisma.SpellWhereInput = { type: st.type as SpellType }

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
          const rawSkillLevel = basicFairyMaxLevel ? parseInt(basicFairyMaxLevel) : st.level

          // 1. 基本妖精魔法: 選択されているレベルと等しいものを常に表示
          // 条件: fairyAttributes に「基本」を含む
          if (rawSkillLevel !== undefined) {
            fairyConditions.push({
              level: { lte: rawSkillLevel },
              fairyAttributes: { has: '基本' }
            })
          }

          // 2. 属性魔法: 契約している属性のいずれかを持つ魔法
          if (fairyAttributes.length > 0 && st.level !== undefined) {
            fairyConditions.push({
              level: { lte: st.level },
              fairyAttributes: { hasSome: fairyAttributes }
            })
          }
          
          // 3. 特殊妖精魔法: 6属性契約時のみ、指定されているランクに従う
          if (includeSpecialFairy && maxSpecialRank) {
            fairyConditions.push({
              level: { lte: parseInt(maxSpecialRank) },
              fairyAttributes: { has: '特殊' }
            })
          }

          if (fairyConditions.length > 0) {
            // type と OR を AND で結合
            condition.AND = [
              { OR: fairyConditions }
            ]
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
          if (condition.AND) {
            (condition.AND as Prisma.SpellWhereInput[]).push({ OR: [{ deity: deity }, { deity: null }, { deity: '' }] })
          } else {
            condition.AND = [
              { OR: [{ deity: deity }, { deity: null }, { deity: '' }] }
            ]
          }
        }
        
        typeConditions.push(condition)
      })
      
      where.OR = typeConditions
    }

    if (regulations.length > 0) {
      where.regulation = { in: regulations }
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

    // デバッグログ：検索結果
    if (basicFairyMaxLevel) {
      const basicCount = spells.filter(s => s.fairyAttributes.includes('基本')).length
      const attributeCount = spells.filter(s => s.fairyAttributes.length > 0 && !s.fairyAttributes.includes('基本') && !s.fairyAttributes.includes('特殊')).length
      const specialCount = spells.filter(s => s.fairyAttributes.includes('特殊')).length
      console.log('[API /spells] 検索結果')
      console.log('  合計件数:', total)
      console.log('  取得件数:', spells.length)
      console.log('  基本魔法:', basicCount)
      console.log('  属性魔法:', attributeCount)
      console.log('  特殊魔法:', specialCount)
      
      // データベースのサンプル魔法を表示
      if (spells.length > 0) {
        console.log('  [サンプル魔法データ]')
        spells.slice(0, 3).forEach(s => {
          console.log(`    - ${s.name}: attribute="${s.attribute}", fairyAttributes=[${s.fairyAttributes.join(', ')}]`)
        })
      }
    }

    return NextResponse.json({
      spells,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('[API /spells] Error:', error)
    return NextResponse.json({ error: '検索処理中にエラーが発生しました' }, { status: 500 })
  }
}