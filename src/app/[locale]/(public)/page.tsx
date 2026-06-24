import React from 'react';
import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Anchor, Calendar, Landmark, Map, Navigation, Ship, FileText, ArrowRight } from 'lucide-react';
import { AnalyticsTrigger } from './_components/analytics-trigger';

export default async function HomePage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = await getTranslations('Home');
  const tc = await getTranslations('Common');

  // Fetch upcoming events
  const events = await prisma.event.findMany({
    orderBy: { startAt: 'asc' },
    take: 3,
  });

  // Fetch announcements
  const announcements = await prisma.announcement.findMany({
    where: { language: locale },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  });

  const quickLinks = [
    {
      title: t('checkSchedules'),
      desc: "Live boat departure times, statuses, and seat availability.",
      href: `/${locale}/ferry/schedules`,
      icon: Ship,
    },
    {
      title: t('bookTickets'),
      desc: "Secure boat ride tickets and generate digital boarding passes.",
      href: `/${locale}/ferry/book`,
      icon: Anchor,
    },
    {
      title: "Ferry & Route Map",
      desc: "Interactive map of Toronto Island ferry terminals and ship routes.",
      href: `/${locale}/ferry/map`,
      icon: Map,
    },
    {
      title: t('exploreParks'),
      desc: "Directory of parks, opening hours, and facilities.",
      href: `/${locale}/parks-trails`,
      icon: Landmark,
    },
    {
      title: t('requestPermits'),
      desc: "Submit facility bookings or park photography requests.",
      href: `/${locale}/permits-bookings`,
      icon: FileText,
    },
    {
      title: "Recreation Programs",
      desc: "Yoga, birdwatching, and nature walks in Toronto parks.",
      href: `/${locale}/programs`,
      icon: Navigation,
    },
  ];

  return (
    <div>
      {/* Analytics Event Logger Component */}
      <AnalyticsTrigger eventName="pageview" meta={{ path: '/' }} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20 border-b">
        <div className="container max-w-5xl text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary leading-tight">
            {t('welcome')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href={`/${locale}/ferry/book`} className={buttonVariants({ size: 'lg', className: 'font-semibold' })}>
              {t('bookTickets')}
            </Link>
            <Link href={`/${locale}/ferry/schedules`} className={buttonVariants({ size: 'lg', variant: 'outline', className: 'font-semibold' })}>
              {t('checkSchedules')}
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions / Features */}
      <section className="py-16 container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-primary">{t('quickActions')}</h2>
          <p className="text-muted-foreground mt-2">Access municipal ferry services, maps, and park permits.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Card key={link.href} className="hover:shadow-md transition-shadow group">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold">{link.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm min-h-[40px]">{link.desc}</CardDescription>
                  <Link href={link.href} className={buttonVariants({ variant: 'link', className: 'p-0 gap-1 text-primary group-hover:translate-x-1 transition-transform' })}>
                    Explore <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Explore by User Profile */}
      <section className="py-16 bg-muted/30 border-t border-b">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-primary">Explore by Profile</h2>
            <p className="text-muted-foreground mt-2">Access specialized services, timings, and dashboards tailored for you.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Citizens & Residents */}
            <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold mb-2">CR</div>
                <CardTitle className="text-xl font-bold">Citizens & Residents</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Access regular ferry schedules, register for recreation programs, and submit facility permit requests.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex flex-wrap gap-2">
                <Link href={`/${locale}/ferry/book`} className={buttonVariants({ size: 'sm', variant: 'default' })}>
                  Book Ferry Tickets
                </Link>
                <Link href={`/${locale}/programs`} className={buttonVariants({ size: 'sm', variant: 'outline' })}>
                  Recreation Programs
                </Link>
                <Link href={`/${locale}/permits-bookings`} className={buttonVariants({ size: 'sm', variant: 'outline' })}>
                  Permits & Bookings
                </Link>
              </CardContent>
            </Card>

            {/* Tourists & Visitors */}
            <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-10 w-10 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center font-bold mb-2">TV</div>
                <CardTitle className="text-xl font-bold">Tourists & Visitors</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Plan your visit to the Toronto Islands, view ferry terminal maps, check timetables, and discover local events.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex flex-wrap gap-2">
                <Link href={`/${locale}/ferry/map`} className={buttonVariants({ size: 'sm', variant: 'default' })}>
                  Interactive Map
                </Link>
                <Link href={`/${locale}/events`} className={buttonVariants({ size: 'sm', variant: 'outline' })}>
                  Upcoming Events
                </Link>
                <Link href={`/${locale}/ferry/schedules`} className={buttonVariants({ size: 'sm', variant: 'outline' })}>
                  Ferry Schedules
                </Link>
              </CardContent>
            </Card>

            {/* Operations & Admin Staff */}
            <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold mb-2">OS</div>
                <CardTitle className="text-xl font-bold">Operations & Admin Staff</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Manage ferry operations, timetables, active safety alerts, and publish municipal announcements.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex flex-wrap gap-2">
                <Link href={`/${locale}/admin`} className={buttonVariants({ size: 'sm', variant: 'default' })}>
                  Admin Portal
                </Link>
                <Link href={`/${locale}/admin/alerts`} className={buttonVariants({ size: 'sm', variant: 'outline' })}>
                  Publish Safety Alert
                </Link>
                <Link href={`/${locale}/admin/schedules`} className={buttonVariants({ size: 'sm', variant: 'outline' })}>
                  Manage Schedules
                </Link>
              </CardContent>
            </Card>

            {/* Senior Management */}
            <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-10 w-10 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold mb-2">SM</div>
                <CardTitle className="text-xl font-bold">Senior Management</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Monitor key engagement metrics, track public service visibility, and audit operational activity logs.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex flex-wrap gap-2">
                <Link href={`/${locale}/admin`} className={buttonVariants({ size: 'sm', variant: 'default' })}>
                  System Analytics
                </Link>
                <Link href={`/${locale}/admin/audit`} className={buttonVariants({ size: 'sm', variant: 'outline' })}>
                  Review Audit Logs
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Two Column Section for Events and Announcements */}
      <section className="py-16 bg-muted/20 border-b">
        <div className="container grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Announcements (CMS) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-bold text-primary">Announcements</h2>
            </div>
            {announcements.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent announcements.</p>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <Card key={ann.id} className="border-l-4 border-l-primary">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base font-bold">{ann.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(ann.publishedAt).toLocaleDateString(locale, { dateStyle: 'medium' })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground">{ann.body}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-bold text-primary">{t('upcomingEvents')}</h2>
              <Link href={`/${locale}/events`} className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'gap-1' })}>
                {t('viewAll')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {events.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming events scheduled.</p>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id}>
                    <CardHeader className="p-4 pb-2 flex flex-row gap-4 items-start">
                      <div className="bg-primary/10 text-primary p-3 rounded-lg flex flex-col items-center justify-center shrink-0 min-w-[60px]">
                        <Calendar className="h-5 w-5" />
                        <span className="text-xs font-bold mt-1">
                          {new Date(event.startAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base font-bold leading-tight">{event.title}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1">
                          Location: {event.location}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
