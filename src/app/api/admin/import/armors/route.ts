import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'

const RANK_MAP: { [key: string]: string } = {
  'B': 'B',
  'A': 'A',
  'S': 'S',
  'SS': 'SS',
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
        if (!row.name || !row.category || !row.rank) {
          errors.push(`行 ${i + 2}: 必須フィールドが不足しています`)
          continue
        }

        const rank = RANK_MAP[row.rank] || row.rank
        const regulation = REGULATION_MAP[row.regulation] || row.regulation

        await prisma.armor.create({
          data: {
            name: row.name,
            category: row.category,
            rank: rank,
            usage: row.usage || '',
            minStrength: parseInt(row.minStrength) || 0,
            evasion: parseInt(row.evasion) || 0,
            defense: parseInt(row.defense) || 0,
            price: parseInt(row.price) || 0,
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
