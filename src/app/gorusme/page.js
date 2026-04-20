'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

function GorusmeContent() {
  const params = useSearchParams();
  const roomUrl = params.get('room');
  const therapistName = params.get('terapist') || 'Terapistiniz';
  const clientName = params.get('name') || 'Danışan';
  const appointmentId = params.get('id');
  const iframeSrc = roomUrl ? `${roomUrl}?name=${encodeURIComponent(clientName)}` : null;
  const leaveHref = appointmentId
    ? `/gorusme/puan-ver?id=${appointmentId}&terapist=${encodeURIComponent(therapistName)}`
    : '/';

  if (!roomUrl) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white gap-6 p-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold">Görüşme odası bulunamadı</h1>
          <p className="text-slate-400 text-sm mt-1">Lütfen e-postanızdaki linki kontrol edin.</p>
        </div>
        <Link href="/" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors">
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="flex-shrink-0 bg-[#0f172a] border-b border-white/[0.06] relative">
        <div className="flex items-center justify-between px-3 sm:px-5 h-14 gap-2">

          {/* Sol: Logo */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Image src="/logo.svg" alt="TerapistBul" width={28} height={28} priority />
              <span className="text-sm font-bold whitespace-nowrap">
                <span className="text-blue-300">Terapist</span><span className="text-green-400">Bul</span>
              </span>
            </Link>

            <div className="hidden sm:block w-px h-4 bg-white/10" />

            <div className="hidden sm:flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-slate-300 text-xs font-medium">Canlı Seans</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg border border-white/[0.06]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="text-slate-300 text-xs truncate max-w-[180px]">{therapistName}</span>
            </div>
          </div>

          {/* Orta: Sayaç (mobilde sağa taşınır) */}
          <div className="hidden sm:flex items-center gap-4 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/[0.06]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className="text-slate-300 text-xs font-mono"><SessionTimer /></span>
            </div>
            <span className="text-slate-500 text-xs font-mono hidden md:block"><Clock /></span>
          </div>

          {/* Mobil: küçük sayaç */}
          <div className="flex sm:hidden items-center gap-1 px-2 py-1 bg-white/5 rounded-lg border border-white/[0.06]">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-slate-300 text-[11px] font-mono tabular-nums"><SessionTimer /></span>
          </div>

          {/* Sağ */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg border border-white/[0.06]">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span className="text-green-400 text-xs font-medium">Şifreli Bağlantı</span>
            </div>

            <Link
              href={leaveHref}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 text-xs font-medium rounded-xl transition-all"
              aria-label="Görüşmeden Ayrıl"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="hidden sm:inline">Görüşmeden Ayrıl</span>
              <span className="sm:hidden">Ayrıl</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Daily.co iframe */}
      <iframe
        src={iframeSrc}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        className="flex-1 w-full border-0"
        title={`${therapistName} ile Görüşme`}
      />
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
      <GorusmeContent />
    </Suspense>
  );
}
