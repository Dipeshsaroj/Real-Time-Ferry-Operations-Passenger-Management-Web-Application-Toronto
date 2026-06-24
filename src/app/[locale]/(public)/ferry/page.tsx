import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Ship, Map, Ticket, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { AnalyticsTrigger } from '../_components/analytics-trigger';

export default function FerryHubPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <div className="container py-12 space-y-8">
      <AnalyticsTrigger eventName="boating_hub_view" />
      
      <div className="max-w-3xl space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Ferry & Water Transit Hub</h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Manage your travel bookings, view live timetables, and trace water transit routes across the Toronto Islands.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Schedule Board Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Ship className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-xl font-bold">Live Timetables</CardTitle>
            <CardDescription>Check real-time boat departures, delays, cancellations, and capacity.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href={`/${locale}/ferry/schedules`} className={buttonVariants({ className: 'w-full' })}>
              View Live Schedules
            </Link>
          </CardContent>
        </Card>

        {/* Map Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Map className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-xl font-bold">Interactive Docks Map</CardTitle>
            <CardDescription>Trace ferry routes, find dock terminal coordinates, and view real-time ship positions.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href={`/${locale}/ferry/map`} className={buttonVariants({ className: 'w-full' })}>
              Open Interactive Map
            </Link>
          </CardContent>
        </Card>

        {/* Booking Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Ticket className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-xl font-bold">Ticket Bookings</CardTitle>
            <CardDescription>Secure digital boarding passes with automatic overbooking checks.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href={`/${locale}/ferry/book`} className={buttonVariants({ className: 'w-full' })}>
              Book Boat Ride
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
