'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { alertSchema } from '@/lib/validations';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ShieldAlert, Trash2, Clock, AlertTriangle, Loader, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAlertsPage() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch routes for route selection dropdown
  const { data: routesData } = useQuery({
    queryKey: ['admin-routes'],
    queryFn: async () => {
      const res = await fetch('/api/v1/routes');
      return res.json();
    },
  });

  // Fetch all alerts
  const { data: alertsData, isLoading } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: async () => {
      const res = await fetch('/api/v1/admin/alerts');
      return res.json();
    },
  });

  const form = useForm({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      title: '',
      body: '',
      severity: 'info' as const,
      routeId: '',
      validFrom: new Date().toISOString().substring(0, 16), // Format: YYYY-MM-DDTHH:mm
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
    },
  });

  const routes = routesData?.routes || [];
  const alerts = alertsData?.alerts || [];

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/admin/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish alert');
      }

      toast.success('Safety alert published in real-time!');
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Columns: Alerts Listing */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Safety Alerts Manager</h1>
          <p className="text-muted-foreground text-sm">Post weather cautions, route delays, or terminal closures in real-time.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Active Safety Advisories</CardTitle>
            <CardDescription>Alerts listed below are currently visible to citizens on the public portal.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading alerts...</span>
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">No active safety alerts.</div>
            ) : (
              <div className="divide-y">
                {alerts.map((alert: any) => (
                  <div key={alert.id} className="p-4 flex gap-4 items-start justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          alert.severity === 'critical'
                            ? 'bg-red-500/10 text-red-600'
                            : alert.severity === 'warning'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-blue-500/10 text-blue-600'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="font-bold text-sm text-foreground">{alert.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">{alert.body}</p>
                      {alert.route && (
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-semibold text-muted-foreground inline-block">
                          Route: {alert.route.name}
                        </span>
                      )}
                      <div className="text-[10px] text-muted-foreground flex gap-3 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Valid: {new Date(alert.validFrom).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} - {new Date(alert.validUntil).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Publish Form */}
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-primary" /> Publish Safety Alert
                </CardTitle>
                <CardDescription>Published alerts are pushed instantly to all connected screens.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Centre Island Ferry Suspended" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Body */}
                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description / Notice Details</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Explain reason (e.g. high winds, construction, holiday)..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Severity */}
                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity Level</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="info">Info (Blue advisory)</SelectItem>
                          <SelectItem value="warning">Warning (Amber caution)</SelectItem>
                          <SelectItem value="critical">Critical (Red suspension)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Affected Route */}
                <FormField
                  control={form.control}
                  name="routeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affected Boating Route (Optional)</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="System-wide Alert" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">System-wide Alert</SelectItem>
                          {routes.map((r: any) => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Valid Until */}
                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Timestamp</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={field.value instanceof Date ? field.value.toISOString().substring(0, 16) : field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="border-t p-4 flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Publishing Notice...
                    </>
                  ) : (
                    'Publish Alert'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
