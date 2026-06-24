'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRealtime } from '@/hooks/use-realtime';
import { AnalyticsTrigger } from '../../_components/analytics-trigger';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, RefreshCw, AlertCircle, CheckCircle2, Play, Ban } from 'lucide-react';
import Link from 'next/link';

export default function SchedulesPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = useTranslations('Ferry');
  const queryClient = useQueryClient();
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Fetch routes
  const { data: routesData } = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const res = await fetch('/api/v1/routes');
      return res.json();
    },
  });

  const queryKey = ['schedules', selectedRoute, selectedDate];

  // Fetch schedules
  const { data: schedulesData, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let url = `/api/v1/schedules?date=${selectedDate}`;
      if (selectedRoute !== 'all') {
        url += `&routeId=${selectedRoute}`;
      }
      const res = await fetch(url);
      return res.json();
    },
  });

  // Setup real-time listener (SSE) with fallback polling
  const { status: connectionStatus, lastUpdated } = useRealtime({
    pollingUrl: `/api/v1/schedules?date=${selectedDate}${
      selectedRoute !== 'all' ? `&routeId=${selectedRoute}` : ''
    }`,
    onPollData: (newData) => {
      queryClient.setQueryData(queryKey, newData);
    },
    onScheduleUpdate: (updatedSchedule) => {
      // Intelligently patch cache in place
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData || !oldData.schedules) return oldData;
        const updatedList = oldData.schedules.map((s: any) => {
          if (s.id === updatedSchedule.id) {
            return { ...s, ...updatedSchedule };
          }
          return s;
        });
        return { ...oldData, schedules: updatedList };
      });
    },
  });

  const routes = routesData?.routes || [];
  const schedules = schedulesData?.schedules || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on-time':
        return (
          <Badge variant="outline" className="border-green-500 bg-green-500/10 text-green-700 dark:text-green-300 gap-1 font-bold">
            <CheckCircle2 className="h-3 w-3" />
            {t('onTime')}
          </Badge>
        );
      case 'delayed':
        return (
          <Badge variant="outline" className="border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 gap-1 font-bold">
            <Clock className="h-3 w-3" />
            {t('delayed')}
          </Badge>
        );
      case 'boarding':
        return (
          <Badge variant="outline" className="border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 gap-1 font-bold animate-pulse">
            <Play className="h-3 w-3" />
            {t('boarding')}
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="border-red-500 bg-red-500/10 text-red-700 dark:text-red-300 gap-1 font-bold">
            <Ban className="h-3 w-3" />
            {t('cancelled')}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <AnalyticsTrigger eventName="schedules_view" meta={{ routeId: selectedRoute, date: selectedDate }} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">{t('liveStatus')}</h1>
          <p className="text-muted-foreground text-sm">Real-time ferry transit status and departure timetables.</p>
        </div>

        {/* Real-time Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border bg-muted/30">
          <div className={`h-2.5 w-2.5 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'
          }`} />
          <span className="text-muted-foreground">
            {connectionStatus === 'connected' ? t('live') : t('reconnecting')}
          </span>
          <span className="text-muted-foreground/40 font-normal">|</span>
          <span className="text-muted-foreground/75 font-normal">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t('selectRoute')}</label>
            <Select value={selectedRoute} onValueChange={(val) => setSelectedRoute(val || 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="All Ferry Routes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ferry Routes</SelectItem>
                {routes.map((r: any) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-[200px] space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t('date')}</label>
            <input
              type="date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Timetable */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg font-bold">{t('nextDepartures')}</CardTitle>
          <CardDescription>Passenger boarding starts 10 minutes prior to departure.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading schedules...</span>
            </div>
          ) : schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-bold text-muted-foreground">{t('noSchedules')}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('route')}</TableHead>
                    <TableHead>{t('boat')}</TableHead>
                    <TableHead>{t('departure')}</TableHead>
                    <TableHead>{t('arrival')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('remaining')}</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule: any) => {
                    const isBookable = schedule.status !== 'cancelled' && schedule.capacityRemaining > 0;
                    return (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">
                          <div>
                            <span>{schedule.route.name}</span>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {schedule.route.originTerminal.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {schedule.ferry.name}
                        </TableCell>
                        <TableCell className="text-sm font-bold">
                          {new Date(schedule.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(schedule.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(schedule.status)}
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className={`font-semibold ${
                            schedule.capacityRemaining < 5 ? 'text-destructive font-bold' : ''
                          }`}>
                            {schedule.capacityRemaining} / {schedule.ferry.capacity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {isBookable ? (
                            <Link
                              href={`/${locale}/ferry/book?scheduleId=${schedule.id}`}
                              className={buttonVariants({ size: 'sm' })}
                            >
                              {t('action')}
                            </Link>
                          ) : (
                            <Button size="sm" disabled>
                              Sold Out
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
