import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Compass, Clock, Accessibility } from 'lucide-react';
import { AnalyticsTrigger } from '../../_components/analytics-trigger';

export default async function ParkDetailPage({
  params: { id }
}: {
  params: { id: string }
}) {
  const park = await prisma.park.findUnique({
    where: { id },
    include: { programs: true }
  });

  if (!park) notFound();

  const features = JSON.parse(park.accessibilityFeatures || '[]');
  const hours = JSON.parse(park.hoursJson || '{}');

  return (
    <div className="container py-8 space-y-8">
      <AnalyticsTrigger eventName="park_detail_view" meta={{ parkId: park.id }} />

      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">{park.name}</h1>
        <p className="text-lg text-muted-foreground max-w-4xl leading-relaxed">{park.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-3">
            <Clock className="h-5 w-5 text-primary shrink-0" />
            <CardTitle className="text-lg font-bold">Timings</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Open:</span>
              <span className="font-semibold">{hours.open}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Close:</span>
              <span className="font-semibold">{hours.close}</span>
            </div>
            {hours.closedOn !== 'None' && (
              <div className="flex justify-between border-t pt-2 text-destructive">
                <span className="font-medium">Closed on:</span>
                <span className="font-bold">{hours.closedOn}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-3">
            <Compass className="h-5 w-5 text-primary shrink-0" />
            <CardTitle className="text-lg font-bold">Geographic Info</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Latitude:</span>
              <span className="font-mono">{park.lat.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Longitude:</span>
              <span className="font-mono">{park.lng.toFixed(4)}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center border-t pt-2">
              Locate on the interactive boating map.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-3">
            <Accessibility className="h-5 w-5 text-primary shrink-0" />
            <CardTitle className="text-lg font-bold">Accessibility</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {features.length === 0 ? (
              <p className="text-muted-foreground text-xs">Accessibility specifications pending update.</p>
            ) : (
              <ul className="space-y-1.5">
                {features.map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-primary">Recreation Programs at this Park</h2>
        {park.programs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recurring programs scheduled at this location currently.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {park.programs.map((program) => (
              <Card key={program.id}>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">{program.name}</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-wider font-bold text-primary">
                    Category: {program.category}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{program.description}</p>
                  <div className="bg-muted p-2.5 rounded border text-xs text-muted-foreground flex gap-2 items-center">
                    <Calendar className="h-4 w-4 shrink-0 text-primary" />
                    <span>Schedule: {program.schedule}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
