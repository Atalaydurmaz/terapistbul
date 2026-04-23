import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { initCheckoutForm, computeSplit, getCommissionRate } from '@/lib/iyzico';

function isUuid(s) {
  return typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function pickIp(req) {
  const h = req.headers;
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    '127.0.0.1'
  );
}

/**
 * POST /api/payment/checkout
 * body: { appointmentId }
 * Döner: { paymentPageUrl, token, checkoutFormContent }
 *
 * Akış:
 *   - Oturumu doğrula (danışan). Randevunun sahibi olmalı.
 *   - Randevu status=onayli ve payment_status=pending olmalı.
 *   - Terapistin price değerini al.
 *   - iyzico CheckoutForm başlat, token'ı appointments.payment_token'a yaz.
 *   - Eğer terapistin submerchant key'i varsa split payment yap.
 */
export async function POST(req) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Giriş gerekli' }, { status: 401 });
  }

  const { appointmentId } = await req.json().catch(() => ({}));
  if (!isUuid(appointmentId)) {
    return Response.json({ error: 'Geçersiz randevu' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: apt, error: aptErr } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .maybeSingle();

  if (aptErr) return Response.json({ error: aptErr.message }, { status: 500 });
  if (!apt) return Response.json({ error: 'Randevu bulunamadı' }, { status: 404 });

  const userEmail = session.user.email.toLowerCase();
  if ((apt.email || '').toLowerCase() !== userEmail) {
    return Response.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  if (apt.status !== 'onayli') {
    return Response.json({ error: 'Randevu henüz onaylanmadı' }, { status: 400 });
  }

  if (apt.payment_status === 'paid') {
    return Response.json({ error: 'Randevu zaten ödendi' }, { status: 400 });
  }

  // Ücreti belirle: öncelikle appointments.price, yoksa therapist tablosundan çek
  let priceTl = apt.price;
  let therapist = null;
  if (apt.therapist_email) {
    const { data: t } = await supabase
      .from('therapists')
      .select('id, name, email, price, iyzico_submerchant_key')
      .ilike('email', apt.therapist_email)
      .maybeSingle();
    therapist = t || null;
    if (!priceTl && t?.price) priceTl = t.price;
  }

  if (!priceTl || priceTl <= 0) {
    return Response.json({ error: 'Seans ücreti tanımlı değil' }, { status: 400 });
  }

  const rate = getCommissionRate();
  const split = computeSplit(priceTl, rate);

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'https://terapistibul.com';
  const callbackUrl = `${appUrl}/api/payment/callback`;

  const nameParts = (apt.name || session.user.name || 'Danışan').trim().split(/\s+/);
  const givenName = nameParts[0] || 'Danışan';
  const surname = nameParts.slice(1).join(' ') || 'Kullanıcı';

  const basketItem = {
    id: appointmentId,
    name: `Terapi Seansı - ${apt.therapist_name || 'Terapist'}`,
    category1: 'Terapi',
    itemType: 'VIRTUAL',
    price: split.totalStr,
  };
  // Split payment — terapistin submerchant key'i varsa
  if (therapist?.iyzico_submerchant_key) {
    basketItem.subMerchantKey = therapist.iyzico_submerchant_key;
    basketItem.subMerchantPrice = split.therapistStr; // terapiste giden net tutar
  }

  try {
    const result = await initCheckoutForm({
      conversationId: appointmentId,
      priceTl: split.totalStr,
      paidPriceTl: split.totalStr,
      callbackUrl,
      buyer: {
        id: appointmentId,
        name: givenName,
        surname,
        gsmNumber: apt.phone || '+905555555555',
        email: apt.email || userEmail,
        identityNumber: '11111111111',
        registrationAddress: 'Türkiye',
        ip: pickIp(req),
        city: 'Istanbul',
        country: 'Turkey',
      },
      billingAddress: {
        contactName: `${givenName} ${surname}`,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Türkiye',
      },
      shippingAddress: {
        contactName: `${givenName} ${surname}`,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Türkiye',
      },
      basketItems: [basketItem],
    });

    if (result.status !== 'success') {
      return Response.json(
        { error: result.errorMessage || 'Ödeme başlatılamadı' },
        { status: 400 }
      );
    }

    await supabase
      .from('appointments')
      .update({
        price: priceTl,
        payment_status: 'pending',
        payment_token: result.token,
        commission_amount: Math.round(priceTl * rate),
        therapist_amount: priceTl - Math.round(priceTl * rate),
        payment_provider: 'iyzico',
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId);

    return Response.json({
      paymentPageUrl: result.paymentPageUrl,
      token: result.token,
      checkoutFormContent: result.checkoutFormContent,
    });
  } catch (err) {
    console.error('iyzico checkout error:', err);
    return Response.json(
      { error: err?.message || 'Ödeme başlatılamadı' },
      { status: 500 }
    );
  }
}
