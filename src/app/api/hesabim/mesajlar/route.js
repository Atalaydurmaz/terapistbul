import { auth } from '../../../../auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  try {
    const { note, therapistName, therapistEmail, type } = await req.json();
    if (!note?.trim() || !therapistName) {
      return Response.json({ error: 'Eksik alan' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        name: session.user.name || '',
        email: session.user.email?.toLowerCase() || '',
        phone: null,
        note: note.trim(),
        therapist_name: therapistName,
        therapist_email: therapistEmail || null,
        type: type || 'mesaj',
        status: type === 'randevu' ? 'bekliyor' : null,
      }])
      .select()
      .single();

    if (error) { console.error('hesabim POST error:', error); return Response.json({ error: 'Gönderilemedi.' }, { status: 500 }); }

    // İstemci eski alan adlarını bekliyor — uyumluluk için map'le
    return Response.json({
      id: data.id,
      name: data.name,
      email: data.email,
      note: data.note,
      therapistName: data.therapist_name,
      therapistEmail: data.therapist_email,
      type: data.type,
      status: data.status,
      createdAt: data.created_at,
      supabaseId: data.id,
    });
  } catch (e) {
    console.error('hesabim POST error:', e);
    return Response.json({ error: 'Gönderilemedi' }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  try {
    const userEmail = session.user.email.trim().toLowerCase();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('appointments')
      .select('id, name, email, phone, note, therapist_name, therapist_email, type, status, selected_day, selected_hour, daily_room_url, therapist_rating, price, payment_status, transaction_id, paid_at, refunded_at, created_at, updated_at, direction')
      .ilike('email', userEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('hesabim GET error:', error);
      return Response.json([]);
    }

    // Client tarafı eski alan adlarını kullanıyor — geri uyumluluk
    const mapped = (data || []).map((row) => ({
      id: row.id,
      supabaseId: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      note: row.note,
      therapistName: row.therapist_name,
      therapistEmail: row.therapist_email,
      type: row.type,
      status: row.status,
      selectedDay: row.selected_day,
      selectedHour: row.selected_hour,
      daily_room_url: row.daily_room_url,
      direction: row.direction,
      price: row.price,
      paymentStatus: row.payment_status,
      transactionId: row.transaction_id,
      paidAt: row.paid_at,
      refundedAt: row.refunded_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return Response.json(mapped);
  } catch (e) {
    console.error('hesabim GET error:', e);
    return Response.json([]);
  }
}
