import { getResend } from '@/lib/resend';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from '@/lib/auth/password';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ error: 'Gerekli alanlar eksik.' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return Response.json({ error: 'Parola en az 6 karakter olmalı.' }, { status: 400 });
    }

    const emailLower = String(email).toLowerCase().trim();
    const supabase = getSupabase();
    if (!supabase) {
      return Response.json({ error: 'Sunucu yapılandırması eksik.' }, { status: 500 });
    }

    // Zaten kayıtlı mı?
    const { data: existing, error: selErr } = await supabase
      .from('clients')
      .select('id, password_hash')
      .eq('email', emailLower)
      .maybeSingle();

    if (selErr) {
      console.error('danisan-kaydol select error:', selErr);
      return Response.json({ error: 'Kayıt sırasında bir hata oluştu.' }, { status: 500 });
    }

    if (existing?.password_hash) {
      return Response.json(
        { error: 'Bu e-posta adresiyle zaten bir hesap oluşturulmuş.' },
        { status: 409 }
      );
    }

    const password_hash = await hashPassword(password);

    if (existing) {
      // Önceden (Google ile) oluşturulmuş hesaba parola ekle
      const { error: upErr } = await supabase
        .from('clients')
        .update({ password_hash, name: name || undefined })
        .eq('id', existing.id);
      if (upErr) {
        console.error('danisan-kaydol update error:', upErr);
        return Response.json({ error: 'Kayıt güncellenemedi.' }, { status: 500 });
      }
    } else {
      const { error: insErr } = await supabase.from('clients').insert([
        {
          name,
          email: emailLower,
          password_hash,
          status: 'aktif',
          registered_at: new Date().toISOString(),
        },
      ]);
      if (insErr) {
        // password_hash kolonu yoksa açık hata ver
        if (String(insErr.message || '').includes('password_hash')) {
          return Response.json(
            {
              error:
                'Veritabanı güncel değil. supabase-add-client-password.sql çalıştırılmalı.',
            },
            { status: 500 }
          );
        }
        console.error('danisan-kaydol insert error:', insErr);
        return Response.json({ error: 'Kayıt oluşturulamadı.' }, { status: 500 });
      }
    }

    // Hoş geldin maili (opsiyonel)
    const resend = getResend();
    if (resend) {
      try {
        await resend.emails.send({
          from: 'TerapistBul <onboarding@resend.dev>',
          to: emailLower,
          subject: 'Hesabınız Oluşturuldu — TerapistBul',
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
              <div style="background:linear-gradient(135deg,#0d9488,#0f766e);padding:32px;border-radius:16px 16px 0 0;text-align:center;">
                <h1 style="color:white;margin:0;font-size:22px;">Hoş Geldiniz!</h1>
              </div>
              <div style="background:white;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:32px;">
                <p style="color:#334155;font-size:15px;">Merhaba <strong>${name}</strong>,</p>
                <p style="color:#64748b;line-height:1.7;">TerapistBul hesabınız başarıyla oluşturuldu. Artık size en uygun terapisti bulabilir, randevu alabilirsiniz.</p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3654'}/terapistler"
                    style="background:#0d9488;color:white;font-weight:600;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:15px;">
                    Terapist Bulmaya Başla
                  </a>
                </div>
                <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #f1f5f9;padding-top:16px;">
                  TerapistBul
                </p>
              </div>
            </div>
          `,
        });
      } catch (e) {
        console.error('danisan-kaydol email send error:', e);
        // mail hatası kaydı bozmaz
      }
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('danisan-kaydol error:', err);
    return Response.json({ error: 'Kayıt sırasında bir hata oluştu.' }, { status: 500 });
  }
}
