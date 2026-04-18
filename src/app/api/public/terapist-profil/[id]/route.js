import { createAdminClient } from '@/lib/supabase/admin';
import { therapists as staticTherapists } from '@/data/therapists';

// GET /api/public/terapist-profil/[id]
// id can be a UUID (from therapists table) or an old string panel_id
export async function GET(req, { params }) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Try direct panel_id lookup first
  const { data, error } = await supabase
    .from('therapist_profiles')
    .select('*')
    .eq('panel_id', id)
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (data) return Response.json(data);

  // id might be a UUID — look up the therapist name, then find the static panel_id
  const { data: therapist } = await supabase
    .from('therapists')
    .select('name')
    .eq('id', id)
    .maybeSingle();

  if (therapist?.name) {
    const staticT = staticTherapists.find((t) => t.name === therapist.name);
    if (staticT) {
      const { data: profileByStaticId } = await supabase
        .from('therapist_profiles')
        .select('*')
        .eq('panel_id', staticT.id)
        .maybeSingle();
      if (profileByStaticId) return Response.json(profileByStaticId);
    }
  }

  return Response.json({});
}
