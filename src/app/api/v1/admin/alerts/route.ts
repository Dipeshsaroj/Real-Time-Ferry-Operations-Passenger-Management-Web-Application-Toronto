import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { alertSchema } from '@/lib/validations';
import globalEmitter, { SSE_EVENTS } from '@/lib/event-emitter';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const alerts = await prisma.alert.findMany({
      include: { route: true },
      orderBy: { validFrom: 'desc' }
    });

    return NextResponse.json({ alerts });
  } catch (err) {
    console.error('Fetch admin alerts error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const result = alertSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const { title, body: alertBody, severity, routeId, validFrom, validUntil } = result.data;

    const alert = await prisma.alert.create({
      data: {
        title,
        body: alertBody,
        severity,
        routeId: routeId || null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        createdById: user.id,
      },
      include: {
        route: true,
      }
    });

    // 1. Emit live update event
    globalEmitter.emit(SSE_EVENTS.ALERT_NEW, alert);

    // 2. Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_ALERT',
        entityType: 'ALERT',
        entityId: alert.id,
        diffJson: JSON.stringify(alert),
      }
    });

    return NextResponse.json({ alert });
  } catch (err) {
    console.error('Create alert error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
