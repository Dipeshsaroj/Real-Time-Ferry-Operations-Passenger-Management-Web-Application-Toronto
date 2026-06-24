'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Anchor, ArrowRight, ArrowLeft, Check, Ticket, AlertTriangle, Loader, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import QRCode from 'qrcode';
import { AnalyticsTrigger } from '../../_components/analytics-trigger';
import { useSearchParams } from 'next/navigation';

export default function BookPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = useTranslations('Ferry');
  const searchParams = useSearchParams();
  const preselectedScheduleId = searchParams.get('scheduleId');

  const [step, setStep] = useState<number>(1);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(preselectedScheduleId || '');
  
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string>('');

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const { data: routesData } = useQuery({
    queryKey: ['book-routes'],
    queryFn: async () => {
      const res = await fetch('/api/v1/routes');
      return res.json();
    },
  });

  const { data: schedulesData, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['book-schedules', selectedRouteId, selectedDate],
    queryFn: async () => {
      if (!selectedRouteId) return { schedules: [] };
      const res = await fetch(`/api/v1/schedules?routeId=${selectedRouteId}&date=${selectedDate}`);
      return res.json();
    },
    enabled: !!selectedRouteId,
  });

  useEffect(() => {
    if (preselectedScheduleId) {
      fetch(`/api/v1/schedules`)
        .then((res) => res.json())
        .then((data) => {
          const schedule = data.schedules?.find((s: any) => s.id === preselectedScheduleId);
          if (schedule) {
            setSelectedRouteId(schedule.routeId);
            setSelectedDate(schedule.departureTime.split('T')[0]);
            setSelectedScheduleId(preselectedScheduleId);
            setStep(3);
          }
        });
    }
  }, [preselectedScheduleId]);

  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      scheduleId: selectedScheduleId,
      passengerCount: 1,
      guestEmail: '',
    },
  });

  useEffect(() => {
    form.setValue('scheduleId', selectedScheduleId);
  }, [selectedScheduleId, form]);

  const routes = routesData?.routes || [];
  const schedules = schedulesData?.schedules || [];
  const selectedSchedule = schedules.find((s: any) => s.id === selectedScheduleId);

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    setBookingError('');
    try {
      const res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      setBookingResult(data.booking);
      
      const qrDataUrl = await QRCode.toDataURL(data.booking.qrCodeToken);
      setQrCodeDataUrl(qrDataUrl);
      
      setStep(5);
    } catch (err: any) {
      setBookingError(err.message || 'An error occurred during booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl py-12 space-y-6">
      <AnalyticsTrigger eventName="booking_flow_start" meta={{ step }} />

      <div className="text-center space-y-2 mb-8">
        <Ticket className="h-10 w-10 text-primary mx-auto" />
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">Book Ferry Tickets</h1>
        <p className="text-muted-foreground text-sm">Follow the simple steps to purchase your digital ferry tickets.</p>
      </div>

      <div className="flex justify-between items-center px-6 py-3 bg-muted/30 border rounded-lg text-xs font-semibold text-muted-foreground">
        <span className={step >= 1 ? 'text-primary font-bold' : ''}>1. Route</span>
        <ArrowRight className="h-3 w-3" />
        <span className={step >= 2 ? 'text-primary font-bold' : ''}>2. Timetable</span>
        <ArrowRight className="h-3 w-3" />
        <span className={step >= 3 ? 'text-primary font-bold' : ''}>3. Passengers</span>
        <ArrowRight className="h-3 w-3" />
        <span className={step >= 4 ? 'text-primary font-bold' : ''}>4. Review</span>
        <ArrowRight className="h-3 w-3" />
        <span className={step === 5 ? 'text-primary font-bold' : ''}>5. Ticket</span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Select Ferry Route</CardTitle>
                <CardDescription>Choose your departure and arrival ferry route.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Water Route</label>
                  <Select
                    value={selectedRouteId}
                    onValueChange={(val) => {
                      setSelectedRouteId(val || '');
                      setSelectedScheduleId('');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a water route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((r: any) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t p-4">
                <Button
                  type="button"
                  disabled={!selectedRouteId}
                  onClick={() => setStep(2)}
                  className="gap-2"
                >
                  Next Step <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Select Departure Schedule</CardTitle>
                <CardDescription>Choose the date and live time slot.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Travel Date</label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedScheduleId('');
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Available Departures</label>
                  {isLoadingSchedules ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                      <Loader className="h-4 w-4 animate-spin text-primary" />
                      Loading schedules...
                    </div>
                  ) : schedules.length === 0 ? (
                    <div className="text-sm text-destructive py-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      No active schedules found for this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {schedules.map((s: any) => {
                        const isBookable = s.status !== 'cancelled' && s.capacityRemaining > 0;
                        return (
                          <div
                            key={s.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-all flex flex-col justify-between ${
                              !isBookable
                                ? 'opacity-50 cursor-not-allowed bg-muted'
                                : selectedScheduleId === s.id
                                ? 'border-primary ring-2 ring-primary bg-primary/5'
                                : 'hover:border-primary/50'
                            }`}
                            onClick={() => isBookable && setSelectedScheduleId(s.id)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-base">
                                {new Date(s.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-xs font-medium text-muted-foreground">
                                {s.ferry.name}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-2 border-t pt-1.5 text-xs text-muted-foreground">
                              <span>Seats: {s.capacityRemaining} left</span>
                              <span className="capitalize">{s.status}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t p-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  type="button"
                  disabled={!selectedScheduleId}
                  onClick={() => setStep(3)}
                  className="gap-2"
                >
                  Next Step <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Ticket Details</CardTitle>
                <CardDescription>Enter booking count and details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="passengerCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Passengers</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!currentUser && (
                  <FormField
                    control={form.control}
                    name="guestEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your-email@example.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
              <CardFooter className="justify-between border-t p-4">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(4)}
                  className="gap-2"
                >
                  Review Order <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 4 && selectedSchedule && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Review & Payment</CardTitle>
                <CardDescription>Verify your ticket purchase details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 bg-muted/40 p-4 rounded-lg border text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-muted-foreground">Route:</span>
                    <span className="font-bold text-primary">{selectedSchedule.route.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-muted-foreground">Boarding Terminal:</span>
                    <span className="font-semibold">{selectedSchedule.route.originTerminal.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-muted-foreground">Boat Name:</span>
                    <span className="font-semibold">{selectedSchedule.ferry.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-muted-foreground">Departure:</span>
                    <span className="font-bold">
                      {new Date(selectedSchedule.departureTime).toLocaleDateString([], { dateStyle: 'medium' })} @{' '}
                      {new Date(selectedSchedule.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-muted-foreground">Passengers:</span>
                    <span className="font-bold text-primary">{form.getValues('passengerCount')}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="font-semibold text-muted-foreground">Booking Mode:</span>
                    <span className="font-semibold capitalize">
                      {currentUser ? `User (${currentUser.name})` : `Guest (${form.getValues('guestEmail')})`}
                    </span>
                  </div>
                </div>

                <div className="border border-green-500/30 bg-green-500/5 text-green-800 dark:text-green-300 p-4 rounded-lg text-xs leading-relaxed flex gap-3 items-start">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm text-green-700 dark:text-green-400 mb-0.5">Demo Mode Integration</span>
                    This is a passenger-facing preview. No actual credit card charge will occur. Clicking "Confirm & Pay" simulates a successful checkout.
                  </div>
                </div>

                {bookingError && (
                  <div className="border border-red-500/30 bg-red-500/5 text-red-800 dark:text-red-300 p-4 rounded-lg text-xs leading-relaxed flex gap-3 items-start">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                    <div>
                      <span className="font-bold block text-sm text-red-700 mb-0.5">Booking Failed</span>
                      {bookingError}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-between border-t p-4">
                <Button type="button" variant="outline" onClick={() => setStep(3)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2 font-bold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Processing Checkout...
                    </>
                  ) : (
                    <>
                      Confirm & Pay (Demo) <Check className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 5 && bookingResult && (
            <Card className="border-2 border-green-500/50">
              <CardHeader className="text-center pb-4 border-b bg-green-500/5">
                <Check className="h-10 w-10 text-green-600 bg-green-600/15 p-2 rounded-full mx-auto" />
                <CardTitle className="text-2xl font-extrabold text-green-700 dark:text-green-400 mt-3">
                  {t('ticketSuccess')}
                </CardTitle>
                <CardDescription>
                  Your ticket has been booked and capacity is decremented.
                </CardDescription>
              </CardHeader>
              <CardContent className="py-6 space-y-6 flex flex-col items-center">
                {qrCodeDataUrl && (
                  <div className="p-3 bg-white border rounded-xl shadow-inner">
                    <img src={qrCodeDataUrl} alt="Boarding Ticket QR Code" className="h-44 w-44" />
                  </div>
                )}

                <div className="w-full text-center space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Ticket ID</span>
                  <p className="font-mono text-sm font-semibold select-all text-primary">{bookingResult.id}</p>
                </div>

                <div className="w-full space-y-2 border-t pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Route:</span>
                    <span className="font-bold text-right max-w-[280px]">{bookingResult.schedule.route.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Departing:</span>
                    <span className="font-bold">
                      {new Date(bookingResult.schedule.departureTime).toLocaleDateString([], { dateStyle: 'medium' })} @{' '}
                      {new Date(bookingResult.schedule.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Seats Count:</span>
                    <span className="font-bold text-primary">{bookingResult.passengerCount} Passengers</span>
                  </div>
                </div>

                <div className="bg-muted p-3.5 rounded-lg border text-center text-xs text-muted-foreground leading-relaxed w-full">
                  {t('ticketDesc')} A confirmation log has been written to the server audit system.
                </div>
              </CardContent>
              <CardFooter className="justify-center border-t p-4 bg-muted/20">
                <Button type="button" onClick={() => {
                  setStep(1);
                  setSelectedScheduleId('');
                  setBookingResult(null);
                  setQrCodeDataUrl('');
                }}>
                  Book Another Ride
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}
