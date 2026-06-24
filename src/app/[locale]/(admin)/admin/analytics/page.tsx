'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, BarChart3, Users, Clock, Monitor, Search, Ship, Ticket, Eye } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/v1/admin/analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
  });

  const kpis = analyticsData?.kpis || {
    bounceRate: "34.2%",
    avgSessionDuration: "4m 12s",
    mobilePercent: "62.4%",
    ferryPageVisits: 342,
    searchSuccessRate: "84%",
    totalVisitors: 148,
    dailyTraffic: [],
  };

  const maxVisits = kpis.dailyTraffic.length > 0 
    ? Math.max(...kpis.dailyTraffic.map((d: any) => d.visits)) 
    : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">System Analytics & Visibility</h1>
        <p className="text-muted-foreground text-sm">Monitor citizen engagement levels, device distributions, and transit bookings visibility.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading system analytics...</span>
        </div>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Total Visitors</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-black">{kpis.totalVisitors}</span>
                <CardDescription className="text-[10px] mt-1">Unique session hits recorded</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Ferry Page Views</CardTitle>
                <Ship className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-black">{kpis.ferryPageVisits}</span>
                <CardDescription className="text-[10px] mt-1">Schedules & map interactions</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Avg. Session Duration</CardTitle>
                <Clock className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-black">{kpis.avgSessionDuration}</span>
                <CardDescription className="text-[10px] mt-1">Citizen browsing time</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Search Success Rate</CardTitle>
                <Search className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-black">{kpis.searchSuccessRate}</span>
                <CardDescription className="text-[10px] mt-1">Found schedules or services</CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Chart and Mobile Ratio */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> Daily Traffic & Bookings
                </CardTitle>
                <CardDescription>Visual breakdown of page visits and bookings over the last 7 days.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2 pt-6 border-b pb-2">
                  {kpis.dailyTraffic.map((dayData: any, idx: number) => {
                    const visitHeight = (dayData.visits / maxVisits) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div className="flex gap-1.5 w-full items-end justify-center h-full">
                          {/* Visits Bar */}
                          <div 
                            style={{ height: `${visitHeight}%` }} 
                            className="w-4 bg-primary rounded-t transition-all duration-500 hover:opacity-85"
                            title={`Visits: ${dayData.visits}`}
                          />
                          {/* Bookings Bar */}
                          <div 
                            style={{ height: `${(dayData.bookings / maxVisits) * 100}%` }} 
                            className="w-4 bg-accent text-accent-foreground rounded-t transition-all duration-500 hover:opacity-85"
                            title={`Bookings: ${dayData.bookings}`}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground">{dayData.day}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-6 mt-4 text-xs font-semibold text-muted-foreground justify-center">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 bg-primary rounded" />
                    <span>Page Visits</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 bg-accent rounded" />
                    <span>Ferry Bookings</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Distribution & Metadata */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" /> Visibility Distribution
                </CardTitle>
                <CardDescription>Breakdown of citizen entry devices and behaviors.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span>Mobile Access Ratio</span>
                    <span className="text-primary">{kpis.mobilePercent}</span>
                  </div>
                  <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                    <div style={{ width: kpis.mobilePercent }} className="bg-primary h-full rounded-full" />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1.5 block">
                    Represents visits from smart devices needing mobile responsive layouts.
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span>Desktop / Tablet Ratio</span>
                    <span className="text-accent-foreground">37.6%</span>
                  </div>
                  <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                    <div style={{ width: '37.6%' }} className="bg-accent h-full rounded-full" />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1.5 block">
                    Citizens booking from home terminals or larger screens.
                  </span>
                </div>

                <div className="bg-muted/40 p-4 rounded-lg border space-y-2 text-xs">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground">Bounce Rate:</span>
                    <span className="font-bold text-foreground">{kpis.bounceRate}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground">Top Visited Service:</span>
                    <span className="font-bold text-primary">Ferry Schedules</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Public Language Pref:</span>
                    <span className="font-bold text-foreground">English (74%) / French (26%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
