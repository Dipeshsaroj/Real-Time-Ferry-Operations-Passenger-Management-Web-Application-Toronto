import React from 'react';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { Landmark, Accessibility, Clock } from 'lucide-react';
import { AnalyticsTrigger } from '../_components/analytics-trigger';

export default async function ParksPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const parks = await prisma.park.findMany({
    include: { programs: true }
  });

  return (
    <div className="container py-8 space-y-6">
      <AnalyticsTrigger eventName="parks_list_view" />
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">Parks & Trails</h1>
        <p className="text-muted-foreground text-sm">Discover public gardens, nature reserves, and walking trails in Toronto.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {parks.map((park) => {
          const features = JSON.parse(park.accessibilityFeatures || '[]');
          const hours = JSON.parse(park.hoursJson || '{}');
          
          return (
            <Card key={park.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-xl font-bold text-primary">{park.name}</CardTitle>
                  <Landmark className="h-5 w-5 shrink-0 text-muted-foreground" />
                </div>
                <CardDescription className="line-clamp-3 text-sm mt-1">{park.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 mt-auto">
                <div className="flex flex-col sm:flex-row justify-between border-t border-b py-2 text-xs text-muted-foreground gap-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Open: {hours.open} - {hours.close} {hours.closedOn !== 'None' ? `(Closed on ${hours.closedOn})` : ''}</span>
                  </div>
                  {features.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Accessibility className="h-3.5 w-3.5 text-primary" />
                      <span>{features.length} Accessibility features</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {park.programs.length} Active Programs
                  </span>
                  <Link href={`/${locale}/parks-trails/${park.id}`} className={buttonVariants({ size: 'sm' })}>
                    View Details
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
