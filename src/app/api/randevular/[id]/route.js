import { createAdminClient } from '@/lib/supabase/admin';

function isValidUuid(v) {
  return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

export async function PATCH(req, { params }) {
  const supabase = createAdminClient();
  const { id } = await params;
  if (!isValidUuid(id)) {
    return Response.json({ error: 'Geçersiz randevu ID' }, { status: 400 });
  }
  const updates = await req.json();
  const { data, error } = await supabase
    .from('appointments')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: 'Randevu bulunamadı' }, { status: 404 });
  return Response.json(data);
}

export async function DELETE(req, { params }) {
  const supabase = createAdminClient();
  const { id } = await params;
  if (!isValidUuid(id)) {
    return Response.json({ error: 'Geçersiz randevu ID' }, { status: 400 });
  }
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
