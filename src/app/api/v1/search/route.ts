import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = searchParams.get('q') || '';

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const parks = await prisma.park.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } }
        ]
      }
    });

    const programs = await prisma.program.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } }
        ]
      },
      include: { park: true }
    });

    const events = await prisma.event.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } }
        ]
      }
    });

    const routes = await prisma.route.findMany({
      where: {
        name: { contains: query }
      },
      include: { originTerminal: true, destinationTerminal: true }
    });

    const pages = await prisma.page.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { body: { contains: query } }
        ]
      }
    });

    const results: any[] = [
      ...parks.map(p => ({ id: p.id, type: 'park', title: p.name, description: p.description, url: `/parks-trails/${p.id}` })),
      ...programs.map(p => ({ id: p.id, type: 'program', title: p.name, description: p.description, url: `/programs` })),
      ...events.map(e => ({ id: e.id, type: 'event', title: e.title, description: e.description, url: `/events` })),
      ...routes.map(r => ({ id: r.id, type: 'route', title: r.name, description: `Distance: ${r.distanceKm} km, Duration: ${r.estimatedDurationMin} min`, url: `/ferry/schedules?routeId=${r.id}` })),
      ...pages.map(p => ({ id: p.id, type: 'page', title: p.title, description: p.body.substring(0, 100) + '...', url: `/${p.slug}` })),
    ];

    return NextResponse.json({ results });
  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
