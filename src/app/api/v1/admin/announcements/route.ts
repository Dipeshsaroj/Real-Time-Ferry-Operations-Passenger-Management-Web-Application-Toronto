import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const announcements = await prisma.announcement.findMany({
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json({ announcements });
  } catch (err) {
    console.error('Error fetching admin announcements:', err);
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
    const { title, body: textBody, language } = body;

    if (!title || !textBody) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body: textBody,
        language: language || 'en',
      },
    });

    // Log the audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'create',
        entityType: 'Announcement',
        entityId: announcement.id,
        diffJson: JSON.stringify({ title, language }),
      },
    });

    return NextResponse.json({ announcement }, { status: 211 });
  } catch (err) {
    console.error('Error creating announcement:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    await prisma.announcement.delete({ where: { id } });

    // Log the audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'delete',
        entityType: 'Announcement',
        entityId: id,
        diffJson: JSON.stringify({ title: existing.title }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting announcement:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
