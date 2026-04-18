'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Link from 'next/link';

const LABELS = ['', 'Çok Kötü', 'Kötü', 'Orta', 'İyi', 'Mükemmel'];

function PuanVerContent() {
  const params = useSearchParams();
  const appointmentId = params.get('id');
  const therapistName = params.get('terapist') || 'Terapistiniz';

  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  if (!appointmentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-500">Geçersiz link.</p>
          <Link href="/" className="mt-4 inline-block text-teal-600 text-sm underline">Ana Sayfaya Dön</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-sm flex flex-col items-center gap-5 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center border border-green-200">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Teşekkürler!</h2>
            <p className="text-slate-500 text-sm mt-2">Değerlendirmeniz kaydedildi. Geri bildiriminiz bizim için çok değerli.</p>
          </div>
          <Link href="/" className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors text-center">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/gorusme/puan-ver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appointmentId, rating: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Bir hata oluştu.');
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
      setSubmitting(false);
    }
  };

  const active = hover || selected;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-sm flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-500 rounded-xl flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-semibold text-slate-700">TerapistBul</span>
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-800">Seansı Değerlendir</h1>
          <p className="text-slate-500 text-sm mt-1.5">
            <span className="font-medium text-teal-700">{therapistName}</span> ile görüşmenizi puanlayın
          </p>
        </div>

        {/* Stars */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setSelected(s)}
                className="transition-all duration-100 hover:scale-110 active:scale-95"
              >
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill={s <= active ? '#f59e0b' : 'none'}
                  stroke={s <= active ? '#f59e0b' : '#cbd5e1'}
                  strokeWidth="1.8"
                  className="transition-all duration-100"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            ))}
          </div>
          <p className={`text-sm font-medium h-5 transition-all ${active ? 'text-amber-600' : 'text-transparent'}`}>
            {LABELS[active] || ' '}
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selected || submitting}
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {submitting ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
        </button>

        <Link href="/" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
          Atla
        </Link>
      </div>
    </div>
  );
}

export default function PuanVerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PuanVerContent />
    </Suspense>
  );
}
