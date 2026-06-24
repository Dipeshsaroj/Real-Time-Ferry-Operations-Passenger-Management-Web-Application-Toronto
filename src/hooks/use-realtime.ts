'use client';

import { useEffect, useState } from 'react';
import { SSE_EVENTS } from '@/lib/event-emitter';

export type RealtimeStatus = 'connected' | 'reconnecting' | 'polling-fallback' | 'failed';

interface UseRealtimeProps {
  onScheduleUpdate?: (data: any) => void;
  onAlertNew?: (data: any) => void;
  pollingUrl?: string;
  onPollData?: (data: any) => void;
}

export function useRealtime({
  onScheduleUpdate,
  onAlertNew,
  pollingUrl,
  onPollData,
}: UseRealtimeProps = {}) {
  const [status, setStatus] = useState<RealtimeStatus>('reconnecting');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isAborted = false;

    const startSSE = () => {
      if (isAborted) return;
      
      setStatus('reconnecting');
      eventSource = new EventSource('/api/v1/realtime/stream');

      eventSource.onopen = () => {
        setStatus('connected');
        setLastUpdated(new Date());
        if (fallbackInterval) {
          clearInterval(fallbackInterval);
          fallbackInterval = null;
        }
      };

      eventSource.addEventListener(SSE_EVENTS.SCHEDULE_UPDATE, (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastUpdated(new Date());
          if (onScheduleUpdate) onScheduleUpdate(data);
        } catch (e) {
          console.error('Error parsing schedule update:', e);
        }
      });

      eventSource.addEventListener(SSE_EVENTS.ALERT_NEW, (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastUpdated(new Date());
          if (onAlertNew) onAlertNew(data);
        } catch (e) {
          console.error('Error parsing new alert:', e);
        }
      });

      eventSource.onerror = () => {
        console.warn('SSE connection dropped. Retrying and activating 30s polling fallback.');
        setStatus('reconnecting');
        
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }

        if (pollingUrl && onPollData && !fallbackInterval) {
          setStatus('polling-fallback');
          fetchPollData();
          fallbackInterval = setInterval(fetchPollData, 30000);
        }

        reconnectTimeout = setTimeout(startSSE, 10000);
      };
    };

    const fetchPollData = async () => {
      if (!pollingUrl || !onPollData) return;
      try {
        const res = await fetch(pollingUrl);
        if (res.ok) {
          const data = await res.json();
          setLastUpdated(new Date());
          onPollData(data);
        }
      } catch (err) {
        console.error('Polling fallback error:', err);
      }
    };

    startSSE();

    return () => {
      isAborted = true;
      if (eventSource) eventSource.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [pollingUrl]);

  return { status, lastUpdated };
}
