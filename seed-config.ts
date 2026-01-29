import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

async function main() {
  console.log('神の初期データを登録しています...')
  
  const deities = [
    { name: 'ティダン', order: 1 },
    { name: 'ル=ロウド', order: 2 },
    { name: 'グレンダール', order: 3 },
    { name: 'カルディア', order: 4 },
    { name: 'イーヴ', order: 5 },
    { name: 'ダルクレム', order: 6 },
  ]

  for (const deity of deities) {
    await prisma.deity.upsert({
      where: { name: deity.name },
      update: {},
      create: deity,
    })
    console.log(`✓ ${deity.name}`)
  }

  console.log('\nレギュレーションの初期データを登録しています...')
  
  const regulations = [
    { code: 'Ⅰ', name: 'タイプⅠ', order: 1 },
    { code: 'Ⅱ', name: 'タイプⅡ', order: 2 },
    { code: 'Ⅲ', name: 'タイプⅢ', order: 3 },
    { code: 'DX', name: 'デラックス', order: 4 },
    { code: 'ET', name: 'エターナルタイム', order: 5 },
    { code: 'ML', name: 'マギテックライブラリー', order: 6 },
    { code: 'MA', name: 'マギテックアクセサリー', order: 7 },
    { code: 'BM', name: 'バトルマスター', order: 8 },
    { code: 'AL', name: 'アルケミスト', order: 9 },
    { code: 'RL', name: 'ルミエルレガシィ', order: 10 },
    { code: 'BR', name: 'バルバロステイルズ', order: 11 },
    { code: 'BS', name: 'ブレイブサウザンド', order: 12 },
    { code: 'AB', name: 'アビスブレイド', order: 13 },
    { code: 'BI', name: 'ブレイドイメージ', order: 14 },
    { code: 'DD', name: 'デモンズダンジョン', order: 15 },
    { code: 'US', name: 'アンセトルドストーリーズ', order: 16 },
    { code: 'TS', name: 'タビットサプリメント', order: 17 },
  ]

  for (const regulation of regulations) {
    await prisma.regulationConfig.upsert({
      where: { code: regulation.code },
      update: {},
      create: regulation,
    })
    console.log(`✓ ${regulation.code} - ${regulation.name}`)
  }

  console.log('\n初期データの登録が完了しました！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
