import { createAdminClient } from '@/lib/supabase/admin';
import { getResend } from '@/lib/resend';
import { fmtDateTr } from '@/lib/date';

const DAILY_API = 'https://api.daily.co/v1';
const DAILY_KEY = process.env.DAILY_API_KEY;
const DAILY_DOMAIN = process.env.DAILY_DOMAIN || 'terapistbul';

function isValidUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function createDailyRoom(roomName, selectedDay) {
  // Room expires at selected_day + 24h, or 7 days from now if no day given.
  // Earlier code used selected_day 00:00 + 1h which meant a session scheduled
  // for e.g. 15:00 got a room that expired at 01:00 the same day — before the
  // session even started. Widen generously; worst case Daily purges unused rooms.
  let exp;
  if (selectedDay) {
    exp = Math.floor(new Date(selectedDay).getTime() / 1000) + 24 * 3600;
  } else {
    exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
  }
  const body = {
    name: roomName,
    privacy: 'public',
    properties: {
      max_participants: 2,
      enable_chat: true,
      enable_screenshare: false,
      lang: 'tr',
      exp,
    },
  };
  const res = await fetch(`${DAILY_API}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DAILY_KEY}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    // If the room already exists, fetch it instead of erroring.
    if (data?.info?.includes('already exists') || data?.error === 'invalid-request-error') {
      const getRes = await fetch(`${DAILY_API}/rooms/${roomName}`, {
        headers: { Authorization: `Bearer ${DAILY_KEY}` },
      });
      const existing = await getRes.json();
      if (getRes.ok && existing.url) return existing;
    }
    throw new Error(data.error || data.info || 'Daily.co room oluşturulamadı');
  }
  return data;
}

export async function PATCH(req, { params }) {
  const supabase = createAdminClient();
  const { id } = await params;

  if (!isValidUuid(id)) {
    return Response.json({ error: 'Geçersiz randevu ID formatı' }, { status: 400 });
  }

  const body = await req.json();
  const { status, therapist_rating, session_notes } = body;

  if (therapist_rating !== undefined) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ therapist_rating })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) { console.error(error); return Response.json({ error: 'Sunucu hatası.' }, { status: 500 }); }
    if (!data) return Response.json({ error: 'Randevu bulunamadı' }, { status: 404 });
    return Response.json(data);
  }

  if (session_notes !== undefined) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ session_notes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) { console.error(error); return Response.json({ error: 'Sunucu hatası.' }, { status: 500 }); }
    if (!data) return Response.json({ error: 'Randevu bulunamadı' }, { status: 404 });
    return Response.json(data);
  }

  const { data, error } = await supabase
    .from('appointments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) { console.error(error); return Response.json({ error: 'Sunucu hatası.' }, { status: 500 }); }
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

      const resend = getResend();
      if (resend) {
        await resend.emails.send({
          from: 'TerapistBul <onboarding@resend.dev>',
          to: recipients,
          subject: `✅ Randevunuz Onaylandı — ${data.therapist_name}`,
          html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
            <h2 style="color:#0d9488;">✅ Randevunuz Onaylandı</h2>
            <p>Sayın <strong>${data.name}</strong>,</p>
            <p><strong>${data.therapist_name}</strong> ile randevunuz onaylandı.</p>
            <p>📅 <strong>${data.selected_day ? fmtDateTr(data.selected_day) : '—'}</strong> saat <strong>${data.selected_hour || '—'}</strong></p>
            ${videoLink}
            <p style="color:#64748b;font-size:13px;">Görüşme saatinde linke tıklayarak odaya girebilirsiniz.</p>
          </div>`,
        });
      }
    } catch (e) { console.error('Email error:', e); }
  }

  return Response.json(data);
}
