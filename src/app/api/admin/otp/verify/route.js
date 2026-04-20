import { verifySession, signSession, SESSION_COOKIES, sessionCookieOptions } from '@/lib/auth/session';

const OTP_COOKIE = 'tb_admin_otp';

function readCookie(header, name) {
  if (!header) return null;
  const parts = header.split(';').map((p) => p.trim());
  for (const p of parts) {
    if (p.startsWith(`${name}=`)) return p.slice(name.length + 1);
  }
  return null;
}

export async function POST(req) {
  try {
    const { code } = await req.json();
    const submitted = String(code || '').trim();
    if (!submitted) return Response.json({ error: 'Kod gerekli' }, { status: 400 });

    const cookieHeader = req.headers.get('cookie');
    const otpToken = readCookie(cookieHeader, OTP_COOKIE);
    if (!otpToken) {
      return Response.json({ error: 'Kod süresi doldu. Yeni kod isteyin.' }, { status: 401 });
    }

    const payload = await verifySession(otpToken);
    if (!payload || payload.purpose !== 'admin_otp' || !payload.email || !payload.code) {
      return Response.json({ error: 'Geçersiz kod oturumu' }, { status: 401 });
    }

    if (submitted !== payload.code) {
      return Response.json({ error: 'Kod hatalı' }, { status: 401 });
    }

    const adminToken = await signSession({ role: 'admin', email: payload.email });
    const opts = sessionCookieOptions();

    const adminCookie = [
      `${SESSION_COOKIES.ADMIN}=${adminToken}`,
      `Path=${opts.path}`,
      `Max-Age=${opts.maxAge}`,
      `SameSite=Lax`,
      'HttpOnly',
    ];
    if (opts.secure) adminCookie.push('Secure');

    const clearOtp = [
      `${OTP_COOKIE}=`,
      `Path=/`,
      `Max-Age=0`,
      `SameSite=Lax`,
      'HttpOnly',
    ];
    if (opts.secure) clearOtp.push('Secure');

    const res = Response.json({ success: true, email: payload.email });
    res.headers.append('Set-Cookie', adminCookie.join('; '));
    res.headers.append('Set-Cookie', clearOtp.join('; '));
    return res;
  } catch (err) {
    console.error('admin otp verify error:', err?.message || err);
    return Response.json({ error: 'Doğrulama başarısız' }, { status: 500 });
  }
}
