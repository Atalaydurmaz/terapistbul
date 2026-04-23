import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifySession, SESSION_COOKIES } from '@/lib/auth/session';
import { auth } from '@/auth';

const DAILY_API = 'https://api.daily.co/v1';
const DAILY_KEY = process.env.DAILY_API_KEY;

function isValidUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

// Lazy-create a Daily.co room for an appointment that was approved but never
// got one (e.g. DAILY_API_KEY was unset at approval time, or the call errored
// and was swallowed). Idempotent: if another request races and a URL is
// already stored, we return whatever's there on the next read.
async function ensureDailyRoom(supabase, apt) {
  if (apt.daily_room_url) return apt.daily_room_url;
  if (!DAILY_KEY) return null;
  try {
    const roomName = `seans-${String(apt.id).replace(/-/g, '').slice(0, 12)}`;
    // Give the room a generous expiry so legacy rows with stale selected_day
    // values don't get a room that's already past-due. 7 days from now.
    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
    const res = await fetch(`${DAILY_API}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DAILY_KEY}` },
      body: JSON.stringify({
        name: roomName,
        privacy: 'public',
        properties: {
          max_participants: 2,
          enable_chat: true,
          enable_screenshare: false,
          lang: 'tr',
          exp,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      // "already-exists" → fetch the existing one
      if (data?.info?.includes('already exists') || data?.error === 'invalid-request-error') {
        const getRes = await fetch(`${DAILY_API}/rooms/${roomName}`, {
          headers: { Authorization: `Bearer ${DAILY_KEY}` },
        });
        const existing = await getRes.json();
        if (getRes.ok && existing.url) {
          await supabase
            .from('appointments')
            .update({ daily_room_url: existing.url, daily_room_name: existing.name })
            .eq('id', apt.id);
          return existing.url;
        }
      }
      console.error('ensureDailyRoom create error:', data);
      return null;
    }
    await supabase
      .from('appointments')
      .update({ daily_room_url: data.url, daily_room_name: data.name })
      .eq('id', apt.id);
    return data.url;
  } catch (e) {
    console.error('ensureDailyRoom fatal:', e);
    return null;
  }
}

/**
 * Returns { role: 'therapist'|'client'|null, email, panelId }
 */
async function getViewer() {
  // 1) Panel (therapist) cookie
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIES.PANEL)?.value;
    if (token) {
      const payload = await verifySession(token);
      if (payload?.role === 'therapist') {
        return { role: 'therapist', email: payload.email?.toLowerCase() || null, panelId: payload.panelId || payload.id };
      }
    }
  } catch {}

  // 2) NextAuth (client) session
  try {
    const session = await auth();
    if (session?.user?.email) {
      return { role: 'client', email: session.user.email.toLowerCase(), panelId: null };
    }
  } catch {}

  return { role: null, email: null, panelId: null };
}

async function fetchAppointment(id) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function canViewAppointment(viewer, apt) {
  if (!viewer.role || !apt) return false;
  if (viewer.role === 'client') {
    return apt.email && apt.email.toLowerCase() === viewer.email;
  }
  if (viewer.role === 'therapist') {
    // Terapist: therapist_email eşleşsin veya panel oturumu varsa tümüne erişsin
    if (!apt.therapist_email) return true;
    if (!viewer.email) return true;
    return apt.therapist_email.toLowerCase() === viewer.email;
  }
  return false;
}

export async function GET(req, { params }) {
  const { id } = await params;
  if (!isValidUuid(id)) return Response.json({ error: 'Geçersiz ID' }, { status: 400 });

  const viewer = await getViewer();
  if (!viewer.role) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

  let apt;
  try {
    apt = await fetchAppointment(id);
  } catch (e) {
    console.error('session route error:', e);
    return Response.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
  if (!apt) return Response.json({ error: 'Randevu bulunamadı' }, { status: 404 });
  if (!canViewAppointment(viewer, apt)) return Response.json({ error: 'Erişim reddedildi' }, { status: 403 });

  // Only provision a Daily room once the appointment is approved. Clients
  // shouldn't be able to trigger room creation on a bekliyor/iptal row.
  // DEV bypass: local'de terapist "Test Başlat" ile onaysız odaya girebilir
  // — NODE_ENV production iken bu blok geçmez, gerçek kullanıcı etkilenmez.
  const isDev = process.env.NODE_ENV !== 'production';
  let roomUrl = apt.daily_room_url;
  if (!roomUrl && (apt.status === 'onayli' || (isDev && viewer.role === 'therapist'))) {
    const supabase = createAdminClient();
    roomUrl = await ensureDailyRoom(supabase, apt);
  }

  return Response.json({
    id: apt.id,
    clientName: apt.name,
    therapistName: apt.therapist_name,
    selectedDay: apt.selected_day,
    selectedHour: apt.selected_hour,
    roomUrl,
    status: apt.status,
    viewerRole: viewer.role,
  });
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  if (!isValidUuid(id)) return Response.json({ error: 'Geçersiz ID' }, { status: 400 });

  const viewer = await getViewer();
  if (!viewer.role) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { action } = body;

  let apt;
  try {
    apt = await fetchAppointment(id);
  } catch (e) {
    console.error('session route error:', e);
    return Response.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
  if (!apt) return Response.json({ error: 'Randevu bulunamadı' }, { status: 404 });
  if (!canViewAppointment(viewer, apt)) return Response.json({ error: 'Erişim reddedildi' }, { status: 403 });

  const supabase = createAdminClient();

  if (action === 'end') {
    // Sadece terapist seansı bitirebilir
    if (viewer.role !== 'therapist') {
      return Response.json({ error: 'Sadece terapist seansı bitirebilir' }, { status: 403 });
    }
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'tamamlandi', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) {
      console.error('session end error:', error);
      return Response.json({ error: 'Seans bitirilemedi.' }, { status: 500 });
    }
    return Response.json({ ok: true, apt: data });
  }

  return Response.json({ error: 'Bilinmeyen action' }, { status: 400 });
}
