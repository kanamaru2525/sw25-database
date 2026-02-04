import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have header and at least one data row' }, { status: 400 });
    }

    // Parse header
    const headers = lines[0].split(',').map((h) => h.trim());
    const codeIndex = headers.indexOf('code');
    const nameIndex = headers.indexOf('name');
    const orderIndex = headers.indexOf('order');
    const descriptionIndex = headers.indexOf('description');

    if (codeIndex === -1 || nameIndex === -1) {
      return NextResponse.json({ error: 'CSV must have "code" and "name" columns' }, { status: 400 });
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());

      const code = values[codeIndex];
      const name = values[nameIndex];
      const order = orderIndex !== -1 && values[orderIndex] ? parseInt(values[orderIndex], 10) : i;
      const description = descriptionIndex !== -1 ? values[descriptionIndex] : null;

      if (!code || !name) {
        errorCount++;
        results.push({
          row: i + 1,
          status: 'error',
          message: 'Missing required fields: code and name',
        });
        continue;
      }

      try {
        // Upsert regulation
        await prisma.regulationConfig.upsert({
          where: { code },
          update: {
            name,
            order,
            description: description || null,
          },
          create: {
            code,
            name,
            order,
            description: description || null,
          },
        });

        successCount++;
        results.push({
          row: i + 1,
          status: 'success',
          code,
          name,
        });
      } catch (err) {
        errorCount++;
        results.push({
          row: i + 1,
          status: 'error',
          code,
          message: (err instanceof Error ? err.message : 'Unknown error'),
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        summary: {
          total: lines.length - 1,
          successCount,
          errorCount,
        },
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
