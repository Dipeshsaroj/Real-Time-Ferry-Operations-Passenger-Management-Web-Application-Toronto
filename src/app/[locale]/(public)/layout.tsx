import React from 'react';
import { SiteHeader } from '@/components/blocks/site-header';
import { SiteFooter } from '@/components/blocks/site-footer';
import { AlertBanner } from '@/components/blocks/alert-banner';

export default function PublicLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader locale={locale} />
      <AlertBanner />
      <main id="main-content" className="flex-grow focus:outline-none">
        {children}
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
