import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { bookingSchema } from '@/lib/validations';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();
    
    const result = bookingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const { scheduleId, passengerCount, guestEmail } = result.data;

    if (!user && !guestEmail) {
      return NextResponse.json({ error: 'Guest email is required for unauthenticated bookings.' }, { status: 400 });
    }

    const booking = await prisma.$transaction(async (tx) => {
      const schedule = await tx.schedule.findUnique({
        where: { id: scheduleId },
        include: { ferry: true }
      });

      if (!schedule) {
        throw new Error('Schedule not found');
      }

      if (schedule.status === 'cancelled') {
        throw new Error('This boat service has been cancelled.');
      }

      if (schedule.capacityRemaining < passengerCount) {
        throw new Error('Not enough seats remaining on this boat ride.');
      }

      await tx.schedule.update({
        where: { id: scheduleId },
        data: {
          capacityRemaining: {
            decrement: passengerCount,
          },
        },
      });

      const qrCodeToken = uuidv4();
      const newBooking = await tx.booking.create({
        data: {
          userId: user ? user.id : null,
          guestEmail: user ? null : guestEmail,
          scheduleId,
          passengerCount,
          qrCodeToken,
          status: 'confirmed',
        },
        include: {
          schedule: {
            include: {
              route: {
                include: {
                  originTerminal: true,
                  destinationTerminal: true,
                }
              },
              ferry: true,
            }
          }
        }
      });

      return newBooking;
    });

    return NextResponse.json({ booking });
  } catch (err: any) {
    console.error('Booking transaction error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 400 });
  }
}
