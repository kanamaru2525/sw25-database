import { prisma } from './src/lib/prisma.ts';

async function checkDatabase() {
  try {
    console.log('=== 1. Checking AccessoryUsage enum in database ===');
    const enumValues = await prisma.$queryRaw`
      SELECT e.enumlabel, e.enumsortorder
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'AccessoryUsage'
      ORDER BY e.enumsortorder
    `;
    console.log('Database enum values:', JSON.stringify(enumValues, null, 2));
    
    const hasNone = enumValues.some(v => v.enumlabel === 'NONE');
    console.log(`\n❌ NONE exists in database enum: ${hasNone}`);
    
    if (!hasNone) {
      console.log('\n🔧 Adding NONE to database enum...');
      await prisma.$executeRaw`ALTER TYPE "AccessoryUsage" ADD VALUE IF NOT EXISTS 'NONE'`;
      console.log('✅ NONE added to database enum');
      
      // Verify
      const newEnumValues = await prisma.$queryRaw`
        SELECT enumlabel FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AccessoryUsage')
        ORDER BY enumsortorder
      `;
      console.log('Updated enum values:', newEnumValues.map(v => v.enumlabel));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
