import { signSession, SESSION_COOKIES, sessionCookieOptions } from '@/lib/auth/session';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@terapistbul.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(req) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return Response.json({ error: 'Eksik alan' }, { status: 400 });
  }
  const normalized = String(email).trim().toLowerCase();
  if (normalized !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return Response.json({ error: 'Geçersiz e-posta veya şifre.' }, { status: 401 });
  }

  const token = await signSession({ role: 'admin', email: normalized });
  const res = Response.json({ success: true, email: normalized });
  const opts = sessionCookieOptions();
  const parts = [
    `${SESSION_COOKIES.ADMIN}=${token}`,
    `Path=${opts.path}`,
    `Max-Age=${opts.maxAge}`,
    `SameSite=${opts.sameSite === 'lax' ? 'Lax' : opts.sameSite}`,
    'HttpOnly',
  ];
  if (opts.secure) parts.push('Secure');
  res.headers.append('Set-Cookie', parts.join('; '));
  return res;
}

export async function DELETE() {
  const res = Response.json({ success: true });
  res.headers.append(
    'Set-Cookie',
    `${SESSION_COOKIES.ADMIN}=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly`,
  );
  return res;
}
