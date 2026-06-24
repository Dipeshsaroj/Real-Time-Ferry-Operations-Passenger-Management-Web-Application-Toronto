import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const requests = await prisma.maintenanceRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        acceptedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return NextResponse.json({ requests });
  } catch (err) {
    console.error('Error fetching maintenance requests:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();
    const { title, description, facilityType, facilityName, reportedBy } = body;

    if (!title || !description || !facilityType || !facilityName) {
      return NextResponse.json(
        { error: 'Title, description, facilityType, and facilityName are required' },
        { status: 400 }
      );
    }

    // Default reportedBy to user's email if logged in, otherwise use input or 'Anonymous'
    const reporter = reportedBy || user?.email || 'Anonymous Citizen';

    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        title,
        description,
        facilityType,
        facilityName,
        status: 'pending',
        reportedBy: reporter,
      },
    });

    return NextResponse.json({ request: maintenanceRequest }, { status: 201 });
  } catch (err) {
    console.error('Error creating maintenance request:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
