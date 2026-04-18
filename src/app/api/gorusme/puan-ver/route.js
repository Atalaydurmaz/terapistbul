import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req) {
  try {
    const { id, rating } = await req.json();

    if (!id || !rating || rating < 1 || rating > 5) {
      return Response.json({ error: 'Geçersiz istek' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Zaten puan verilmişse tekrar verme
    const { data: existing } = await supabase
      .from('appointments')
      .select('client_rating')
      .eq('id', id)
      .single();

    if (existing?.client_rating) {
      return Response.json({ error: 'Bu randevu için zaten puan verildi' }, { status: 409 });
    }

    const { error } = await supabase
      .from('appointments')
      .update({ client_rating: rating })
      .eq('id', id);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
