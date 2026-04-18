import { Resend } from 'resend';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);
const USERS_FILE = join(process.cwd(), 'src', 'data', 'registered-users.json');

function getRegisteredEmails() {
  try {
    return JSON.parse(readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveUser(name, email, password) {
  const users = getRegisteredEmails();
  users.push({ name, email: email.toLowerCase(), password });
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email) {
      return Response.json({ error: 'Gerekli alanlar eksik.' }, { status: 400 });
    }

    const registered = getRegisteredEmails();
    if (registered.some((u) => (typeof u === 'string' ? u : u.email) === email.toLowerCase())) {
      return Response.json({ error: 'Bu e-posta adresiyle zaten bir hesap oluşturulmuş.' }, { status: 409 });
    }

    saveUser(name, email, password);

    // Danışana hoş geldin maili
    await resend.emails.send({
      from: 'TerapistBul <onboarding@resend.dev>',
      to: email,
      subject: 'Hesabınız Oluşturuldu — TerapistBul',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#0d9488,#0f766e);padding:32px;border-radius:16px 16px 0 0;text-align:center;">
            <h1 style="color:white;margin:0;font-size:22px;">Hoş Geldiniz! 🎉</h1>
          </div>
          <div style="background:white;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:32px;">
            <p style="color:#334155;font-size:15px;">Merhaba <strong>${name}</strong>,</p>
            <p style="color:#64748b;line-height:1.7;">TerapistBul hesabınız başarıyla oluşturuldu. Artık size en uygun terapisti bulabilir, randevu alabilirsiniz.</p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3456'}/terapistler"
                style="background:#0d9488;color:white;font-weight:600;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:15px;">
                Terapist Bulmaya Başla
              </a>
            </div>
            <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:18px 20px;margin:20px 0;">
              <p style="margin:0 0 8px;font-weight:600;color:#0d9488;font-size:14px;">Neler yapabilirsiniz?</p>
              <p style="margin:4px 0;color:#0f766e;font-size:13px;">✓ Uzmanlık ve yaklaşıma göre terapist arayın</p>
              <p style="margin:4px 0;color:#0f766e;font-size:13px;">✓ Online veya yüz yüze seans seçin</p>
              <p style="margin:4px 0;color:#0f766e;font-size:13px;">✓ AI eşleştirme ile size uygun terapisti bulun</p>
            </div>
            <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #f1f5f9;padding-top:16px;">
              TerapistBul · Sorularınız için <a href="mailto:${process.env.CONTACT_EMAIL || 'durmazatalay6@gmail.com'}" style="color:#0d9488;">bize ulaşın</a>
            </p>
          </div>
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('Danisan kaydol email error:', err);
    return Response.json({ error: 'E-posta gönderilemedi.' }, { status: 500 });
  }
}
