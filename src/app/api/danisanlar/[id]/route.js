import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(req, { params }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const updates = await req.json();
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(req, { params }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
