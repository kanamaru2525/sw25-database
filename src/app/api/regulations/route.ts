import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const regulations = await prisma.regulationConfig.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ regulations })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'データ取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
