import { createAdminClient } from '@/lib/supabase/admin';
import { retrieveCheckoutForm } from '@/lib/iyzico';

/**
 * iyzico CheckoutForm callback.
 *
 * iyzico, kullanıcı kartını doldurduktan sonra bu URL'e application/x-www-form-urlencoded
 * POST eder: { token, conversationData? }
 * Bu yüzden GET + POST iki varyantı da destekliyoruz.
 *
 * Güvenlik: Ödemeyi sadece iyzico.retrieve ile doğruladıktan sonra DB'ye
 * 'paid' olarak yazıyoruz. Tarayıcıdan gelen formdata'ya GÜVENMİYORUZ.
 */

async function readToken(req) {
  const ct = req.headers.get('content-type') || '';
  if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
    const form = await req.formData();
    return String(form.get('token') || '');
  }
  if (ct.includes('application/json')) {
    const body = await req.json().catch(() => ({}));
    return String(body.token || '');
  }
  const url = new URL(req.url);
  return String(url.searchParams.get('token') || '');
}

function redirectTo(url, status = 303) {
  return Response.redirect(url, status);
}

export async function POST(req) {
  return handle(req);
}

export async function GET(req) {
  return handle(req);
}

async function handle(req) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'https://terapistibul.com';

  const token = await readToken(req);
  if (!token) return redirectTo(`${appUrl}/odeme/sonuc?status=missing-token`);

  const supabase = createAdminClient();
  const { data: apt } = await supabase
    .from('appointments')
    .select('*')
    .eq('payment_token', token)
    .maybeSingle();

  if (!apt) {
    return redirectTo(`${appUrl}/odeme/sonuc?status=not-found`);
  }

  let iyzResult;
  try {
    iyzResult = await retrieveCheckoutForm(token, apt.id);
  } catch (e) {
    console.error('iyzico retrieve error:', e);
    return redirectTo(`${appUrl}/odeme/sonuc?status=retrieve-failed`);
  }

  // Başarısız
  if (iyzResult.status !== 'success' || iyzResult.paymentStatus !== 'SUCCESS') {
    await supabase
      .from('appointments')
      .update({
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', apt.id);
    const reason = encodeURIComponent(iyzResult.errorMessage || iyzResult.paymentStatus || 'failure');
    return redirectTo(`${appUrl}/odeme/sonuc?status=failed&reason=${reason}&id=${apt.id}`);
  }

  // Başarılı — paymentId ve detayları kaydet
  const updates = {
    payment_status: 'paid',
    transaction_id: iyzResult.paymentId,
    paid_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // iyzico tarafından dönen fiyatı da kayda al (tutarsızlık olursa uyar)
  if (iyzResult.paidPrice) {
    const paidTl = Math.round(Number(iyzResult.paidPrice));
    if (paidTl && paidTl !== apt.price) {
      // DB'deki fiyat ile iyzico paidPrice farklıysa iyzico'yu esas al (güvenilir kaynak)
      updates.price = paidTl;
    }
  }

  await supabase.from('appointments').update(updates).eq('id', apt.id);

  return redirectTo(`${appUrl}/odeme/sonuc?status=success&id=${apt.id}`);
}
