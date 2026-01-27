import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'

const SKILL_CATEGORY_MAP: { [key: string]: string } = {
  '練技': 'ENHANCER',
  '呪歌': 'BARD_SONG',
  '終律': 'BARD_FINALE',
  '騎芸': 'RIDER',
  '賦術': 'ALCHEMIST',
  '相域': 'GEOMANCER',
  '鼓吠': 'WARLEADER_KOUHAI',
  '陣率': 'WARLEADER_JINRITSU',
  '操気': 'DARKHUNTER',
}

const REGULATION_MAP: { [key: string]: string } = {
  'Ⅰ': 'TYPE_I',
  'Ⅱ': 'TYPE_II',
  'Ⅲ': 'TYPE_III',
  'DX': 'DX',
  'ET': 'ET',
  'ML': 'ML',
  'MA': 'MA',
  'BM': 'BM',
  'AL': 'AL',
  'RL': 'RL',
  'BR': 'BR',
  'BS': 'BS',
  'AB': 'AB',
  'BI': 'BI',
  'DD': 'DD',
  'US': 'US',
  'TS': 'TS',
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

    const rows = parsed.data as any[]
    let successCount = 0
    const errors: string[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      
      try {
        if (!row.name || !row.category || !row.level) {
          errors.push(`行 ${i + 2}: 必須フィールドが不足しています`)
          continue
        }

        const category = SKILL_CATEGORY_MAP[row.category] || row.category
        const regulation = REGULATION_MAP[row.regulation] || row.regulation

        await prisma.specialSkill.create({
          data: {
            category: category,
            level: parseInt(row.level),
            name: row.name,
            duration: row.duration || null,
            resistance: row.resistance || null,
            cost: row.cost || null,
            attribute: row.attribute || null,
            target: row.target || null,
            rangeShape: row.rangeShape || null,
            summary: row.summary || '',
            page: row.page || '',
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
