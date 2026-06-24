import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, path, sessionId, meta } = body;

    const event = await prisma.analyticsEvent.create({
      data: {
        type: type || 'pageview',
        path: path || '/',
        sessionId: sessionId || 'unknown',
        metaJson: JSON.stringify(meta || {}),
      },
    });

    return NextResponse.json({ success: true, id: event.id });
  } catch (err) {
    console.error('Analytics logging error:', err);
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  }
}
