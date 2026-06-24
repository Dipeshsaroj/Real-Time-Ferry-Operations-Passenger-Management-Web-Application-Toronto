import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import globalEmitter, { SSE_EVENTS } from '@/lib/event-emitter';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { status, capacityRemaining } = body;

    const oldSchedule = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!oldSchedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    const data: any = {};
    if (status) data.status = status;
    if (typeof capacityRemaining === 'number') data.capacityRemaining = capacityRemaining;

    const schedule = await prisma.schedule.update({
      where: { id },
      data,
      include: {
        route: {
          include: {
            originTerminal: true,
            destinationTerminal: true,
          },
        },
        ferry: true,
      },
    });

    // 1. Emit live update event
    globalEmitter.emit(SSE_EVENTS.SCHEDULE_UPDATE, schedule);

    // 2. Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_SCHEDULE',
        entityType: 'SCHEDULE',
        entityId: schedule.id,
        diffJson: JSON.stringify({
          before: oldSchedule,
          after: schedule,
        }),
      },
    });

    return NextResponse.json({ schedule });
  } catch (err) {
    console.error('Update schedule error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
