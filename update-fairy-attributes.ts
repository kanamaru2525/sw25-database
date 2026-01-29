import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

async function updateFairyAttributes() {
  try {
    console.log('妖精魔法の属性データを更新中...')

    // 土の妖精魔法
    const earthCount = await prisma.spell.updateMany({
      where: {
        type: 'YOSEI',
        name: { contains: '土の妖精魔法' }
      },
      data: {
        fairyAttributes: ['土']
      }
    })
    console.log(`土の妖精魔法: ${earthCount.count}件更新`)

    // 水氷の妖精魔法
    const waterCount = await prisma.spell.updateMany({
      where: {
        type: 'YOSEI',
        name: { contains: '水氷の妖精魔法' }
      },
      data: {
        fairyAttributes: ['水氷']
      }
    })
    console.log(`水氷の妖精魔法: ${waterCount.count}件更新`)

    // 火の妖精魔法
    const fireCount = await prisma.spell.updateMany({
      where: {
        type: 'YOSEI',
        name: { contains: '火の妖精魔法' }
      },
      data: {
        fairyAttributes: ['火']
      }
    })
    console.log(`火の妖精魔法: ${fireCount.count}件更新`)

    // 風の妖精魔法
    const windCount = await prisma.spell.updateMany({
      where: {
        type: 'YOSEI',
        name: { contains: '風の妖精魔法' }
      },
      data: {
        fairyAttributes: ['風']
      }
    })
    console.log(`風の妖精魔法: ${windCount.count}件更新`)

    // 光の妖精魔法
    const lightCount = await prisma.spell.updateMany({
      where: {
        type: 'YOSEI',
        name: { contains: '光の妖精魔法' }
      },
      data: {
        fairyAttributes: ['光']
      }
    })
    console.log(`光の妖精魔法: ${lightCount.count}件更新`)

    // 闇の妖精魔法
    const darkCount = await prisma.spell.updateMany({
      where: {
        type: 'YOSEI',
        name: { contains: '闇の妖精魔法' }
      },
      data: {
        fairyAttributes: ['闇']
      }
    })
    console.log(`闇の妖精魔法: ${darkCount.count}件更新`)

    // 基本妖精魔法
    const basicCount = await prisma.spell.updateMany({
      where: {
        type: 'YOSEI',
        name: { contains: '基本妖精魔法' }
      },
      data: {
        fairyAttributes: []
      }
    })
    console.log(`基本妖精魔法: ${basicCount.count}件更新`)

    // 特殊妖精魔法
    const specialCount = await prisma.spell.updateMany({
      where: {
        type: 'YOSEI',
        name: { contains: '特殊妖精魔法' }
      },
      data: {
        fairyAttributes: []
      }
    })
    console.log(`特殊妖精魔法: ${specialCount.count}件更新`)

    console.log('更新完了！')
  } catch (error) {
    console.error('エラー:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateFairyAttributes()
