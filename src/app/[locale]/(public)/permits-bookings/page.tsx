'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { permitSchema } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileText, CheckCircle2, Lock, Loader } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { AnalyticsTrigger } from '../_components/analytics-trigger';

export default function PermitsPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.user) setCurrentUser(data.user);
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, []);

  const form = useForm({
    resolver: zodResolver(permitSchema),
    defaultValues: {
      facility: '',
      dateRangeStart: '',
      dateRangeEnd: '',
      purpose: '',
    },
  });

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/v1/permits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit permit request');
      }

      setSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center gap-3">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Verifying access rights...</span>
      </div>
    );
  }

  return (
    <div className="container max-w-xl py-12 space-y-6">
      <AnalyticsTrigger eventName="permits_page_view" />

      <div className="text-center space-y-2 mb-8">
        <FileText className="h-10 w-10 text-primary mx-auto" />
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">Park Permit Applications</h1>
        <p className="text-muted-foreground text-sm">Submit bookings for parks facilities, events, and shoots.</p>
      </div>

      {!currentUser ? (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <CardTitle className="text-lg font-bold">Authentication Required</CardTitle>
            <CardDescription>
              You must be logged in as a registered citizen to apply for park permits.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6 pt-0">
            <Button onClick={() => router.push(`/login?callbackUrl=/${locale}/permits-bookings`)}>
              Login / Register
            </Button>
          </CardContent>
        </Card>
      ) : success ? (
        <Card className="border-2 border-green-500/50">
          <CardHeader className="text-center pb-4 bg-green-500/5">
            <CheckCircle2 className="h-10 w-10 text-green-600 bg-green-600/15 p-2 rounded-full mx-auto" />
            <CardTitle className="text-2xl font-extrabold text-green-700 dark:text-green-400 mt-3">
              Permit Submitted!
            </CardTitle>
            <CardDescription>
              Your request has been successfully queued for Toronto PF&R staff review.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6 text-center text-sm text-muted-foreground leading-relaxed">
            Permit requests are processed within 3-5 working days. You can track this application in your Citizen Account dashboard history.
          </CardContent>
          <CardFooter className="justify-center border-t p-4 bg-muted/20">
            <Button onClick={() => router.push(`/account`)}>
              Go to Account
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">New Permit Form</CardTitle>
                <CardDescription>All fields are mandatory.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Facility */}
                <FormField
                  control={form.control}
                  name="facility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Facility / Park</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Centre Island Olympic Stage, High Park Amphitheatre" {...field} />
                      </FormControl>
                      <FormDescription>Specify the precise park and facility area.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateRangeStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateRangeEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Purpose */}
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose of Permit</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the event, photography shoot, or school picnic details..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {submitError && (
                  <p className="text-sm font-bold text-destructive">{submitError}</p>
                )}
              </CardContent>
              <CardFooter className="justify-end border-t p-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Submitting Request...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}
    </div>
  );
}
