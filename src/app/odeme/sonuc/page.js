'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function Inner() {
  const sp = useSearchParams();
  const status = sp.get('status');
  const id = sp.get('id');
  const reason = sp.get('reason');

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md w-full overflow-hidden">
        <div className={`px-6 py-10 text-center ${isSuccess ? 'bg-gradient-to-br from-teal-50 to-emerald-50' : 'bg-red-50'}`}>
          {isSuccess ? (
            <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-teal-200">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-200">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          )}
          <h1 className="text-xl font-bold text-slate-800 mt-4">
            {isSuccess ? 'Ödeme Başarılı' : 'Ödeme Tamamlanamadı'}
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {isSuccess
              ? 'Randevunuz onaylandı. Seans saatinde katılım linkine erişebilirsiniz.'
              : reason
                ? decodeURIComponent(reason)
                : 'Ödeme sırasında bir sorun oluştu.'}
          </p>
        </div>

        <div className="px-6 py-5 flex flex-col gap-2">
          <Link
            href="/hesabim?tab=randevular"
            className="block text-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            Randevularıma Dön
          </Link>
          {!isSuccess && id && (
            <Link
              href={`/odeme/${id}`}
              className="block text-center text-slate-600 hover:text-teal-600 text-sm font-medium py-2"
            >
              Tekrar Dene
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OdemeSonucPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Yükleniyor...</div>}>
      <Inner />
    </Suspense>
  );
}
