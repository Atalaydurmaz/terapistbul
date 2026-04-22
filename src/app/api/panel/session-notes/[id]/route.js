import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifySession, SESSION_COOKIES } from '@/lib/auth/session';

/**
 * /api/panel/session-notes/[id]
 * id = appointmentId (UUID).
 *
 * GET   — o randevuya ait (sadece kendi) notları listeler
 * PATCH — { raw_text?, ai_summary?, status? ('draft'|'final') } günceller
 * POST  — yeni manuel not oluşturur (AI olmadan)
 *
 * Sadece panel cookie'si olan ve randevunun sahibi olan terapist erişebilir.
 */

function isUuid(s) {
  return typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

async function getTherapistViewer() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIES.PANEL)?.value;
  if (!token) return null;
  const payload = await verifySession(token).catch(() => null);
  if (!payload || payload.role !== 'therapist') return null;
  return {
    email: payload.email?.toLowerCase() || null,
    panelId: payload.panelId || payload.id || null,
  };
}

async function assertOwner(appointmentId, viewer) {
  const supabase = createAdminClient();
  const { data: apt } = await supabase
    .from('appointments')
    .select('id, therapist_email')
    .eq('id', appointmentId)
    .maybeSingle();
  if (!apt) return { ok: false, status: 404, error: 'Randevu bulunamadı' };
  if (apt.therapist_email && viewer.email && apt.therapist_email.toLowerCase() !== viewer.email) {
    return { ok: false, status: 403, error: 'Yetkisiz' };
  }
  return { ok: true, supabase };
}

function therapistRowId(viewer) {
  return viewer.panelId || viewer.email || 'unknown';
}

export async function GET(_req, { params }) {
  const viewer = await getTherapistViewer();
  if (!viewer) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

  const { id } = await params;
  if (!isUuid(id)) return Response.json({ error: 'Geçersiz ID' }, { status: 400 });

  const check = await assertOwner(id, viewer);
  if (!check.ok) return Response.json({ error: check.error }, { status: check.status });

  const { data, error } = await check.supabase
    .from('session_notes')
    .select('id, raw_text, ai_summary, client_summary, shared_with_client, shared_at, status, model, created_at, updated_at')
    .eq('appointment_id', id)
    .eq('therapist_id', therapistRowId(viewer))
    .order('updated_at', { ascending: false });

  if (error) { console.error(error); return Response.json({ error: 'Sunucu hatası.' }, { status: 500 }); }
  return Response.json(data || []);
}

export async function PATCH(req, { params }) {
  const viewer = await getTherapistViewer();
  if (!viewer) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

  const { id } = await params;
  if (!isUuid(id)) return Response.json({ error: 'Geçersiz ID' }, { status: 400 });

  const check = await assertOwner(id, viewer);
  if (!check.ok) return Response.json({ error: check.error }, { status: check.status });

  const body = await req.json().catch(() => ({}));
  const updates = {};
  if (typeof body.raw_text === 'string') updates.raw_text = body.raw_text;
  if (typeof body.ai_summary === 'string') updates.ai_summary = body.ai_summary;
  if (typeof body.client_summary === 'string') updates.client_summary = body.client_summary;
  if (body.status === 'draft' || body.status === 'final') updates.status = body.status;
  if (typeof body.shared_with_client === 'boolean') {
    updates.shared_with_client = body.shared_with_client;
    updates.shared_at = body.shared_with_client ? new Date().toISOString() : null;
  }
  if (!Object.keys(updates).length) {
    return Response.json({ error: 'Güncellenecek alan yok' }, { status: 400 });
  }
  updates.updated_at = new Date().toISOString();

  // body.noteId varsa sadece o satırı; yoksa bu randevu+terapistin son draft satırını güncelle
  let target = body.noteId;
  if (!target) {
    const { data: draft } = await check.supabase
      .from('session_notes')
      .select('id')
      .eq('appointment_id', id)
      .eq('therapist_id', therapistRowId(viewer))
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    target = draft?.id;
  }

  if (!target) {
    // Yoksa yeni satır oluştur
    const { data: inserted, error: insErr } = await check.supabase
      .from('session_notes')
      .insert([{
        appointment_id: id,
        therapist_id: therapistRowId(viewer),
        therapist_email: viewer.email || null,
        raw_text: updates.raw_text || null,
        ai_summary: updates.ai_summary || null,
        client_summary: updates.client_summary || null,
        shared_with_client: updates.shared_with_client || false,
        shared_at: updates.shared_at || null,
        status: updates.status || 'draft',
      }])
      .select()
      .single();
    if (insErr) return Response.json({ error: insErr.message }, { status: 500 });
    return Response.json(inserted);
  }

  const { data, error } = await check.supabase
    .from('session_notes')
    .update(updates)
    .eq('id', target)
    .eq('therapist_id', therapistRowId(viewer))
    .select()
    .maybeSingle();
  if (error) { console.error(error); return Response.json({ error: 'Sunucu hatası.' }, { status: 500 }); }
  return Response.json(data);
}

export async function POST(req, { params }) {
  const viewer = await getTherapistViewer();
  if (!viewer) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

  const { id } = await params;
  if (!isUuid(id)) return Response.json({ error: 'Geçersiz ID' }, { status: 400 });

  const check = await assertOwner(id, viewer);
  if (!check.ok) return Response.json({ error: check.error }, { status: check.status });

  const body = await req.json().catch(() => ({}));
  const { data, error } = await check.supabase
    .from('session_notes')
    .insert([{
      appointment_id: id,
      therapist_id: therapistRowId(viewer),
      therapist_email: viewer.email || null,
      raw_text: body.raw_text || null,
      ai_summary: body.ai_summary || null,
      client_summary: body.client_summary || null,
      shared_with_client: !!body.shared_with_client,
      shared_at: body.shared_with_client ? new Date().toISOString() : null,
      status: body.status === 'final' ? 'final' : 'draft',
    }])
    .select()
    .single();
  if (error) { console.error(error); return Response.json({ error: 'Sunucu hatası.' }, { status: 500 }); }
  return Response.json(data);
}
