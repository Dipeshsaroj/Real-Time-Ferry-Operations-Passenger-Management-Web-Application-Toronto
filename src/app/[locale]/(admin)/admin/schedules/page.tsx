'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, Play, Ban, Loader, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSchedulesPage() {
  const queryClient = useQueryClient();
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch routes
  const { data: routesData } = useQuery({
    queryKey: ['admin-routes-schedules'],
    queryFn: async () => {
      const res = await fetch('/api/v1/routes');
      return res.json();
    },
  });

  const queryKey = ['admin-schedules', selectedRoute, selectedDate];

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

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/v1/admin/schedules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      toast.success(`Schedule status updated to ${newStatus} in real-time!`);
      
      // Update cache locally
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData || !oldData.schedules) return oldData;
        const updatedList = oldData.schedules.map((s: any) => {
          if (s.id === id) {
            return { ...s, status: newStatus };
          }
          return s;
        });
        return { ...oldData, schedules: updatedList };
      });
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.');
    } finally {
      setUpdatingId(null);
    }
  };

  const routes = routesData?.routes || [];
  const schedules = schedulesData?.schedules || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">Schedules Manager</h1>
        <p className="text-muted-foreground text-sm">Control live boarding statuses and report ferry delays to the public boards.</p>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-grow space-y-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Filter Route</span>
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

          <div className="w-full sm:w-[200px] space-y-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Choose Date</span>
            <input
              type="date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Schedules Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading schedules database...</span>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No schedules registered for this date.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route Details</TableHead>
                    <TableHead>Boat / Capacity</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Current Status</TableHead>
                    <TableHead className="text-right">Actions / Status Controls</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule: any) => {
                    const isUpdating = updatingId === schedule.id;
                    return (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">
                          <div>
                            <span>{schedule.route.name}</span>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Terminal: {schedule.route.originTerminal.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-semibold">{schedule.ferry.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            Capacity: {schedule.capacityRemaining} / {schedule.ferry.capacity}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-bold">
                          {new Date(schedule.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-bold uppercase ${
                            schedule.status === 'on-time' ? 'text-green-600' :
                            schedule.status === 'boarding' ? 'text-blue-500 animate-pulse' :
                            schedule.status === 'delayed' ? 'text-amber-500' : 'text-red-500'
                          }`}>
                            {schedule.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] font-semibold border-green-500/20 text-green-700 hover:bg-green-500/5"
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(schedule.id, 'on-time')}
                            >
                              On Time
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] font-semibold border-blue-500/20 text-blue-700 hover:bg-blue-500/5"
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(schedule.id, 'boarding')}
                            >
                              Boarding
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] font-semibold border-amber-500/20 text-amber-700 hover:bg-amber-500/5"
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(schedule.id, 'delayed')}
                            >
                              Delay
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] font-semibold border-red-500/20 text-red-700 hover:bg-red-500/5"
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(schedule.id, 'cancelled')}
                            >
                              Cancel
                            </Button>
                          </div>
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
