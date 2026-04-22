import { getResend } from '@/lib/resend';

export async function POST(req) {
  try {
    const form = await req.json();
    const resend = getResend();
    if (!resend) {
      return Response.json({ error: 'Mail servisi yapılandırılmamış.' }, { status: 503 });
    }

    // 1) Admin bildirimi
    await resend.emails.send({
      from: 'TerapistBul <onboarding@resend.dev>',
      to: process.env.CONTACT_EMAIL || 'durmazatalay6@gmail.com',
      subject: `Yeni Terapist Başvurusu — ${form.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#0d9488;margin-bottom:4px;">Yeni Terapist Başvurusu</h2>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin-bottom:20px;"/>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <tr><td style="padding:7px 0;color:#64748b;font-size:13px;width:140px;">Ad Soyad</td><td style="font-weight:600;color:#1e293b;">${form.name || '—'}</td></tr>
            <tr><td style="padding:7px 0;color:#64748b;font-size:13px;">E-posta</td><td style="color:#1e293b;">${form.email || '—'}</td></tr>
            <tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Telefon</td><td style="color:#1e293b;">${form.phone || '—'}</td></tr>
            <tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Şehir</td><td style="color:#1e293b;">${form.city || '—'}</td></tr>
            <tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Ünvan</td><td style="color:#1e293b;">${form.title || '—'}</td></tr>
            <tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Deneyim</td><td style="color:#1e293b;">${form.experience || '—'} yıl</td></tr>
            <tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Eğitim</td><td style="color:#1e293b;">${form.education || '—'}</td></tr>
            <tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Seans Ücreti</td><td style="color:#1e293b;">${form.price ? '₺' + form.price : '—'}</td></tr>
            <tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Seans Modu</td><td style="color:#1e293b;">${(form.sessionMode || []).join(', ') || '—'}</td></tr>
            <tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Uzmanlıklar</td><td style="color:#1e293b;">${(form.specialties || []).join(', ') || '—'}</td></tr>
            <tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Yaklaşımlar</td><td style="color:#1e293b;">${(form.approaches || []).join(', ') || '—'}</td></tr>
          </table>
          ${form.about ? `<div style="background:#f8fafc;border-left:3px solid #0d9488;padding:14px 18px;border-radius:4px;margin-bottom:16px;"><p style="margin:0;color:#334155;font-size:14px;line-height:1.7;">${form.about}</p></div>` : ''}
          <p style="font-size:12px;color:#94a3b8;">TerapistBul terapist kayıt sistemi</p>
        </div>
      `,
    });

    // 2) Başvuru sahibine onay maili
    if (form.email) {
      await resend.emails.send({
        from: 'TerapistBul <onboarding@resend.dev>',
        to: form.email,
        subject: 'Başvurunuz Alındı — TerapistBul',
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#0d9488,#0f766e);padding:32px;border-radius:16px 16px 0 0;text-align:center;">
              <h1 style="color:white;margin:0;font-size:22px;">Başvurunuz Alındı! 🎉</h1>
            </div>
            <div style="background:white;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:32px;">
              <p style="color:#334155;font-size:15px;">Merhaba <strong>${form.name || 'değerli terapist'}</strong>,</p>
              <p style="color:#64748b;line-height:1.7;">Terapist başvurunuz başarıyla alındı. Ekibimiz belgelerinizi inceleyecek ve <strong>1-2 iş günü</strong> içinde size geri dönüş yapacaktır.</p>
              <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:20px;margin:24px 0;">
                <p style="margin:0 0 8px;font-weight:600;color:#0d9488;">Süreç hakkında:</p>
                <p style="margin:4px 0;color:#0f766e;font-size:14px;">✓ Başvurunuz inceleme kuyruğuna alındı</p>
                <p style="margin:4px 0;color:#0f766e;font-size:14px;">✓ YÖK diploma doğrulaması yapılacak</p>
                <p style="margin:4px 0;color:#0f766e;font-size:14px;">✓ Onay sonrası profiliniz yayına alınacak</p>
              </div>
              <p style="color:#64748b;font-size:13px;">Sorularınız için <a href="mailto:${process.env.CONTACT_EMAIL || 'durmazatalay6@gmail.com'}" style="color:#0d9488;">bize ulaşabilirsiniz</a>.</p>
              <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #f1f5f9;padding-top:16px;">TerapistBul · Türkiye'nin terapist platformu</p>
            </div>
          </div>
        `,
      });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('Register email error:', err);
    return Response.json({ error: 'E-posta gönderilemedi.' }, { status: 500 });
  }
}
