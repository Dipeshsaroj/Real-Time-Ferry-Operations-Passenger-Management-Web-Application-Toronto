import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import {routing} from './i18n/routing';
import {jwtVerify} from 'jose';

const intlMiddleware = createMiddleware(routing);

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-jwt-secret-key-1234567890-bengaluru-lakes'
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Skip middleware for API, assets, favicon, etc.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Identify if route is protected (contains /admin or /account after optional locale)
  const isProtectedPath = 
    /^\/(en|fr)\/(admin|account)(\/|$)/.test(pathname) ||
    /^\/(admin|account)(\/|$)/.test(pathname);

  const isAdminPath =
    /^\/(en|fr)\/admin(\/|$)/.test(pathname) ||
    /^\/admin(\/|$)/.test(pathname);

  if (isProtectedPath) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      const locale = pathname.startsWith('/fr') ? 'fr' : 'en';
      const loginUrl = new URL(`/${locale}/login`, req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET);
      
      if (isAdminPath) {
        const role = payload.role as string;
        if (role !== 'admin' && role !== 'staff') {
          const locale = pathname.startsWith('/fr') ? 'fr' : 'en';
          return NextResponse.redirect(new URL(`/${locale}`, req.url));
        }
      }
    } catch (err) {
      const locale = pathname.startsWith('/fr') ? 'fr' : 'en';
      const response = NextResponse.redirect(new URL(`/${locale}/login`, req.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/', '/(fr|en)/:path*', '/admin/:path*', '/account/:path*']
};
