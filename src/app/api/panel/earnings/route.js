import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifySession, SESSION_COOKIES } from '@/lib/auth/session';
import { getCommissionRate } from '@/lib/iyzico';

/**
 * GET /api/panel/earnings
 * Terapistin kazancını döner (paid appointments toplamı, komisyonu düşülmüş hali).
 * Response: {
 *   totalPaidTl, platformCommissionTl, netEarningsTl,
 *   paidCount, pendingCount, refundedCount, thisMonthTl
 * }
 */
export async function GET() {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIES.PANEL)?.value;
    const payload = token ? await verifySession(token) : null;
    if (!payload || payload.role !== 'therapist') {
      return Response.json({ error: 'Yetkisiz' }, { status: 401 });
    }
    const email = (payload.email || '').toLowerCase();
    if (!email) return Response.json({ error: 'Terapist e-postası yok' }, { status: 400 });

    const supabase = createAdminClient();
    const { data: rows, error } = await supabase
      .from('appointments')
      .select('price, payment_status, paid_at, commission_amount, therapist_amount')
      .ilike('therapist_email', email);
    if (error) { console.error('earnings error:', error); return Response.json({ error: 'Sunucu hatası.' }, { status: 500 }); }

    const commissionRate = getCommissionRate();

    let totalPaid = 0;
    let netEarnings = 0;
    let commissionTotal = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let refundedCount = 0;
    let thisMonth = 0;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    for (const r of rows || []) {
      const price = Number(r.price) || 0;
      const commission = r.commission_amount != null ? Number(r.commission_amount) : Math.round(price * commissionRate);
      const therapistAmt = r.therapist_amount != null ? Number(r.therapist_amount) : price - commission;

      if (r.payment_status === 'paid') {
        paidCount += 1;
        totalPaid += price;
        commissionTotal += commission;
        netEarnings += therapistAmt;
        if (r.paid_at && new Date(r.paid_at) >= monthStart) {
          thisMonth += therapistAmt;
        }
      } else if (r.payment_status === 'pending') {
        pendingCount += 1;
      } else if (r.payment_status === 'refunded') {
        refundedCount += 1;
      }
    }

    return Response.json({
      totalPaidTl: totalPaid,
      platformCommissionTl: commissionTotal,
      netEarningsTl: netEarnings,
      thisMonthTl: thisMonth,
      paidCount,
      pendingCount,
      refundedCount,
      commissionRate,
    });
  } catch (err) {
    console.error('earnings exception:', err);
    return Response.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
