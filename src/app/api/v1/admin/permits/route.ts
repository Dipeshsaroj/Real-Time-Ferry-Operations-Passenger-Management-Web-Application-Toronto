import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const permits = await prisma.permitRequest.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: {
        dateRangeStart: 'desc',
      },
    });

    return NextResponse.json({ permits });
  } catch (err) {
    console.error('Fetch permits error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
