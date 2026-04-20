import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { applicantName, applicantEmail, status } = await req.json();

    const isApproved = status === 'approved';

    const subject = isApproved
      ? `🎉 Başvurunuz Onaylandı — TerapistBul`
      : `TerapistBul Başvuru Sonucu`;

    const html = isApproved
      ? `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:8px;">
              <img src="https://terapistibul.com/logo.svg" alt="TerapistBul" width="32" height="32" style="border-radius:50%;" />
              <span style="font-size:18px;font-weight:700;color:#0d9488;">TerapistBul</span>
            </div>
          </div>
          <div style="background:#fff;border-radius:12px;padding:28px;border:1px solid #e2e8f0;">
            <h2 style="color:#0d9488;margin:0 0 8px;">🎉 Tebrikler, ${applicantName}!</h2>
            <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
              TerapistBul platformuna başvurunuz <strong style="color:#0d9488;">onaylandı</strong>.
              Artık platformumuzda yer alabilir ve danışanlarla buluşabilirsiniz.
            </p>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:20px;">
              <p style="margin:0;color:#166534;font-size:13px;line-height:1.6;">
                ✅ Profiliniz aktif olarak yayında<br/>
                ✅ Danışanlar sizi artık bulabilir<br/>
                ✅ Randevu almaya başlayabilirsiniz
              </p>
            </div>
            <a href="https://terapistibul.com/panel" style="display:inline-block;background:#0d9488;color:#fff;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px;">
              Panele Giriş Yap →
            </a>
          </div>
          <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:20px;">
            TerapistBul · Türkiye'nin terapist eşleştirme platformu
          </p>
        </div>
      `
      : `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:8px;">
              <img src="https://terapistibul.com/logo.svg" alt="TerapistBul" width="32" height="32" style="border-radius:50%;" />
              <span style="font-size:18px;font-weight:700;color:#0d9488;">TerapistBul</span>
            </div>
          </div>
          <div style="background:#fff;border-radius:12px;padding:28px;border:1px solid #e2e8f0;">
            <h2 style="color:#334155;margin:0 0 8px;">Sayın ${applicantName},</h2>
            <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
              TerapistBul'a yapmış olduğunuz başvuruyu inceledik. Üzgünüz,
              şu aşamada başvurunuzu onaylayamıyoruz.
            </p>
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin-bottom:20px;">
              <p style="margin:0;color:#991b1b;font-size:13px;line-height:1.6;">
                Bu karar, sunulan belgeler ve platform kriterleri doğrultusunda verilmiştir.
                Eksik belgelerinizi tamamlayarak tekrar başvurabilirsiniz.
              </p>
            </div>
            <p style="color:#64748b;font-size:13px;margin:0 0 20px;">
              Sorularınız için <a href="mailto:destek@terapistibul.com" style="color:#0d9488;">destek@terapistibul.com</a> adresine ulaşabilirsiniz.
            </p>
            <a href="https://terapistibul.com/uye-ol" style="display:inline-block;background:#64748b;color:#fff;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px;">
              Tekrar Başvur →
            </a>
          </div>
          <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:20px;">
            TerapistBul · Türkiye'nin terapist eşleştirme platformu
          </p>
        </div>
      `;

    // Her zaman başvuranın emailine gönder (birincil)
    // Eğer aynı emailse tek seferlik gönder
    const adminEmail = process.env.CONTACT_EMAIL || 'durmazatalay6@gmail.com';
    const toEmail = applicantEmail || adminEmail;

    const result = await resend.emails.send({
      from: 'TerapistBul <onboarding@resend.dev>',
      to: toEmail,
      subject,
      html,
    });

    console.log('Application status email sent:', result);
    return Response.json({ success: true, result });
  } catch (err) {
    console.error('Application status email error:', err?.message || err);
    return Response.json({ error: err?.message || 'Mail gönderilemedi.' }, { status: 500 });
  }
}
