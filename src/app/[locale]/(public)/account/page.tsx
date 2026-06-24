import React from 'react';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Ship, Mail, Settings } from 'lucide-react';
import { BookingList } from './_components/booking-list';
import { AnalyticsTrigger } from '../_components/analytics-trigger';

export default async function AccountPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const token = cookies().get('token')?.value;

  if (!token) {
    redirect(`/${locale}/login?callbackUrl=/${locale}/account`);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    redirect(`/${locale}/login?callbackUrl=/${locale}/account`);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      schedule: {
        include: {
          route: {
            include: {
              originTerminal: true,
              destinationTerminal: true,
            }
          },
          ferry: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container py-12 space-y-8">
      <AnalyticsTrigger eventName="account_view" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary">{user.name}</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5" /> {user.email} | Role: <span className="capitalize font-bold text-primary">{user.role}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Ship className="h-5 w-5" /> Your Boat Bookings
          </h2>
          
          <BookingList initialBookings={bookings} locale={locale} />
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Settings className="h-5 w-5" /> Preferences
          </h2>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Alert Notifications</CardTitle>
              <CardDescription>Configure how you receive safety warnings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b">
                <span>Email Alerts</span>
                <span className="text-xs bg-green-500/10 text-green-700 dark:text-green-300 font-bold px-2 py-0.5 rounded">Enabled</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>SMS Notifications</span>
                <span className="text-xs bg-muted text-muted-foreground font-bold px-2 py-0.5 rounded">Disabled</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Preferred Language</span>
                <span className="text-xs font-bold uppercase">{user.language}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
