import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const DAILY_API = 'https://api.daily.co/v1';
const DAILY_KEY = process.env.DAILY_API_KEY;
const DAILY_DOMAIN = process.env.DAILY_DOMAIN || 'terapistbul';

function isValidUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function createDailyRoom(roomName, expiresAt) {
  const body = {
    name: roomName,
    privacy: 'public',
    properties: {
      max_participants: 2,
      enable_chat: true,
      enable_screenshare: false,
      lang: 'tr',
    },
  };
  if (expiresAt) {
    body.properties.exp = Math.floor(new Date(expiresAt).getTime() / 1000) + 3600;
  }
  const res = await fetch(`${DAILY_API}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DAILY_KEY}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Daily.co room oluşturulamadı');
  return data;
}

export async function PATCH(req, { params }) {
  const supabase = createAdminClient();
  const { id } = await params;

  if (!isValidUuid(id)) {
    return Response.json({ error: 'Geçersiz randevu ID formatı' }, { status: 400 });
  }

  const body = await req.json();
  const { status, therapist_rating } = body;

  if (therapist_rating !== undefined) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ therapist_rating })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    if (!data) return Response.json({ error: 'Randevu bulunamadı' }, { status: 404 });
    return Response.json(data);
  }

  const { data, error } = await supabase
    .from('appointments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: 'Randevu bulunamadı' }, { status: 404 });

  if (status === 'onayli') {
    try {
      const roomName = `seans-${id.replace(/-/g, '').slice(0, 12)}`;
      const room = await createDailyRoom(roomName, data.selected_day);
      const roomUrl = room.url;

      await supabase
        .from('appointments')
        .update({ daily_room_url: roomUrl, daily_room_name: room.name })
        .eq('id', id);

      data.daily_room_url = roomUrl;
      data.daily_room_name = room.name;
    } catch (e) {
      console.error('Daily.co room error:', e);
    }
  }

  if (status === 'onayli' && data.email) {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || 'http://localhost:3654';
      const gorusmeUrl = data.daily_room_url
        ? `${appUrl}/gorusme?room=${encodeURIComponent(data.daily_room_url)}&terapist=${encodeURIComponent(data.therapist_name || '')}&name=${encodeURIComponent(data.name || '')}&id=${id}`
        : null;
      const videoLink = gorusmeUrl
        ? `<p>🎥 <strong>Online Görüşme Linki:</strong> <a href="${gorusmeUrl}" style="color:#0d9488;">${gorusmeUrl}</a></p><p style="color:#64748b;font-size:12px;">Bu link sadece size özeldir, başkasıyla paylaşmayın.</p>`
        : '';

      const recipients = [data.email];
      if (process.env.CONTACT_EMAIL && process.env.CONTACT_EMAIL !== data.email) {
        recipients.push(process.env.CONTACT_EMAIL);
      }

      await resend.emails.send({
        from: 'TerapistBul <onboarding@resend.dev>',
        to: recipients,
        subject: `✅ Randevunuz Onaylandı — ${data.therapist_name}`,
        html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#0d9488;">✅ Randevunuz Onaylandı</h2>
          <p>Sayın <strong>${data.name}</strong>,</p>
          <p><strong>${data.therapist_name}</strong> ile randevunuz onaylandı.</p>
          <p>📅 <strong>${data.selected_day || '—'}</strong> saat <strong>${data.selected_hour || '—'}</strong></p>
          ${videoLink}
          <p style="color:#64748b;font-size:13px;">Görüşme saatinde linke tıklayarak odaya girebilirsiniz.</p>
        </div>`,
      });
    } catch (e) { console.error('Email error:', e); }
  }

  return Response.json(data);
}
