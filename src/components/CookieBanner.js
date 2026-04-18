'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState({
    necessary: true,   // kapatılamaz
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({ necessary: true, analytics: true, marketing: true }));
    setVisible(false);
  };

  const savePrefs = () => {
    localStorage.setItem('cookie_consent', JSON.stringify(prefs));
    setVisible(false);
    setShowSettings(false);
  };

  const rejectAll = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({ necessary: true, analytics: false, marketing: false }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Overlay (settings modali açıkken) */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 z-[998]" onClick={() => setShowSettings(false)} />
      )}

      {/* Settings Modalı */}
      {showSettings && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[999] w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="bg-teal-600 px-6 py-4 flex items-center justify-between">
            <h2 className="text-white font-bold text-base">Çerez Tercihleri</h2>
            <button onClick={() => setShowSettings(false)} className="text-teal-100 hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="px-6 py-5 space-y-4 max-h-80 overflow-y-auto">
            {/* Zorunlu */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">Zorunlu Çerezler</p>
                <p className="text-xs text-slate-500 mt-0.5">Sitenin çalışması için gereklidir. Devre dışı bırakılamaz.</p>
              </div>
              <div className="w-11 h-6 bg-teal-500 rounded-full flex-shrink-0 flex items-center px-1 cursor-not-allowed">
                <div className="w-4 h-4 bg-white rounded-full ml-auto shadow" />
              </div>
            </div>

            {/* Analitik */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">Analitik Çerezler</p>
                <p className="text-xs text-slate-500 mt-0.5">Trafiği anlamamıza ve sitemizi geliştirmemize yardımcı olur.</p>
              </div>
              <button
                onClick={() => setPrefs(p => ({ ...p, analytics: !p.analytics }))}
                className={`w-11 h-6 rounded-full flex-shrink-0 flex items-center px-1 transition-colors ${prefs.analytics ? 'bg-teal-500' : 'bg-slate-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs.analytics ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {/* Pazarlama */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">Pazarlama Çerezleri</p>
                <p className="text-xs text-slate-500 mt-0.5">Kişiselleştirilmiş içerik ve reklamlar için kullanılır.</p>
              </div>
              <button
                onClick={() => setPrefs(p => ({ ...p, marketing: !p.marketing }))}
                className={`w-11 h-6 rounded-full flex-shrink-0 flex items-center px-1 transition-colors ${prefs.marketing ? 'bg-teal-500' : 'bg-slate-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs.marketing ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
            <button onClick={rejectAll} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
              Reddet
            </button>
            <button onClick={savePrefs} className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors">
              Tercihleri Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Ana Banner */}
      {!showSettings && (
        <div className="fixed bottom-0 left-0 right-0 z-[997] bg-white border-t border-slate-200 shadow-lg px-4 py-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* İkon + Metin */}
            <div className="flex items-start gap-3 flex-1">
              <span className="text-2xl flex-shrink-0">🍪</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 mb-0.5">Çerezleri Kullanıyoruz</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  TerapistBul olarak, size daha iyi bir deneyim sunabilmek için çerezleri kullanıyoruz.
                  Zorunlu çerezler sitenin işlevsel çalışması için gereklidir. Analitik çerezler ise
                  trafiğimizi anlamaya ve sitemizi geliştirmeye yardımcı olur. Detaylı bilgi için{' '}
                  <Link href="/kvkk" className="text-teal-600 hover:underline">KVKK Politikamızı</Link>
                  {' '}ve{' '}
                  <Link href="/gizlilik" className="text-teal-600 hover:underline">Gizlilik Politikamızı</Link>
                  {' '}inceleyebilirsiniz.
                </p>
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setShowSettings(true)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Ayarlar
              </button>
              <button
                onClick={rejectAll}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Reddet
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
              >
                Kabul Et
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
