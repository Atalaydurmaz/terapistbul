import { auth } from '../../../../../auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  try {
    const { id: idParam } = await params;
    const supabase = createAdminClient();

    // Önce kaydı çek ve sahiplik doğrula — başkasının mesajını silmesin
    const { data: row, error: fetchErr } = await supabase
      .from('appointments')
      .select('id, email')
      .eq('id', idParam)
      .maybeSingle();

    if (fetchErr) return Response.json({ error: fetchErr.message }, { status: 500 });
    if (!row) return Response.json({ error: 'Kayıt bulunamadı' }, { status: 404 });

    if (row.email?.toLowerCase() !== session.user.email.toLowerCase()) {
      return Response.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    const { error: delErr } = await supabase.from('appointments').delete().eq('id', idParam);
    if (delErr) return Response.json({ error: delErr.message }, { status: 500 });

    return Response.json({ success: true });
  } catch (e) {
    console.error('hesabim DELETE error:', e);
    return Response.json({ error: 'Silinemedi.' }, { status: 500 });
  }
}
