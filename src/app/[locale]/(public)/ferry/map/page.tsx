'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Loader } from 'lucide-react';
import { AnalyticsTrigger } from '../../_components/analytics-trigger';

const FerryMap = dynamic(
  () => import('@/components/blocks/ferry-map-client'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] w-full rounded-lg border flex flex-col items-center justify-center bg-muted/20 gap-3">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground font-semibold">Loading map components...</span>
      </div>
    ),
  }
);

export default function MapPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = useTranslations('Common');

  return (
    <div className="container py-8 space-y-6">
      <AnalyticsTrigger eventName="map_view" />
      <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">{t('map')}</h1>
        <p className="text-muted-foreground text-sm">Interactive routing and boat terminal facilities map.</p>
      </div>

      <FerryMap locale={locale} />
    </div>
  );
}
