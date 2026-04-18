import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return Response.json({ error: 'Gerekli alanlar eksik.' }, { status: 400 });
    }

    await resend.emails.send({
      from: 'TerapistBul <onboarding@resend.dev>',
      to: process.env.CONTACT_EMAIL || 'info@terapistbul.com',
      replyTo: email,
      subject: `[İletişim Formu] ${subject || 'Genel Soru'} — ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d9488; margin-bottom: 4px;">Yeni İletişim Formu Mesajı</h2>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 100px;">Ad Soyad</td>
              <td style="padding: 8px 0; font-weight: 600; color: #1e293b;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px;">E-posta</td>
              <td style="padding: 8px 0; color: #1e293b;"><a href="mailto:${email}" style="color: #0d9488;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Konu</td>
              <td style="padding: 8px 0; color: #1e293b;">${subject || '—'}</td>
            </tr>
          </table>

          <div style="background: #f8fafc; border-left: 3px solid #0d9488; padding: 16px 20px; border-radius: 4px;">
            <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
          </div>

          <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">
            Bu mesaj TerapistBul iletişim formundan gönderildi. Yanıtlamak için doğrudan bu e-postayı yanıtlayabilirsiniz.
          </p>
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('Contact email error:', err);
    return Response.json({ error: 'E-posta gönderilemedi.' }, { status: 500 });
  }
}
