import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifySession, SESSION_COOKIES } from '@/lib/auth/session';

async function getPanelViewer() {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIES.PANEL)?.value;
    if (!token) return null;
    const payload = await verifySession(token);
    if (payload?.role !== 'therapist') return null;
    return {
      therapistId: payload.therapistId || payload.id || null,
      email: payload.email ? String(payload.email).toLowerCase() : null,
      name: payload.name || null,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const viewer = await getPanelViewer();
  if (!viewer) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

  const supabase = createAdminClient();
  let query = supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false });

  // Sadece bu terapiste gelen/giden kayıtları döndür.
  if (viewer.email) {
    query = query.ilike('therapist_email', viewer.email);
  } else if (viewer.name) {
    query = query.ilike('therapist_name', viewer.name);
  } else {
    return Response.json([]);
  }

  const { data, error } = await query;
  if (error) { console.error('panel messages GET error:', error); return Response.json({ error: 'Sunucu hatası.' }, { status: 500 }); }
  return Response.json(data);
}

export async function POST(req) {
  const viewer = await getPanelViewer();
  if (!viewer) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

  const supabase = createAdminClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from('appointments')
    .insert([{
      name: body.name,
      email: body.email,
      note: body.note,
      // therapist bilgisini istemciye değil cookie'ye güven.
      therapist_name: viewer.name || body.therapistName || body.toName,
      therapist_email: viewer.email || body.therapistEmail,
      type: 'mesaj',
      status: null,
    }])
    .select()
    .single();
  if (error) { console.error('panel messages POST error:', error); return Response.json({ error: 'Sunucu hatası.' }, { status: 500 }); }
  return Response.json(data, { status: 201 });
}
