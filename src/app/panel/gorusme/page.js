'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';

function Clock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="tabular-nums">{time}</span>;
}

function SessionTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const fmt = (n) => String(n).padStart(2, '0');
  return <span className="tabular-nums">{h > 0 ? `${fmt(h)}:` : ''}{fmt(m)}:{fmt(s)}</span>;
}

function GorusmeIframe() {
  const params = useSearchParams();
  const roomUrl = params.get('room');
  const clientName = params.get('name') || 'Danışan';
  const therapistName = params.get('terapist') || 'Terapist';
  const appointmentId = params.get('id');
  const iframeSrc = roomUrl ? `${roomUrl}?name=${encodeURIComponent(therapistName)}` : null;

  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef(null);
  const storageKey = `seans_notu_${appointmentId || 'default'}`;

  // localStorage'dan notları yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setNotes(saved);
    } catch {}
  }, [storageKey]);

  // Otomatik kaydet (1 sn debounce)
  const handleNotesChange = (val) => {
    setNotes(val);
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, val);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {}
    }, 1000);
  };

  if (!roomUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0f172a] text-white gap-6">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Görüşme odası bulunamadı</p>
          <p className="text-slate-400 text-sm mt-1">Geçersiz veya süresi dolmuş link</p>
        </div>
        <Link href="/panel/randevular" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors">
          Randevulara Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="flex-shrink-0 bg-[#0f172a] border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-5 h-14">

          {/* Sol */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 flex items-center justify-center">
                <img src="/logo.svg" alt="TerapistBul" width="28" height="28" className="rounded-lg" />
              </div>
              <span className="text-white font-semibold text-sm">TerapistBul</span>
            </div>

            <div className="w-px h-4 bg-white/10" />

            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-slate-300 text-xs font-medium">Canlı Seans</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg border border-white/[0.06]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="text-slate-300 text-xs">{clientName}</span>
            </div>
          </div>

          {/* Orta */}
          <div className="flex items-center gap-4 absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/[0.06]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className="text-slate-300 text-xs font-mono"><SessionTimer /></span>
            </div>
            <span className="text-slate-500 text-xs font-mono"><Clock /></span>
          </div>

          {/* Sağ */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg border border-white/[0.06]">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span className="text-green-400 text-xs font-medium">Şifreli</span>
            </div>

            {/* Not Al butonu */}
            <button
              onClick={() => setNotesOpen((o) => !o)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 border text-xs font-medium rounded-xl transition-all ${
                notesOpen
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/[0.06]'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Not Al
            </button>

            <Link
              href="/panel/randevular"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 text-xs font-medium rounded-xl transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Görüşmeyi Bitir
            </Link>
          </div>
        </div>
      </header>

      {/* Ana alan: iframe + not paneli */}
      <div className="flex flex-1 min-h-0">
        {/* Daily.co iframe */}
        <iframe
          src={iframeSrc}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="flex-1 border-0 min-w-0"
          title="Video Görüşme"
        />

        {/* Not Paneli */}
        {notesOpen && (
          <div className="w-72 flex-shrink-0 bg-[#0f172a] border-l border-white/[0.06] flex flex-col">
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <span className="text-slate-300 text-xs font-medium">Seans Notları</span>
              </div>
              <div className="flex items-center gap-2">
                {saved && (
                  <span className="text-green-400 text-xs flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Kaydedildi
                  </span>
                )}
                <button
                  onClick={() => setNotesOpen(false)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Danışan bilgisi */}
            <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 text-xs font-bold">
                {clientName.charAt(0).toUpperCase()}
              </div>
              <span className="text-slate-400 text-xs">{clientName}</span>
            </div>

            {/* Textarea */}
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder={`${clientName} ile seans notlarınızı buraya yazın...\n\nBu notlar yalnızca siz görebilirsiniz.`}
              className="flex-1 bg-transparent text-slate-200 text-sm leading-relaxed resize-none outline-none px-4 py-4 placeholder-slate-600"
              spellCheck={false}
            />

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-slate-600 text-xs">{notes.length} karakter</span>
              <button
                onClick={() => {
                  try {
                    localStorage.setItem(storageKey, notes);
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                  } catch {}
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-medium rounded-lg transition-colors border border-teal-500/20"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Kaydet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GorusmePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-[#0f172a] text-white">
        <div className="flex items-center gap-3">
          <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <span className="text-slate-300 text-sm">Görüşme yükleniyor...</span>
        </div>
      </div>
    }>
      <GorusmeIframe />
    </Suspense>
  );
}
