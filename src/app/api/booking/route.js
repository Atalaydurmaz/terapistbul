import { getResend } from '@/lib/resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@/auth';
import { fmtDateTr } from '@/lib/date';
import { renderEmail, infoRow } from '@/lib/email-template';

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

    const adminHtml = renderEmail({
      title: isRandevu ? 'Yeni Randevu Talebi' : 'Yeni Mesaj',
      preheader: `${name} → ${therapistName}`,
      accentIcon: isRandevu ? '📅' : '💬',
      bodyHtml: `
        <p style="margin:0 0 8px 0;color:#64748b;font-size:14px;">Terapist</p>
        <p style="margin:0 0 16px 0;font-size:16px;font-weight:600;">${therapistName || '—'}</p>
        ${infoRow('👤', 'Ad Soyad', name)}
        ${infoRow('✉️', 'E-posta', `<a href="mailto:${email}" style="color:#0d9488;text-decoration:none;">${email}</a>`)}
        ${phone ? infoRow('📞', 'Telefon', phone) : ''}
        ${selectedDay ? infoRow('📅', 'Gün', fmtDateTr(selectedDay)) : ''}
        ${selectedHour ? infoRow('🕒', 'Saat', selectedHour) : ''}
        <div style="margin-top:20px;padding:16px 18px;background:#f0fdfa;border-left:3px solid #0d9488;border-radius:8px;">
          <p style="margin:0;color:#134e4a;font-size:14px;white-space:pre-wrap;line-height:1.5;">${note}</p>
        </div>
      `,
      footerNote: 'Bu e-posta TerapistBul platformu üzerinden otomatik gönderildi.',
    });

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
        ? `Randevu Talebiniz Alındı — ${therapistName}`
        : `Mesajınız Alındı — ${therapistName}`;

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://terapistibul.com';
      const clientHtml = renderEmail({
        title: isRandevu ? 'Randevu Talebiniz Alındı' : 'Mesajınız Alındı',
        preheader: isRandevu
          ? `${therapistName} ile ${selectedDay ? fmtDateTr(selectedDay) : ''} ${selectedHour || ''} randevunuz değerlendiriliyor.`
          : `${therapistName} size kısa süre içinde dönüş yapacak.`,
        accentIcon: isRandevu ? '📅' : '💬',
        bodyHtml: `
          <p style="margin:0 0 12px 0;">Sayın <strong>${name}</strong>,</p>
          <p style="margin:0 0 20px 0;">
            <strong>${therapistName}</strong>
            ${isRandevu ? ' ile randevu talebiniz' : ' adlı terapiste mesajınız'}
            tarafımıza ulaştı.
          </p>
          ${isRandevu && selectedDay ? infoRow('📅', 'Tarih', fmtDateTr(selectedDay)) : ''}
          ${isRandevu && selectedHour ? infoRow('🕒', 'Saat', selectedHour) : ''}
          <p style="margin:20px 0 0 0;color:#64748b;font-size:14px;">
            Terapist kısa süre içinde
            ${isRandevu ? 'randevunuzu değerlendirip onaylayacaktır' : 'size dönüş yapacaktır'}.
            ${isRandevu ? 'Onaylandığında görüşme linkini hem e-posta ile alacak hem de hesabınızda göreceksiniz.' : ''}
          </p>
          ${note ? `
          <div style="margin-top:20px;padding:16px 18px;background:#f0fdfa;border-left:3px solid #0d9488;border-radius:8px;">
            <p style="margin:0 0 6px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Talebiniz</p>
            <p style="margin:0;color:#134e4a;font-size:14px;white-space:pre-wrap;line-height:1.5;">${note}</p>
          </div>` : ''}
        `,
        ctaLabel: 'Hesabımda Görüntüle',
        ctaUrl: `${appUrl}/hesabim?tab=randevular`,
        footerNote: 'Bu e-postayı TerapistBul üzerinden aldığınız için teşekkür ederiz.',
      });

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
