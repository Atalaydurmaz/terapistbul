'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { fmtDateTr } from '@/lib/date';

/**
 * /odeme/[id] — Seans ödeme sayfası
 * iyzico CheckoutForm (hosted iframe) — kart bilgileri bizim sunucumuza ulaşmaz,
 * PCI-DSS uyumu iyzico tarafında sağlanır.
 */
export default function OdemePage() {
  const { id } = useParams();
  const router = useRouter();
  const { status: authStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apt, setApt] = useState(null);
  const [starting, setStarting] = useState(false);
  const formContainerRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push(`/giris?callbackUrl=${encodeURIComponent(`/odeme/${id}`)}`);
    }
  }, [authStatus, id, router]);

  useEffect(() => {
    if (!id || authStatus !== 'authenticated') return;
    fetch(`/api/session/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || 'Yüklenemedi');
        return r.json();
      })
      .then(setApt)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, authStatus]);

  const startPayment = async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStarting(true);
    setError(null);
    try {
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ödeme başlatılamadı');
      // iyzico CheckoutForm — iframe içine render et
      if (data.checkoutFormContent && formContainerRef.current) {
        formContainerRef.current.innerHTML = data.checkoutFormContent;
        // iyzico script'leri script tag'leri dış kaynaklı olduğundan bu şekilde DOM'a eklendiğinde
        // tarayıcı çalıştırmaz — script'leri manuel çalıştırmamız gerekiyor.
        const scripts = formContainerRef.current.querySelectorAll('script');
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          for (const attr of oldScript.attributes) {
            newScript.setAttribute(attr.name, attr.value);
          }
          newScript.textContent = oldScript.textContent;
          oldScript.parentNode.replaceChild(newScript, oldScript);
        });
      } else if (data.paymentPageUrl) {
        // Alternatif: kullanıcıyı iyzico sayfasına yönlendir
        window.location.href = data.paymentPageUrl;
      }
    } catch (e) {
      setError(e.message);
      startedRef.current = false;
    } finally {
      setStarting(false);
    }
  };

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !apt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md">
          <p className="text-red-600 font-semibold mb-2">Hata</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <Link href="/hesabim?tab=randevular" className="text-teal-600 hover:underline text-sm">
            Randevularıma dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/hesabim?tab=randevular" className="text-slate-500 text-sm hover:text-teal-600 inline-flex items-center gap-1 mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Randevularım
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-5 text-white">
            <h1 className="text-xl font-bold">Ödeme</h1>
            <p className="text-teal-50 text-sm mt-1">Güvenli ödeme — iyzico altyapısı</p>
          </div>

          <div className="p-6">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-5">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Seans</p>
              <p className="font-semibold text-slate-800 text-lg">{apt?.therapistName || 'Terapist'}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-2">
                {apt?.selectedDay && (
                  <span className="flex items-center gap-1.5 text-teal-700 font-medium">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {fmtDateTr(apt.selectedDay)}
                  </span>
                )}
                {apt?.selectedHour && (
                  <span className="flex items-center gap-1.5 text-teal-700 font-medium">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {apt.selectedHour}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 p-4 mb-5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Güvenli Ödeme</p>
                <p className="text-blue-800/90 text-xs leading-relaxed">
                  Kart bilgileriniz bize ulaşmaz, iyzico altyapısı üzerinden şifreli olarak işlenir (PCI-DSS uyumlu).
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4 mb-5 text-red-700 text-sm">
                {error}
              </div>
            )}

            {!startedRef.current && (
              <button
                onClick={startPayment}
                disabled={starting}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {starting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Ödeme başlatılıyor...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    Güvenli Ödemeye Geç
                  </>
                )}
              </button>
            )}

            {/* iyzico CheckoutForm buraya mount olur */}
            <div
              ref={formContainerRef}
              id="iyzipay-checkout-form"
              className="responsive mt-5"
            />

            <p className="text-xs text-slate-400 text-center mt-5">
              24 saatten önceki iptallerde ücret iade edilir. 24 saat içinde yapılan iptaller iade edilmez.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
