import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'

// 魔法タイプのマッピング
const SPELL_TYPE_MAP: { [key: string]: string } = {
  '真語魔法': 'SHINGO',
  '操霊魔法': 'SOREI',
  '深智魔法': 'SHINCHI',
  '神聖魔法': 'SHINSEI',
  '魔動機術': 'MADOKI',
  '妖精魔法': 'YOSEI',
  '森羅魔法': 'SHINRA',
  '召異魔法': 'SHOI',
  '奈落魔法': 'NARAKU',
  '秘奥魔法': 'HIOU',
}

// レギュレーションのマッピング
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

    // Parse CSV
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

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      
      try {
        // Validate required fields
        if (!row.name || !row.type || !row.level) {
          errors.push(`行 ${i + 2}: 必須フィールドが不足しています`)
          continue
        }

        // Parse fairyAttributes (comma-separated string to array)
        const fairyAttributes = row.fairyAttributes
          ? row.fairyAttributes.split(',').map((s: string) => s.trim()).filter(Boolean)
          : []

        // Map type and regulation
        const spellType = SPELL_TYPE_MAP[row.type] || row.type
        const regulation = REGULATION_MAP[row.regulation] || row.regulation

        // Map magisphere (大/中/小 -> LARGE/MEDIUM/SMALL)
        const MAGISPHERE_MAP: Record<string, 'LARGE' | 'MEDIUM' | 'SMALL'> = {
          '大': 'LARGE',
          '中': 'MEDIUM',
          '小': 'SMALL',
        }
        const magisphere = row.magisphere && MAGISPHERE_MAP[row.magisphere]
          ? MAGISPHERE_MAP[row.magisphere]
          : null

        await prisma.spell.create({
          data: {
            name: row.name,
            type: spellType,
            level: parseInt(row.level),
            target: row.target || '',
            range: row.range || '',
            shape: row.shape || '',
            duration: row.duration || '',
            resistance: row.resistance || '',
            cost: row.cost || '',
            attribute: row.attribute || null,
            fairyAttributes,
            biblioRank: row.biblioRank ? parseInt(row.biblioRank) : null,
            summary: row.summary || '',
            magisphere: magisphere,
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
