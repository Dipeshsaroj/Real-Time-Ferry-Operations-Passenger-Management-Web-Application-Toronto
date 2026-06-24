import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

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
    const { status } = body; // approved, denied, pending

    if (!['approved', 'denied', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const oldPermit = await prisma.permitRequest.findUnique({
      where: { id },
    });

    if (!oldPermit) {
      return NextResponse.json({ error: 'Permit request not found' }, { status: 404 });
    }

    const permit = await prisma.permitRequest.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REVIEW_PERMIT',
        entityType: 'PERMIT_REQUEST',
        entityId: permit.id,
        diffJson: JSON.stringify({
          before: oldPermit,
          after: permit,
        }),
      },
    });

    return NextResponse.json({ permit });
  } catch (err) {
    console.error('Review permit error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
