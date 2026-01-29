import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== Checking database AccessoryUsage enum ===');
    
    // データベースからenum値を取得
    const enumValues = await prisma.$queryRaw`
      SELECT enumlabel as value
      FROM pg_enum
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'AccessoryUsage'
      )
      ORDER BY enumsortorder
    `;
    
    console.log('Database enum values:', enumValues);
    
    console.log('\n=== Checking Accessory table usage values ===');
    
    // Accessoryテーブルのusage値の分布
    const usageDistribution = await prisma.$queryRaw`
      SELECT usage, COUNT(*) as count
      FROM "Accessory"
      GROUP BY usage
      ORDER BY usage
    `;
    
    console.log('Usage distribution:', usageDistribution);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
