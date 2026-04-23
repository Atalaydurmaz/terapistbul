import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { cancelPayment, refundPayment, retrieveCheckoutForm } from '@/lib/iyzico';
import { verifySession, SESSION_COOKIES } from '@/lib/auth/session';
import { parseSessionStart } from '@/lib/date';

function isUuid(s) {
  return typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function pickIp(req) {
  const h = req.headers;
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || '127.0.0.1';
}

async function getViewer() {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIES.PANEL)?.value;
    if (token) {
      const payload = await verifySession(token);
      if (payload?.role === 'therapist') {
        return { role: 'therapist', email: payload.email?.toLowerCase() || null };
      }
      if (payload?.role === 'admin') {
        return { role: 'admin', email: payload.email?.toLowerCase() || null };
      }
    }
    const admToken = jar.get(SESSION_COOKIES.ADMIN)?.value;
    if (admToken) {
      const payload = await verifySession(admToken);
      if (payload?.role === 'admin') {
        return { role: 'admin', email: payload.email?.toLowerCase() || null };
      }
    }
  } catch {}
  const s = await auth().catch(() => null);
  if (s?.user?.email) return { role: 'client', email: s.user.email.toLowerCase() };
  return { role: null, email: null };
}

/**
 * POST /api/payment/refund
 * body: { appointmentId, reason? }
 *
 * Kural: Seansa <24 saat kaldıysa iade YAPILMAZ (danışan).
 * Admin her zaman iade başlatabilir.
 * Seans tarihinden önce iyzico.cancel (tam iade), sonra iyzico.refund.
 */
export async function POST(req) {
  const viewer = await getViewer();
  if (!viewer.role) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

  const { appointmentId, reason } = await req.json().catch(() => ({}));
  if (!isUuid(appointmentId)) {
    return Response.json({ error: 'Geçersiz randevu' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: apt } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .maybeSingle();
  if (!apt) return Response.json({ error: 'Randevu bulunamadı' }, { status: 404 });

  // Yetki kontrolü
  if (viewer.role === 'client') {
    if ((apt.email || '').toLowerCase() !== viewer.email) {
      return Response.json({ error: 'Yetkisiz' }, { status: 403 });
    }
  } else if (viewer.role === 'therapist') {
    if ((apt.therapist_email || '').toLowerCase() !== viewer.email) {
      return Response.json({ error: 'Yetkisiz' }, { status: 403 });
    }
  }
  // admin: kısıt yok

  if (apt.payment_status !== 'paid') {
    return Response.json({ error: 'Ödeme durumu iade edilemez' }, { status: 400 });
  }
  if (!apt.transaction_id) {
    return Response.json({ error: 'İşlem numarası yok' }, { status: 400 });
  }

  // 24 saat kuralı — client tarafı için
  const start = parseSessionStart(apt.selected_day, apt.selected_hour);
  const now = new Date();
  if (viewer.role === 'client' && start) {
    const hoursToSession = (start.getTime() - now.getTime()) / (60 * 60 * 1000);
    if (hoursToSession < 24) {
      return Response.json(
        { error: 'Seansa 24 saatten az kaldığı için iade alınamaz' },
        { status: 400 }
      );
    }
  }

  // iyzico — cancel (seans öncesi, aynı gün) veya refund
  let iyzResult;
  try {
    // cancel, aynı güne ait (authorisation) ödemeyi kapatır. Daha önceki gün
    // yapılan ödemeler için refund (paymentTransactionId gerekir) kullanılır.
    const res = await cancelPayment({
      paymentId: apt.transaction_id,
      conversationId: apt.id,
      ip: pickIp(req),
    });
    if (res.status === 'success') {
      iyzResult = res;
    } else if (/only.*same.*day/i.test(res.errorMessage || '') || res.errorCode === '6002') {
      // Aynı güne ait değilse — her basketItem için refund dene
      const checkoutRes = await retrieveCheckoutForm(apt.payment_token, apt.id).catch(() => null);
      const items = checkoutRes?.itemTransactions || [];
      if (!items.length) throw new Error(res.errorMessage || 'İade başarısız');
      for (const it of items) {
        await refundPayment({
          paymentTransactionId: it.paymentTransactionId,
          conversationId: apt.id,
          priceStr: String(it.paidPrice),
          ip: pickIp(req),
        });
      }
      iyzResult = { status: 'success', mode: 'refund' };
    } else {
      throw new Error(res.errorMessage || 'İade başarısız');
    }
  } catch (e) {
    console.error('iyzico refund error:', e);
    return Response.json({ error: e?.message || 'İade başarısız' }, { status: 500 });
  }

  await supabase
    .from('appointments')
    .update({
      payment_status: 'refunded',
      refunded_at: new Date().toISOString(),
      status: 'iptal',
      updated_at: new Date().toISOString(),
      note: apt.note ? `${apt.note}\n[İade: ${reason || 'belirtilmedi'}]` : `[İade: ${reason || 'belirtilmedi'}]`,
    })
    .eq('id', apt.id);

  return Response.json({ ok: true, iyzResult });
}
