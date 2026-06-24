import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const programs = await prisma.program.findMany({
      include: {
        park: true,
      },
    });
    return NextResponse.json({ programs });
  } catch (err) {
    console.error('Fetch programs error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
