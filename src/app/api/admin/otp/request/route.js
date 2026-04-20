import { Resend } from 'resend';
import { signSession, sessionCookieOptions } from '@/lib/auth/session';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const OTP_COOKIE = 'tb_admin_otp';
const OTP_MAX_AGE = 600; // 10 dakika

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const normalized = String(email || '').trim().toLowerCase();

    if (!normalized || !password) {
      return Response.json({ error: 'E-posta ve şifre gerekli' }, { status: 400 });
    }

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return Response.json({ error: 'Sunucu yapılandırması eksik' }, { status: 500 });
    }

    if (normalized !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return Response.json({ error: 'Geçersiz e-posta veya şifre' }, { status: 401 });
    }

    if (!process.env.RESEND_API_KEY) {
      return Response.json({ error: 'Mail servisi yapılandırılmamış' }, { status: 500 });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const token = await signSession({ purpose: 'admin_otp', email: normalized, code });

    // Resend free tier'da onboarding@resend.dev sadece hesap sahibinin
    // e-postasına gönderebiliyor. ADMIN_OTP_TO ile yönlendirme yapılabilir.
    const deliverTo =
      process.env.ADMIN_OTP_TO ||
      process.env.CONTACT_EMAIL ||
      'durmazatalay6@gmail.com';

    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: 'TerapistBul <onboarding@resend.dev>',
      to: deliverTo,
      subject: `TerapistBul Admin Giriş Kodu: ${code}`,
      // Gerçek admin e-postası farklıysa Reply-To ile yönlendir
      reply_to: normalized !== deliverTo ? normalized : undefined,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#f8fafc;padding:32px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:20px;">
            <img src="https://terapistibul.com/logo.svg" alt="TerapistBul" width="40" height="40" />
            <h2 style="color:#0d9488;margin:8px 0 0;font-size:18px;">TerapistBul Admin</h2>
          </div>
          <div style="background:#fff;border-radius:12px;padding:28px;border:1px solid #e2e8f0;text-align:center;">
            <p style="color:#475569;font-size:14px;margin:0 0 16px;">Admin paneline giriş kodunuz:</p>
            <div style="font-size:36px;letter-spacing:10px;font-weight:700;color:#0d9488;padding:16px;background:#f0fdfa;border-radius:12px;margin:0 0 16px;font-family:monospace;">${code}</div>
            <p style="color:#64748b;font-size:13px;margin:0;">Bu kod 10 dakika geçerlidir.</p>
            <p style="color:#94a3b8;font-size:12px;margin:16px 0 0;">Eğer bu girişi siz başlatmadıysanız bu e-postayı görmezden gelebilirsiniz.</p>
          </div>
          <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:20px;">
            TerapistBul · Güvenli Giriş
          </p>
        </div>
      `,
    });

    if (result?.error) {
      console.error('admin otp resend error:', result.error);
      return Response.json({ error: 'Mail servisi reddetti. Daha sonra tekrar deneyin.' }, { status: 500 });
    }
    console.log('admin otp sent:', { to: deliverTo, id: result?.data?.id });

    const opts = sessionCookieOptions();
    const parts = [
      `${OTP_COOKIE}=${token}`,
      `Path=/`,
      `Max-Age=${OTP_MAX_AGE}`,
      `SameSite=Lax`,
      'HttpOnly',
    ];
    if (opts.secure) parts.push('Secure');

    const res = Response.json({ success: true });
    res.headers.append('Set-Cookie', parts.join('; '));
    return res;
  } catch (err) {
    console.error('admin otp request error:', err?.message || err);
    return Response.json({ error: 'Kod gönderilemedi. Tekrar deneyin.' }, { status: 500 });
  }
}
