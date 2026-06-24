'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Ticket, Ban, Loader, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function BookingList({ initialBookings, locale }: { initialBookings: any[]; locale: string }) {
  const [bookings, setBookings] = useState<any[]>(initialBookings);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This will restore capacity on the boat schedule.')) {
      return;
    }

    setCancellingId(id);
    try {
      const res = await fetch(`/api/v1/bookings/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel booking');
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
      );
      toast.success('Booking cancelled successfully. Capacity restored!');
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.');
    } finally {
      setCancellingId(null);
    }
  };

  if (bookings.length === 0) {
    return (
      <Card className="border-dashed border-2 p-8 text-center flex flex-col items-center justify-center gap-3">
        <Ticket className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-bold text-muted-foreground">No bookings found</p>
        <p className="text-xs text-muted-foreground max-w-sm">You haven't booked any ferry rides yet. Use the ticket booking wizard to purchase tickets.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const schedule = booking.schedule;
        const route = schedule.route;
        const isCancelled = booking.status === 'cancelled';
        const isPast = new Date(schedule.departureTime) < new Date();
        const canCancel = !isCancelled && !isPast;

        return (
          <Card key={booking.id} className={isCancelled ? 'opacity-65 border-dashed bg-muted/20' : 'border-l-4 border-l-primary'}>
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">Route</span>
                  <CardTitle className="text-base font-bold text-primary">{route.name}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={isCancelled ? 'destructive' : 'default'} className="font-bold">
                    {booking.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span>Terminal: {route.originTerminal.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    Date: {new Date(schedule.departureTime).toLocaleDateString([], { dateStyle: 'medium' })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    Time: {new Date(schedule.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Ticket className="h-4 w-4 text-primary shrink-0" />
                  <span>{booking.passengerCount} Passenger(s)</span>
                </div>
              </div>

              {canCancel && (
                <div className="flex justify-end border-t pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/20 hover:bg-destructive/5 font-semibold gap-1.5"
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={cancellingId === booking.id}
                  >
                    {cancellingId === booking.id ? (
                      <>
                        <Loader className="h-3.5 w-3.5 animate-spin mr-1" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <Ban className="h-3.5 w-3.5" />
                        Cancel Booking
                      </>
                    )}
                  </Button>
                </div>
              )}

              {isCancelled && (
                <div className="bg-destructive/5 text-destructive p-2.5 rounded text-xs border border-destructive/10 flex gap-2 items-center">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>This booking has been cancelled and capacity has been returned to the schedule.</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
