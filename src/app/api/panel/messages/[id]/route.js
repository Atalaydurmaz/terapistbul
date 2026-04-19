import { createAdminClient } from '@/lib/supabase/admin';

function isValidUuid(v) {
  return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

export async function DELETE(req, { params }) {
  try {
    const { id: idParam } = await params;
    if (!isValidUuid(idParam)) {
      return Response.json({ error: 'Geçersiz ID' }, { status: 400 });
    }
    const supabase = createAdminClient();
    const { error } = await supabase.from('appointments').delete().eq('id', idParam);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true });
  } catch (e) {
    console.error('panel messages DELETE error:', e);
    return Response.json({ error: 'Silinemedi.' }, { status: 500 });
  }
}
