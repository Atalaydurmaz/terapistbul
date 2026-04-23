import { createAdminClient } from '@/lib/supabase/admin';
import { cancelPayment, refundPayment, retrieveCheckoutForm } from '@/lib/iyzico';
import { parseSessionStart } from '@/lib/date';

/**
 * Vercel Cron tarafından tetiklenir (ör. günde 1–4 kere).
 * Kurallar:
 *   - status='iptal' ve payment_status='paid' olan randevuları bul.
 *   - iyzico üzerinden iade başlat (aynı gün ise cancel, değilse refund).
 *   - payment_status='refunded' yap.
 *
 * Güvenlik:
 *   - Cron anahtarı CRON_SECRET env üzerinden alınır.
 *   - `Authorization: Bearer <CRON_SECRET>` veya `?key=<CRON_SECRET>` kabul edilir.
 */

async function authorize(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const h = req.headers.get('authorization') || '';
  if (h === `Bearer ${secret}`) return true;
  // Vercel Cron 'Authorization: Bearer <CRON_SECRET>' gönderir
  const url = new URL(req.url);
  if (url.searchParams.get('key') === secret) return true;
  return false;
}

export async function GET(req) {
  return handle(req);
}

export async function POST(req) {
  return handle(req);
}

async function handle(req) {
  if (!(await authorize(req))) {
    return Response.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: rows } = await supabase
    .from('appointments')
    .select('id, transaction_id, payment_token, payment_status, status, selected_day, selected_hour')
    .eq('payment_status', 'paid')
    .eq('status', 'iptal');

  const results = [];
  const now = new Date();

  for (const apt of rows || []) {
    try {
      // 24 saatten az kaldıysa iade etme (kural)
      const start = parseSessionStart(apt.selected_day, apt.selected_hour);
      if (start) {
        const hoursToSession = (start.getTime() - now.getTime()) / (60 * 60 * 1000);
        if (hoursToSession < 24 && hoursToSession > 0) {
          results.push({ id: apt.id, skipped: 'within-24h' });
          continue;
        }
      }
      // iyzico cancel → refund fallback
      let ok = false;
      try {
        const res = await cancelPayment({
          paymentId: apt.transaction_id,
          conversationId: apt.id,
          ip: '127.0.0.1',
        });
        if (res.status === 'success') ok = true;
      } catch {}
      if (!ok && apt.payment_token) {
        const detail = await retrieveCheckoutForm(apt.payment_token, apt.id).catch(() => null);
        const items = detail?.itemTransactions || [];
        for (const it of items) {
          await refundPayment({
            paymentTransactionId: it.paymentTransactionId,
            conversationId: apt.id,
            priceStr: String(it.paidPrice),
            ip: '127.0.0.1',
          });
        }
        ok = items.length > 0;
      }
      if (ok) {
        await supabase
          .from('appointments')
          .update({
            payment_status: 'refunded',
            refunded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', apt.id);
        results.push({ id: apt.id, refunded: true });
      } else {
        results.push({ id: apt.id, refunded: false });
      }
    } catch (e) {
      results.push({ id: apt.id, error: e?.message || 'hata' });
    }
  }

  return Response.json({ processed: results.length, results });
}
