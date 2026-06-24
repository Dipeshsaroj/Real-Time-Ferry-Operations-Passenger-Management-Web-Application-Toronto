import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        startAt: 'asc',
      },
    });
    return NextResponse.json({ events });
  } catch (err) {
    console.error('Fetch events error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
