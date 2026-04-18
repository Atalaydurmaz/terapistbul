import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@/auth';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
    }

    const { name, email, phone, note, therapistName, therapistEmail, type, selectedDay, selectedHour } = await req.json();
    const isRandevu = type === 'randevu';

    const subject = isRandevu
      ? `Yeni Randevu Talebi — ${name} → ${therapistName}`
      : `Yeni Mesaj — ${name} → ${therapistName}`;

    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#0d9488;">${isRandevu ? '📅 Yeni Randevu Talebi' : '💬 Yeni Mesaj'}</h2>
        <p style="color:#64748b;">Terapist: <strong>${therapistName || '—'}</strong></p>
        <hr style="border:none;border-top:1px solid #e2e8f0;"/>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:7px 0;color:#64748b;font-size:13px;width:120px;">Ad Soyad</td><td style="font-weight:600;color:#1e293b;">${name}</td></tr>
          <tr><td style="padding:7px 0;color:#64748b;font-size:13px;">E-posta</td><td><a href="mailto:${email}" style="color:#0d9488;">${email}</a></td></tr>
          ${phone ? `<tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Telefon</td><td>${phone}</td></tr>` : ''}
          ${selectedDay ? `<tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Gün</td><td style="font-weight:600;color:#0d9488;">${selectedDay}</td></tr>` : ''}
          ${selectedHour ? `<tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Saat</td><td style="font-weight:600;color:#0d9488;">${selectedHour}</td></tr>` : ''}
        </table>
        <div style="background:#f8fafc;border-left:3px solid #0d9488;padding:14px 18px;border-radius:4px;margin-top:16px;">
          <p style="margin:0;color:#334155;font-size:14px;white-space:pre-wrap;">${note}</p>
        </div>
      </div>
    `;

    const recipients = [process.env.CONTACT_EMAIL || 'durmazatalay6@gmail.com'];
    if (therapistEmail && therapistEmail !== recipients[0] && !therapistEmail.endsWith('@terapistbul.com')) {
      recipients.push(therapistEmail);
    }

    await resend.emails.send({
      from: 'TerapistBul <onboarding@resend.dev>',
      to: recipients,
      replyTo: email,
      subject,
      html,
    });

    // Save to Supabase
    const supabase = createAdminClient();
    await supabase.from('appointments').insert([{
      name,
      email,
      phone: phone || null,
      note,
      therapist_name: therapistName,
      therapist_email: therapistEmail,
      type,
      selected_day: selectedDay || null,
      selected_hour: selectedHour || null,
      status: isRandevu ? 'bekliyor' : null,
    }]);

    return Response.json({ success: true });
  } catch (err) {
    console.error('Booking error:', err);
    return Response.json({ error: 'Gönderilemedi.' }, { status: 500 });
  }
}
