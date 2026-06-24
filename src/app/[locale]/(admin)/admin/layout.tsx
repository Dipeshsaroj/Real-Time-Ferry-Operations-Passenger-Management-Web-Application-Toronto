import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, ShieldAlert, Calendar, FileText, Activity, Home, Megaphone, BarChart3, Wrench } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function AdminLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const navItems = [
    { label: 'Overview', href: `/${locale}/admin`, icon: LayoutDashboard },
    { label: 'Safety Alerts', href: `/${locale}/admin/alerts`, icon: ShieldAlert },
    { label: 'Schedules Manager', href: `/${locale}/admin/schedules`, icon: Calendar },
    { label: 'Announcements', href: `/${locale}/admin/announcements`, icon: Megaphone },
    { label: 'Permits Review', href: `/${locale}/admin/permits`, icon: FileText },
    { label: 'Maintenance Board', href: `/${locale}/admin/maintenance`, icon: Wrench },
    { label: 'System Analytics', href: `/${locale}/admin/analytics`, icon: BarChart3 },
    { label: 'Audit Logs', href: `/${locale}/admin/audit`, icon: Activity },
  ];

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="w-64 border-r bg-background hidden md:flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="font-extrabold text-primary tracking-tight">Toronto Ferry Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-md text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t space-y-2">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-md text-muted-foreground hover:bg-muted transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Public Website</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-background flex items-center justify-between px-6">
          <h2 className="font-bold text-sm text-muted-foreground tracking-wider uppercase">Toronto Ferry Operations</h2>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">Staff Node Active</span>
          </div>
        </header>
        <main id="main-content" className="flex-grow p-6 overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
