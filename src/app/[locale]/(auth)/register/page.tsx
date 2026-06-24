'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import Link from 'next/link';

export default function RegisterPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'citizen' as const,
      language: 'en' as const,
    },
  });

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.email?._errors?.[0] || 'Registration failed');
      }

      router.push(`/${locale}/account`);
      setTimeout(() => window.location.reload(), 500);
    } catch (err: any) {
      setSubmitError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-md py-16 flex flex-col justify-center min-h-[85vh] space-y-6">
      <div className="text-center space-y-2 mb-4">
        <span className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg mx-auto">B</span>
        <h1 className="text-2xl font-extrabold tracking-tight text-primary">Create Citizen Account</h1>
        <p className="text-muted-foreground text-sm">Register to manage your bookings and apply for park permits.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Register</CardTitle>
              <CardDescription>Fill in your profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError && (
                <p className="text-sm font-bold text-destructive">{submitError}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t p-4 mt-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Registering Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                Already have an account?{' '}
                <Link href={`/${locale}/login`} className="underline text-primary font-bold">
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
