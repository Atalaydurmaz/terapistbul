import { auth } from '../../../../auth';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/hesabim/session-insights
 *
 * Danışanın "Seans Yolculuğum" sayfası için onaylı özetleri döner.
 *
 * GİZLİLİK KURALI — KRİTİK:
 *   - Bu endpoint ASLA `ai_summary` (klinik SOAP notu) döndürmez.
 *   - Sadece terapistin "Danışanla paylaş" onayı verdiği (shared_with_client=true)
 *     satırlardan yalnızca `client_summary` alanı danışana sunulur.
 *   - Ayrıca kayıt, danışanın kendi e-postasıyla eşleşen randevulardan
 *     filtrelenir (başkasının notu görünmez).
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  try {
    const userEmail = session.user.email.trim().toLowerCase();
    const supabase = createAdminClient();

    // Önce danışanın kendi randevularını bul (email eşleşmesi)
    const { data: appts, error: aptErr } = await supabase
      .from('appointments')
      .select('id, therapist_name, selected_day, selected_hour, created_at')
      .ilike('email', userEmail);

    if (aptErr) {
      console.error('session-insights appts error:', aptErr);
      return Response.json([]);
    }

    const ids = (appts || []).map((a) => a.id);
    if (!ids.length) return Response.json([]);

    // Sadece terapistin paylaştığı ve client_summary'si olan notları getir.
    // ai_summary (SOAP) bu SELECT'te YER ALMAZ — güvenlik sınırı.
    const { data: notes, error: noteErr } = await supabase
      .from('session_notes')
      .select('id, appointment_id, client_summary, shared_at, updated_at')
      .in('appointment_id', ids)
      .eq('shared_with_client', true)
      .not('client_summary', 'is', null)
      .order('shared_at', { ascending: false });

    if (noteErr) {
      console.error('session-insights notes error:', noteErr);
      return Response.json([]);
    }

    const aptById = new Map((appts || []).map((a) => [a.id, a]));
    const mapped = (notes || []).map((n) => {
      const a = aptById.get(n.appointment_id) || {};
      return {
        id: n.id,
        appointmentId: n.appointment_id,
        therapistName: a.therapist_name || null,
        selectedDay: a.selected_day || null,
        selectedHour: a.selected_hour || null,
        clientSummary: n.client_summary,
        sharedAt: n.shared_at,
        updatedAt: n.updated_at,
      };
    });

    return Response.json(mapped);
  } catch (e) {
    console.error('session-insights error:', e);
    return Response.json([]);
  }
}
