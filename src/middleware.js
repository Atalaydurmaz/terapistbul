import { NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIES } from '@/lib/auth/session';

const ADMIN_LOGIN = '/admin/giris';
const PANEL_LOGIN = '/panel/giris';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== ADMIN_LOGIN) {
    const token = req.cookies.get(SESSION_COOKIES.ADMIN)?.value;
    const payload = token ? await verifySession(token) : null;
    if (!payload || payload.role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = ADMIN_LOGIN;
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/panel') && pathname !== PANEL_LOGIN) {
    const token = req.cookies.get(SESSION_COOKIES.PANEL)?.value;
    const payload = token ? await verifySession(token) : null;
    if (!payload || payload.role !== 'therapist') {
      const url = req.nextUrl.clone();
      url.pathname = PANEL_LOGIN;
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/panel/:path*'],
};
