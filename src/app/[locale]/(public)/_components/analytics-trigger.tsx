'use client';

import { useEffect } from 'react';
import { logAnalyticsEvent } from '@/lib/analytics';

interface AnalyticsTriggerProps {
  eventName: string;
  meta?: Record<string, any>;
}

export function AnalyticsTrigger({ eventName, meta = {} }: AnalyticsTriggerProps) {
  useEffect(() => {
    logAnalyticsEvent(eventName, meta);
  }, [eventName, JSON.stringify(meta)]);

  return null;
}
