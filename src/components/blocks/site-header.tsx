'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, Sun, Moon, Globe, User, ShieldAlert } from 'lucide-react';
import { useTheme as useNextTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function SiteHeader({ locale }: { locale: string }) {
  const t = useTranslations('Common');
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Check if user session cookie is active
    fetch('/api/v1/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  const changeLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const menuItems = [
    { label: t('home'), href: `/${locale}` },
    { label: t('boating'), href: `/${locale}/ferry` },
    { label: t('parks'), href: `/${locale}/parks-trails` },
    { label: t('programs'), href: `/${locale}/programs` },
    { label: t('permits'), href: `/${locale}/permits-bookings` },
    { label: t('maintenance'), href: `/${locale}/maintenance` },
    { label: t('events'), href: `/${locale}/events` },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">T</span>
            <span className="font-bold text-lg hidden sm:inline-block tracking-tight text-primary">
              Toronto Island Ferry <span className="text-muted-foreground font-normal text-sm">PF&R</span>
            </span>
          </Link>
          {/* Main navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-primary text-foreground/80"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          {/* Search trigger */}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => router.push(`/search`)}
            aria-label={t('search')}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Language selection */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="icon" className="h-9 w-9" />}
            >
              <Globe className="h-4 w-4" />
              <span className="sr-only">Switch Language</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('fr')}>
                Français
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme selector */}
          {mounted && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}

          {/* Profile / Admin dashboard */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="default" size="sm" className="gap-2" />
                }
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline-block max-w-[100px] truncate">{currentUser.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/account`)}>
                  {t('account')}
                </DropdownMenuItem>
                {(currentUser.role === 'admin' || currentUser.role === 'staff') && (
                  <DropdownMenuItem onClick={() => router.push(`/admin`)}>
                    {t('admin')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={async () => {
                    await fetch('/api/v1/auth/logout', { method: 'POST' });
                    window.location.reload();
                  }}
                  className="text-destructive font-medium"
                >
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" onClick={() => router.push(`/login`)}>
              {t('login')}
            </Button>
          )}

          {/* Responsive Hamburger Menu */}
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon" className="h-9 w-9 md:hidden" />
              }
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-lg font-medium transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
