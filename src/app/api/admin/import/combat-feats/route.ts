import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { getRegulationMapping, normalizeRegulation } from '@/lib/regulation-mapping'
import Papa from 'papaparse'

const FEAT_TYPE_MAP: { [key: string]: string } = {
  '常時特技': 'PASSIVE',
  '主動作特技': 'MAJOR',
  '宣言特技': 'DECLARATION',
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
        if (!row.name || !row.type) {
          errors.push(`行 ${i + 2}: 必須フィールドが不足しています`)
          continue
        }

        const featType = FEAT_TYPE_MAP[String(row.type)] || String(row.type)
        const regulation = normalizeRegulation(String(row.regulation), regulationMapping)

        await prisma.combatFeat.create({
          data: {
            name: String(row.name),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: featType as any,
            requirement: row.requirement ? String(row.requirement) : null,
            target: row.target ? String(row.target) : null,
            risk: row.risk ? String(row.risk) : null,
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
