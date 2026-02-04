import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'

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
        if (!row.name || (!row.category && !row.categoryCode) || !row.level) {
          errors.push(`行 ${i + 2}: 必須フィールドが不足しています`)
          continue
        }

        const category = row.categoryCode || row.category
        const regulation = row.regulation || ''

        let customFields: Record<string, any> | null = null
        const customFieldsRaw = row.customFields || row.custom_fields
        if (customFieldsRaw) {
          try {
            customFields = typeof customFieldsRaw === 'string'
              ? JSON.parse(customFieldsRaw)
              : customFieldsRaw
          } catch (parseError) {
            errors.push(`行 ${i + 2}: customFieldsのJSONが不正です`)
            continue
          }
        }

        await prisma.specialSkill.create({
          data: {
            categoryCode: category,
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
            customFields: customFields,
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
