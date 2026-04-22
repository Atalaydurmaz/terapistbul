import { getResend } from '@/lib/resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@/auth';
import { fmtDateTr } from '@/lib/date';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, note, therapistName, therapistEmail, type, selectedDay, selectedHour } = body;
    // Always trust the session email over what the form sent — this guarantees
    // /hesabim can later join the user to their own appointments via `.ilike('email', userEmail)`.
    const sessionEmail = (session.user?.email || '').trim().toLowerCase();
    const email = sessionEmail || (body.email ? String(body.email).trim().toLowerCase() : '');
    const isRandevu = type === 'randevu';

    const adminSubject = isRandevu
      ? `Yeni Randevu Talebi — ${name} → ${therapistName}`
      : `Yeni Mesaj — ${name} → ${therapistName}`;

    const adminHtml = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#0d9488;">${isRandevu ? '📅 Yeni Randevu Talebi' : '💬 Yeni Mesaj'}</h2>
        <p style="color:#64748b;">Terapist: <strong>${therapistName || '—'}</strong></p>
        <hr style="border:none;border-top:1px solid #e2e8f0;"/>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:7px 0;color:#64748b;font-size:13px;width:120px;">Ad Soyad</td><td style="font-weight:600;color:#1e293b;">${name}</td></tr>
          <tr><td style="padding:7px 0;color:#64748b;font-size:13px;">E-posta</td><td><a href="mailto:${email}" style="color:#0d9488;">${email}</a></td></tr>
          ${phone ? `<tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Telefon</td><td>${phone}</td></tr>` : ''}
          ${selectedDay ? `<tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Gün</td><td style="font-weight:600;color:#0d9488;">${fmtDateTr(selectedDay)}</td></tr>` : ''}
          ${selectedHour ? `<tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Saat</td><td style="font-weight:600;color:#0d9488;">${selectedHour}</td></tr>` : ''}
        </table>
        <div style="background:#f8fafc;border-left:3px solid #0d9488;padding:14px 18px;border-radius:4px;margin-top:16px;">
          <p style="margin:0;color:#334155;font-size:14px;white-space:pre-wrap;">${note}</p>
        </div>
      </div>
    `;

    // 1) Admin + terapist e-postası
    const adminRecipients = [process.env.CONTACT_EMAIL || 'durmazatalay6@gmail.com'];
    if (therapistEmail && therapistEmail !== adminRecipients[0] && !therapistEmail.endsWith('@terapistbul.com')) {
      adminRecipients.push(therapistEmail);
    }

    const resend = getResend();
    if (resend) {
      try {
        await resend.emails.send({
          from: 'TerapistBul <onboarding@resend.dev>',
          to: adminRecipients,
          replyTo: email,
          subject: adminSubject,
          html: adminHtml,
        });
      } catch (e) {
        console.error('Admin booking e-postası gönderilemedi:', e);
      }
    }

    // 2) Danışana ayrı onay e-postası — talep alındı bildirimi
    if (email) {
      const clientSubject = isRandevu
        ? `✉️ Randevu Talebiniz Alındı — ${therapistName}`
        : `✉️ Mesajınız Alındı — ${therapistName}`;

      const clientHtml = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#0d9488;">${isRandevu ? '📅 Randevu Talebiniz Alındı' : '💬 Mesajınız Alındı'}</h2>
          <p>Sayın <strong>${name}</strong>,</p>
          <p><strong>${therapistName}</strong> ${isRandevu ? 'ile randevu talebiniz' : 'adlı terapiste mesajınız'} tarafımıza ulaştı.</p>
          ${isRandevu ? `<p>📅 <strong>${selectedDay ? fmtDateTr(selectedDay) : '—'}</strong> ${selectedHour ? `saat <strong>${selectedHour}</strong>` : ''}</p>` : ''}
          <p>Terapist kısa süre içinde ${isRandevu ? 'randevunuzu değerlendirip onaylayacaktır' : 'size dönüş yapacaktır'}. Onaylandığında ${isRandevu ? 'görüşme linkini' : 'yanıtı'} e-posta ile alacaksınız.</p>
          <div style="background:#f8fafc;border-left:3px solid #0d9488;padding:14px 18px;border-radius:4px;margin:16px 0;">
            <p style="margin:0;color:#334155;font-size:14px;white-space:pre-wrap;">${note}</p>
          </div>
          <p style="color:#64748b;font-size:13px;">Durumu <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3654'}/hesabim" style="color:#0d9488;">hesabım</a> sayfasından takip edebilirsiniz.</p>
        </div>
      `;

      if (resend) {
        try {
          await resend.emails.send({
            from: 'TerapistBul <onboarding@resend.dev>',
            to: [email],
            subject: clientSubject,
            html: clientHtml,
          });
        } catch (e) {
          console.error('Danışan e-postası gönderilemedi:', e);
        }
      }
    }

    const supabase = createAdminClient();
    await supabase.from('appointments').insert([{
      name,
      email: email || null,
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
