import { createAdminClient } from '@/lib/supabase/admin';
import { therapists as staticTherapists } from '@/data/therapists';

export async function GET() {
  const supabase = createAdminClient();
  const [{ data, error }, { data: profiles }] = await Promise.all([
    supabase
      .from('therapists')
      .select('*')
      .neq('status', 'pasif')
      .order('created_at', { ascending: false }),
    supabase.from('therapist_profiles').select('panel_id, photo_url, intro_video_url'),
  ]);
  if (error) { console.error(error); return Response.json({ error: 'Sunucu hatası.' }, { status: 500 }); }

  // Build name→profile map using static data as bridge (panel_id → name)
  const nameToProfile = {};
  if (profiles) {
    for (const p of profiles) {
      const staticT = staticTherapists.find((t) => t.id === p.panel_id);
      if (staticT) nameToProfile[staticT.name] = p;
    }
  }

  const merged = (data || []).map((t) => {
    const prof = nameToProfile[t.name];
    return {
      ...t,
      photo_url: t.photo_url || prof?.photo_url || null,
      intro_video_url: t.intro_video_url || prof?.intro_video_url || null,
    };
  });

  return Response.json(merged);
}

export async function POST(req) {
  const supabase = createAdminClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from('therapists')
    .insert([{ ...body, status: body.status || 'aktif' }])
    .select()
    .single();
  if (error) { console.error(error); return Response.json({ error: 'Sunucu hatası.' }, { status: 500 }); }
  return Response.json(data, { status: 201 });
}
