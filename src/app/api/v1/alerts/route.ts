import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const alerts = await prisma.alert.findMany({
      where: {
        validFrom: { lte: now },
        validUntil: { gte: now },
      },
      include: {
        route: true,
      },
      orderBy: {
        validFrom: 'desc',
      },
    });
    return NextResponse.json({ alerts });
  } catch (err) {
    console.error('Fetch alerts error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
