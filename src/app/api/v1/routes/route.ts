import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const routes = await prisma.route.findMany({
      include: {
        originTerminal: true,
        destinationTerminal: true,
      },
    });
    return NextResponse.json({ routes });
  } catch (err) {
    console.error('Fetch routes error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
