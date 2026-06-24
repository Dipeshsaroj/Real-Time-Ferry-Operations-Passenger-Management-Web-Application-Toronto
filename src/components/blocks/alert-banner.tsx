'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRealtime } from '@/hooks/use-realtime';

export function AlertBanner() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/v1/alerts')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.alerts) setAlerts(data.alerts);
      })
      .catch((err) => console.error('Error fetching alerts:', err));

    const dismissed = sessionStorage.getItem('dismissed_alerts');
    if (dismissed) {
      setDismissedIds(JSON.parse(dismissed));
    }
  }, []);

  useRealtime({
    onAlertNew: (newAlert) => {
      setAlerts((prev) => {
        if (prev.some((a) => a.id === newAlert.id)) return prev;
        return [newAlert, ...prev];
      });
    },
  });

  const dismissAlert = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    sessionStorage.setItem('dismissed_alerts', JSON.stringify(updated));
  };

  const activeAlerts = alerts.filter(
    (alert) =>
      !dismissedIds.includes(alert.id) &&
      new Date(alert.validUntil) > new Date()
  );

  if (activeAlerts.length === 0) return null;

  return (
    <div className="w-full space-y-2 container py-4">
      {activeAlerts.map((alert) => {
        const isCritical = alert.severity === 'critical';
        const isWarning = alert.severity === 'warning';
        
        let borderClass = 'border-blue-500 bg-blue-500/10 text-blue-800 dark:text-blue-200';
        let Icon = Info;
        
        if (isCritical) {
          borderClass = 'border-red-500 bg-red-500/10 text-red-800 dark:text-red-200';
          Icon = ShieldAlert;
        } else if (isWarning) {
          borderClass = 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-200';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={alert.id}
            className={`relative border rounded-lg p-4 flex gap-3 items-start justify-between ${borderClass}`}
            role="alert"
            aria-live={isCritical ? 'assertive' : 'polite'}
          >
            <div className="flex gap-3">
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block">{alert.title}</span>
                <p className="text-xs mt-1 leading-relaxed">{alert.body}</p>
                {alert.route && (
                  <span className="inline-block bg-background/50 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded mt-2">
                    Route: {alert.route.name}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full opacity-70 hover:opacity-100 shrink-0"
              onClick={() => dismissAlert(alert.id)}
              aria-label="Dismiss Alert"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
