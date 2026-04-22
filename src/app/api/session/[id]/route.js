import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifySession, SESSION_COOKIES } from '@/lib/auth/session';
import { auth } from '@/auth';

function isValidUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
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

  return Response.json({
    id: apt.id,
    clientName: apt.name,
    therapistName: apt.therapist_name,
    selectedDay: apt.selected_day,
    selectedHour: apt.selected_hour,
    roomUrl: apt.daily_room_url,
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
