import { NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIES } from '@/lib/auth/session';

const ADMIN_LOGIN = '/admin/giris';
const PANEL_LOGIN = '/panel/giris';

// Public API routes — no auth check applied.
// Anything under /api/admin/* or /api/panel/* NOT listed here requires the
// corresponding signed-session cookie.
const PUBLIC_API_PREFIXES = [
  '/api/admin/login',
  '/api/admin/otp/request',
  '/api/admin/otp/verify',
  '/api/panel/login',
];

function unauthorized(message = 'Yetkisiz') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // ─── API guard ────────────────────────────────────────────────
  if (pathname.startsWith('/api/admin')) {
    const isPublic = PUBLIC_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
    if (!isPublic) {
      const token = req.cookies.get(SESSION_COOKIES.ADMIN)?.value;
      const payload = token ? await verifySession(token) : null;
      if (!payload || payload.role !== 'admin') return unauthorized();
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/panel')) {
    const isPublic = PUBLIC_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
    if (!isPublic) {
      const token = req.cookies.get(SESSION_COOKIES.PANEL)?.value;
      const payload = token ? await verifySession(token) : null;
      if (!payload || payload.role !== 'therapist') return unauthorized();
    }
    return NextResponse.next();
  }

  // ─── Page guard ───────────────────────────────────────────────
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

  // /panel/session/[id] is accessible by both therapist (panel cookie) and client (NextAuth)
  // so skip the therapist-only gate here — the page itself handles auth.
  if (
    pathname.startsWith('/panel') &&
    pathname !== PANEL_LOGIN &&
    !pathname.startsWith('/panel/session')
  ) {
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
  matcher: [
    '/admin/:path*',
    '/panel/:path*',
    '/api/admin/:path*',
    '/api/panel/:path*',
  ],
};
