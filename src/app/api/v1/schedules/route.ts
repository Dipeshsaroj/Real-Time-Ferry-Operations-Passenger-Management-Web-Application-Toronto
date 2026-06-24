import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const routeId = searchParams.get('routeId');
    const dateStr = searchParams.get('date');

    const where: any = {};

    if (routeId) {
      where.routeId = routeId;
    }

    if (dateStr) {
      const startOfDay = new Date(dateStr);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);

      where.departureTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        route: {
          include: {
            originTerminal: true,
            destinationTerminal: true,
          },
        },
        ferry: true,
      },
      orderBy: {
        departureTime: 'asc',
      },
    });

    return NextResponse.json({ schedules });
  } catch (err) {
    console.error('Fetch schedules error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
