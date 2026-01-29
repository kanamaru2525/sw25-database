import { prisma } from './src/lib/prisma.ts';

async function checkDatabase() {
  try {
    console.log('=== Checking database AccessoryUsage enum ===');
    
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
    
    console.log('\n=== Checking Accessory table ===');
    
    const usageDistribution = await prisma.$queryRaw`
      SELECT usage::text, COUNT(*) as count
      FROM "Accessory"
      GROUP BY usage
      ORDER BY usage
    `;
    
    console.log('Usage distribution:', usageDistribution);
    
    console.log('\n=== Trying to fetch one accessory ===');
    const firstAccessory = await prisma.accessory.findFirst();
    console.log('First accessory:', firstAccessory);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
