import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { permitSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login to apply for a park permit.' }, { status: 401 });
    }

    const body = await req.json();
    const result = permitSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const { facility, dateRangeStart, dateRangeEnd, purpose } = result.data;

    const permitRequest = await prisma.permitRequest.create({
      data: {
        userId: user.id,
        facility,
        dateRangeStart: new Date(dateRangeStart),
        dateRangeEnd: new Date(dateRangeEnd),
        purpose,
        status: 'pending',
      },
    });

    return NextResponse.json({ permitRequest });
  } catch (err) {
    console.error('Create permit request error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
