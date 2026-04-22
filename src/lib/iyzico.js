/**
 * iyzico Marketplace (Sub-merchant / Split Payment) istemci sarmalayıcı.
 *
 * Gerekli environment değişkenleri:
 *   IYZIPAY_API_KEY           -> iyzico API anahtarı
 *   IYZIPAY_SECRET_KEY        -> iyzico gizli anahtarı
 *   IYZIPAY_URI               -> https://sandbox-api.iyzipay.com | https://api.iyzipay.com
 *   PLATFORM_COMMISSION_RATE  -> Platform komisyonu (örn. 0.20 = %20). Varsayılan 0.20
 *   NEXT_PUBLIC_APP_URL       -> Public base URL (callback için)
 *
 * NOT: Anahtarları KESİNLİKLE koda gömmeyin. Sadece env üzerinden okuyun.
 */

import Iyzipay from 'iyzipay';

let _client = null;

export function getIyzipay() {
  if (_client) return _client;
  const apiKey = process.env.IYZIPAY_API_KEY;
  const secretKey = process.env.IYZIPAY_SECRET_KEY;
  const uri = process.env.IYZIPAY_URI || 'https://sandbox-api.iyzipay.com';
  if (!apiKey || !secretKey) {
    throw new Error('iyzico yapılandırması eksik: IYZIPAY_API_KEY / IYZIPAY_SECRET_KEY');
  }
  _client = new Iyzipay({ apiKey, secretKey, uri });
  return _client;
}

export function getCommissionRate() {
  const raw = Number(process.env.PLATFORM_COMMISSION_RATE);
  if (!Number.isFinite(raw) || raw <= 0 || raw >= 1) return 0.20;
  return raw;
}

/**
 * Platform komisyonunu ve terapist payını hesaplar.
 * amount TL (integer) olarak gelir, iyzico'ya string (ör. "1200.00") göndeririz.
 */
export function computeSplit(amountTl, rate = getCommissionRate()) {
  const total = Math.round(Number(amountTl) * 100); // kuruş
  const commission = Math.round(total * rate);
  const therapist = total - commission;
  return {
    totalKurus: total,
    commissionKurus: commission,
    therapistKurus: therapist,
    totalStr: (total / 100).toFixed(2),
    commissionStr: (commission / 100).toFixed(2),
    therapistStr: (therapist / 100).toFixed(2),
  };
}

/**
 * CheckoutForm initialize — hosted, iframe uyumlu ödeme sayfası.
 * PCI kapsamı iyzico'ya aittir (kart bilgileri bize ulaşmaz).
 *
 * Not: Eğer terapistin iyzico_submerchant_key alanı doluysa split payment
 * yapılır (subMerchantKey + subMerchantPrice). Aksi halde platform toplam
 * tutarı alır; terapist ödemesi manuel yapılır.
 */
export function initCheckoutForm({
  conversationId,
  priceTl,
  paidPriceTl,
  currency = 'TRY',
  callbackUrl,
  buyer,
  billingAddress,
  shippingAddress,
  basketItems,
}) {
  const iyzipay = getIyzipay();
  return new Promise((resolve, reject) => {
    iyzipay.checkoutFormInitialize.create(
      {
        locale: 'tr',
        conversationId,
        price: String(priceTl),
        paidPrice: String(paidPriceTl ?? priceTl),
        currency,
        basketId: conversationId,
        paymentGroup: 'PRODUCT',
        callbackUrl,
        enabledInstallments: [2, 3, 6, 9],
        buyer,
        billingAddress,
        shippingAddress,
        basketItems,
      },
      (err, result) => {
        if (err) return reject(err);
        if (result?.status === 'failure') {
          return reject(new Error(result.errorMessage || 'iyzico hata'));
        }
        resolve(result);
      }
    );
  });
}

/** CheckoutForm sonucunu token ile doğrula. */
export function retrieveCheckoutForm(token, conversationId) {
  const iyzipay = getIyzipay();
  return new Promise((resolve, reject) => {
    iyzipay.checkoutForm.retrieve(
      { locale: 'tr', token, conversationId },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

/** Ödeme iptali (tam iade, seans gününden önce). */
export function cancelPayment({ paymentId, conversationId, ip }) {
  const iyzipay = getIyzipay();
  return new Promise((resolve, reject) => {
    iyzipay.cancel.create(
      {
        locale: 'tr',
        conversationId,
        paymentId,
        ip: ip || '127.0.0.1',
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

/** Kısmi/tam iade (cancel 24 saati geçtiyse). */
export function refundPayment({ paymentTransactionId, conversationId, priceStr, ip }) {
  const iyzipay = getIyzipay();
  return new Promise((resolve, reject) => {
    iyzipay.refund.create(
      {
        locale: 'tr',
        conversationId,
        paymentTransactionId,
        price: priceStr,
        currency: 'TRY',
        ip: ip || '127.0.0.1',
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

/** Alt üye iş yeri oluştur — terapistin iyzico kaydı. */
export function createSubMerchant(data) {
  const iyzipay = getIyzipay();
  return new Promise((resolve, reject) => {
    iyzipay.subMerchant.create(
      { locale: 'tr', ...data },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}
