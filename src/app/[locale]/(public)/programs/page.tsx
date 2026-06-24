import React from 'react';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Tag, Landmark } from 'lucide-react';
import Link from 'next/link';
import { AnalyticsTrigger } from '../_components/analytics-trigger';

export default async function ProgramsPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const programs = await prisma.program.findMany({
    include: { park: true }
  });

  return (
    <div className="container py-8 space-y-6">
      <AnalyticsTrigger eventName="programs_list_view" />
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">Recreation Programs</h1>
        <p className="text-muted-foreground text-sm">Join structured fitness, educational, and conservation activities at our island docks and parks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {programs.map((program) => (
          <Card key={program.id} className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-xl font-bold text-primary">{program.name}</CardTitle>
                <Tag className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
              </div>
              <CardDescription className="text-xs uppercase tracking-wider font-bold text-primary">
                {program.category}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{program.description}</p>
              
              <div className="space-y-2 border-t pt-3">
                <div className="bg-muted p-2 rounded text-xs text-muted-foreground flex gap-2 items-center">
                  <Calendar className="h-4 w-4 shrink-0 text-primary" />
                  <span>{program.schedule}</span>
                </div>
                {program.park && (
                  <div className="bg-muted p-2 rounded text-xs text-muted-foreground flex gap-2 items-center">
                    <Landmark className="h-4 w-4 shrink-0 text-primary" />
                    <span>Location:{' '}
                      <Link href={`/${locale}/parks-trails/${program.park.id}`} className="underline font-semibold hover:text-primary transition-colors">
                        {program.park.name}
                      </Link>
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
