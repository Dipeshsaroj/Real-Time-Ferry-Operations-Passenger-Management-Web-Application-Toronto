import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function SiteFooter({ locale }: { locale: string }) {
  const t = useTranslations('Common');
  
  return (
    <footer className="border-t bg-muted/30 mt-auto py-8">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-bold text-sm tracking-tight text-primary">
            Toronto PF&R <span className="text-muted-foreground font-normal">Parks, Forestry & Recreation</span>
          </span>
          <p className="text-xs text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} City of Toronto. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground font-medium">
          <Link href={`/${locale}/accessibility`} className="hover:text-primary transition-colors">
            {t('accessibility')}
          </Link>
          <Link href={`/${locale}/privacy-policy`} className="hover:text-primary transition-colors">
            {t('privacy')}
          </Link>
          <Link href={`/${locale}/maintenance`} className="hover:text-primary transition-colors">
            {t('maintenance')}
          </Link>
          <Link href={`/${locale}/contact`} className="hover:text-primary transition-colors">
            {t('contact')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
