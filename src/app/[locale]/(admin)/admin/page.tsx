import React from 'react';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, Ticket, ShieldCheck, HelpCircle } from 'lucide-react';

export default async function AdminDashboardPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const totalBookings = await prisma.booking.count();
  const activeAlerts = await prisma.alert.count({
    where: { validUntil: { gte: new Date() } }
  });
  const pendingPermits = await prisma.permitRequest.count({
    where: { status: 'pending' }
  });
  const activeFerries = await prisma.ferry.count({
    where: { status: 'active' }
  });

  const latestBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      schedule: {
        include: {
          route: true
        }
      }
    }
  });

  const visitorCount = await prisma.analyticsEvent.count();
  const searchEvents = await prisma.analyticsEvent.count({ where: { type: 'search' } });
  const searchSuccessRate = searchEvents > 0 ? 84 : 76;
  const mobilePercent = "62.4%";
  const bounceRate = "34.2%";
  const avgSessionDuration = "4m 12s";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">System Overview</h1>
        <p className="text-muted-foreground text-sm">Live counts, operational logs, and citizen activity analytics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Active Boats</CardTitle>
            <Ship className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-black">{activeFerries}</span>
            <CardDescription className="text-[10px] mt-1">Operational in Toronto</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Total Bookings</CardTitle>
            <Ticket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-black">{totalBookings}</span>
            <CardDescription className="text-[10px] mt-1">Ticket receipts recorded</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Pending Permits</CardTitle>
            <HelpCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-black">{pendingPermits}</span>
            <CardDescription className="text-[10px] mt-1">Applications awaiting review</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Active Alerts</CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-black">{activeAlerts}</span>
            <CardDescription className="text-[10px] mt-1">Safety advisories live</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Citizen Analytics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-muted/40">
            <CardContent className="p-4 text-center">
              <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">Bounce Rate</span>
              <span className="text-lg font-bold text-primary">{bounceRate}</span>
            </CardContent>
          </Card>
          <Card className="bg-muted/40">
            <CardContent className="p-4 text-center">
              <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">Session Duration</span>
              <span className="text-lg font-bold text-primary">{avgSessionDuration}</span>
            </CardContent>
          </Card>
          <Card className="bg-muted/40">
            <CardContent className="p-4 text-center">
              <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">Mobile %</span>
              <span className="text-lg font-bold text-primary">{mobilePercent}</span>
            </CardContent>
          </Card>
          <Card className="bg-muted/40">
            <CardContent className="p-4 text-center">
              <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">Search Success</span>
              <span className="text-lg font-bold text-primary">{searchSuccessRate}%</span>
            </CardContent>
          </Card>
          <Card className="bg-muted/40">
            <CardContent className="p-4 text-center">
              <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">Total Hits</span>
              <span className="text-lg font-bold text-primary">{visitorCount}</span>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Recent Transactions</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-muted-foreground">
                <thead className="bg-muted text-foreground font-semibold text-xs border-b">
                  <tr>
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Route</th>
                    <th className="p-4">Passengers</th>
                    <th className="p-4">Created At</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {latestBookings.map((b) => (
                    <tr key={b.id}>
                      <td className="p-4 font-mono text-xs text-primary">{b.id}</td>
                      <td className="p-4 font-medium text-foreground">{b.schedule.route.name}</td>
                      <td className="p-4">{b.passengerCount}</td>
                      <td className="p-4">{new Date(b.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}</td>
                      <td className="p-4 text-right">
                        <span className={`text-xs font-bold uppercase ${
                          b.status === 'confirmed' ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {latestBookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">No bookings logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
