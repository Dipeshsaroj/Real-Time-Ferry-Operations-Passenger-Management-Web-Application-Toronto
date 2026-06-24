import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsTrigger } from '../_components/analytics-trigger';

export default async function CMSPage({
  params: { slug }
}: {
  params: { slug: string; locale: string }
}) {
  const page = await prisma.page.findUnique({
    where: { slug },
  });

  if (!page) {
    notFound();
  }

  return (
    <div className="container max-w-3xl py-12 space-y-6">
      <AnalyticsTrigger eventName="cms_page_view" meta={{ slug }} />

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-primary">
            {page.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <article className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-muted-foreground whitespace-pre-line">
            {page.body}
          </article>
        </CardContent>
      </Card>
    </div>
  );
}
