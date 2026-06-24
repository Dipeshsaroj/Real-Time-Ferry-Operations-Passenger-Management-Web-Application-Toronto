import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const parks = await prisma.park.findMany({
      include: {
        programs: true,
      },
    });
    return NextResponse.json({ parks });
  } catch (err) {
    console.error('Fetch parks error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
