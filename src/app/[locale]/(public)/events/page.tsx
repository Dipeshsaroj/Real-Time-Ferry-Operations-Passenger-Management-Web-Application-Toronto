import React from 'react';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users } from 'lucide-react';
import { AnalyticsTrigger } from '../_components/analytics-trigger';

export default async function EventsPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const events = await prisma.event.findMany({
    orderBy: { startAt: 'asc' }
  });

  return (
    <div className="container py-8 space-y-6">
      <AnalyticsTrigger eventName="events_list_view" />
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">Events & Festivals</h1>
        <p className="text-muted-foreground text-sm">Find upcoming festivals, runs, and events happening at the island parks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="flex flex-col justify-between">
            <CardHeader className="pb-2 flex flex-row gap-4 items-start">
              <div className="bg-primary/10 text-primary p-3 rounded-lg flex flex-col items-center justify-center shrink-0 min-w-[65px] text-center">
                <Calendar className="h-5 w-5" />
                <span className="text-xs font-bold mt-1">
                  {new Date(event.startAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold leading-snug">{event.title}</CardTitle>
                <CardDescription className="text-xs flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {event.location}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
              
              <div className="flex justify-between items-center border-t pt-3 text-xs text-muted-foreground">
                <span>
                  Date: {new Date(event.startAt).toLocaleDateString(locale, { dateStyle: 'long' })}
                </span>
                <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                  <Users className="h-3.5 w-3.5" />
                  {event.rsvpCount} Attending
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
