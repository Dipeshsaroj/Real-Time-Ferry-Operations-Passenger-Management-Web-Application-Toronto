import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    const { id } = params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        schedule: {
          include: {
            route: {
              include: {
                originTerminal: true,
                destinationTerminal: true,
              },
            },
            ferry: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Auth check
    if (booking.userId && (!user || (user.id !== booking.userId && user.role === 'citizen'))) {
      return NextResponse.json({ error: 'Unauthorized access to this booking.' }, { status: 403 });
    }

    return NextResponse.json({ booking });
  } catch (err) {
    console.error('Fetch booking error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    const { id } = params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { schedule: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Auth check
    if (booking.userId && (!user || (user.id !== booking.userId && user.role === 'citizen'))) {
      return NextResponse.json({ error: 'Unauthorized to cancel this booking.' }, { status: 403 });
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Booking is already cancelled.' }, { status: 400 });
    }

    // Run cancel transaction
    const cancelledBooking = await prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: { status: 'cancelled' },
      });

      await tx.schedule.update({
        where: { id: booking.scheduleId },
        data: {
          capacityRemaining: {
            increment: booking.passengerCount,
          },
        },
      });

      return updatedBooking;
    });

    return NextResponse.json({ booking: cancelledBooking });
  } catch (err: any) {
    console.error('Cancel booking error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
