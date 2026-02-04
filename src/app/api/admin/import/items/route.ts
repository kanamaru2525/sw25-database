import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { getRegulationMapping, normalizeRegulation } from '@/lib/regulation-mapping'
import Papa from 'papaparse'

// アイテムタイプのマッピング
const ITEM_TYPE_MAP: { [key: string]: string } = {
  '武器': 'WEAPON',
  '防具': 'ARMOR',
  '装飾品': 'ACCESSORY',
}

// ランクのマッピング
const RANK_MAP: { [key: string]: string } = {
  'B': 'B',
  'A': 'A',
  'S': 'S',
  'SS': 'SS',
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  try {
    const { csv } = await request.json()

    if (!csv) {
      return NextResponse.json({ error: 'CSVデータが必要です' }, { status: 400 })
    }

    // レギュレーションマッピングを取得
    const regulationMapping = await getRegulationMapping()

    const parsed = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
    })

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV解析エラー', details: parsed.errors },
        { status: 400 }
      )
    }

    const rows = parsed.data as Array<Record<string, string | number>>
    let successCount = 0
    const errors: string[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      
      try {
        // 必須フィールドのバリデーション
        if (!row.name || !row.itemType) {
          errors.push(`行 ${i + 2}: 必須フィールドが不足しています`)
          continue
        }

        const itemType = ITEM_TYPE_MAP[String(row.itemType)] || String(row.itemType)
        const regulation = normalizeRegulation(String(row.regulation), regulationMapping)
        const rank = row.rank ? (RANK_MAP[String(row.rank)] || String(row.rank)) : null

        // 数値フィールドのパース（空文字列はnullに変換）
        const parseIntOrNull = (value: string | number | undefined) => {
          return value && value !== '' ? parseInt(String(value)) : null
        }

        await prisma.item.create({
          data: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            itemType: itemType as any,
            name: String(row.name),
            category: row.category ? String(row.category) : null,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rank: rank as any,
            usage: row.usage ? String(row.usage) : null,
            minStrength: parseIntOrNull(row.minStrength),
            // 武器専用フィールド
            hit: parseIntOrNull(row.hit),
            power: parseIntOrNull(row.power),
            critical: parseIntOrNull(row.critical),
            extraDamage: parseIntOrNull(row.extraDamage),
            range: parseIntOrNull(row.range),
            // 防具専用フィールド
            evasion: parseIntOrNull(row.evasion),
            defense: parseIntOrNull(row.defense),
            // 共通フィールド
            price: parseIntOrNull(row.price) || 0,
            summary: row.summary ? String(row.summary) : '',
            page: row.page ? String(row.page) : '',
            regulation: regulation,
          },
        })

        successCount++
      } catch (error) {
        errors.push(`行 ${i + 2}: ${error instanceof Error ? error.message : '不明なエラー'}`)
      }
    }

    return NextResponse.json({
      message: `${successCount}件のデータをインポートしました`,
      count: successCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'インポート処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
