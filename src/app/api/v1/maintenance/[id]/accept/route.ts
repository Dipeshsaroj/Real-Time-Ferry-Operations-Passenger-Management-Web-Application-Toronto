import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    const existing = await prisma.maintenanceRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 });
    }

    if (existing.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending requests can be accepted' },
        { status: 400 }
      );
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status: 'accepted',
        acceptedById: user.id,
        acceptedAt: new Date(),
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'accept_maintenance',
        entityType: 'MaintenanceRequest',
        entityId: id,
        diffJson: JSON.stringify({
          from: existing.status,
          to: updated.status,
          acceptedBy: user.name,
        }),
      },
    });

    return NextResponse.json({ request: updated });
  } catch (err) {
    console.error('Error accepting maintenance request:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
