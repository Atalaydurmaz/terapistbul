'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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

export default function SessionPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apt, setApt] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [ending, setEnding] = useState(false);
  const [mutedVideo, setMutedVideo] = useState(false);
  const [mutedAudio, setMutedAudio] = useState(false);

  const callRef = useRef(null);
  const containerRef = useRef(null);
  const chatListRef = useRef(null);

  // Oturum verisini çek
  useEffect(() => {
    if (!id) return;
    fetch(`/api/session/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || 'Yüklenemedi');
        return r.json();
      })
      .then((data) => {
        setApt(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [id]);

  // Daily.co çağrısını başlat
  useEffect(() => {
    if (!apt?.roomUrl || !containerRef.current || callRef.current) return;
    let call;
    let cancelled = false;

    (async () => {
      const DailyIframe = (await import('@daily-co/daily-js')).default;
      if (cancelled) return;

      const userName = apt.viewerRole === 'therapist'
        ? (apt.therapistName || 'Terapist')
        : (apt.clientName || 'Danışan');

      call = DailyIframe.createFrame(containerRef.current, {
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: '0',
          backgroundColor: '#0f172a',
        },
        showLeaveButton: false,
        showFullscreenButton: true,
        showParticipantsBar: false,
        showUserNameChangeUI: false,
        theme: {
          colors: {
            accent: '#0d9488',
            accentText: '#FFFFFF',
            background: '#0f172a',
            backgroundAccent: '#134e4a',
            baseText: '#e2e8f0',
            border: 'rgba(255,255,255,0.06)',
            mainAreaBg: '#0f172a',
            mainAreaBgAccent: '#111827',
            mainAreaText: '#f1f5f9',
            supportiveText: '#94a3b8',
          },
        },
      });
      callRef.current = call;

      call.on('app-message', (ev) => {
        const { data, fromId } = ev || {};
        if (!data) return;
        if (data.kind === 'chat') {
          setMessages((prev) => [...prev, { from: data.from || 'Karşı Taraf', text: data.text, mine: false, at: Date.now() }]);
          setChatOpen(true);
        } else if (data.kind === 'session-ended') {
          // Terapist seansı bitirdi — danışanı rating'e yönlendir
          router.replace(`/gorusme/puan-ver?id=${id}&terapist=${encodeURIComponent(apt.therapistName || '')}`);
        }
      });

      call.on('left-meeting', () => {
        // Herhangi biri ayrılırsa rating sayfasına yönlendir
        router.replace(`/gorusme/puan-ver?id=${id}&terapist=${encodeURIComponent(apt.therapistName || '')}`);
      });

      await call.join({ url: apt.roomUrl, userName });
    })();

    return () => {
      cancelled = true;
      if (call) {
        try { call.destroy(); } catch {}
      }
      callRef.current = null;
    };
  }, [apt, id, router]);

  // Chat scroll
  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages, chatOpen]);

  const sendChat = useCallback(() => {
    const text = input.trim();
    if (!text || !callRef.current) return;
    const fromName = apt?.viewerRole === 'therapist'
      ? (apt.therapistName || 'Terapist')
      : (apt.clientName || 'Danışan');
    try {
      callRef.current.sendAppMessage({ kind: 'chat', from: fromName, text }, '*');
    } catch {}
    setMessages((prev) => [...prev, { from: 'Siz', text, mine: true, at: Date.now() }]);
    setInput('');
  }, [input, apt]);

  const toggleVideo = useCallback(() => {
    if (!callRef.current) return;
    const next = !mutedVideo;
    try { callRef.current.setLocalVideo(!next); } catch {}
    setMutedVideo(next);
  }, [mutedVideo]);

  const toggleAudio = useCallback(() => {
    if (!callRef.current) return;
    const next = !mutedAudio;
    try { callRef.current.setLocalAudio(!next); } catch {}
    setMutedAudio(next);
  }, [mutedAudio]);

  const endSession = useCallback(async () => {
    if (ending) return;
    setEnding(true);
    try {
      // Karşı tarafa haber ver
      try {
        callRef.current?.sendAppMessage({ kind: 'session-ended' }, '*');
      } catch {}
      // DB'de tamamlandı olarak işaretle
      await fetch(`/api/session/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end' }),
      });
      try { await callRef.current?.leave(); } catch {}
    } catch {}
    router.replace(`/gorusme/puan-ver?id=${id}&terapist=${encodeURIComponent(apt?.therapistName || '')}`);
  }, [id, apt, router, ending]);

  const leaveClient = useCallback(async () => {
    try { await callRef.current?.leave(); } catch {}
    router.replace(`/gorusme/puan-ver?id=${id}&terapist=${encodeURIComponent(apt?.therapistName || '')}`);
  }, [id, apt, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f172a] text-white">
        <div className="flex items-center gap-3">
          <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <span className="text-slate-300 text-sm">Görüşme yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error || !apt?.roomUrl) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white gap-6 p-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold">Görüşmeye erişilemedi</h1>
          <p className="text-slate-400 text-sm mt-1">{error || 'Görüşme odası henüz hazır değil.'}</p>
        </div>
        <Link href="/" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors">
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  const isTherapist = apt.viewerRole === 'therapist';
  const counterpartName = isTherapist ? (apt.clientName || 'Danışan') : (apt.therapistName || 'Terapist');

  return (
    <div className="flex flex-col h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="flex-shrink-0 bg-[#0f172a] border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-3 sm:px-5 h-14 gap-2">
          {/* Sol: Logo + canlı rozet */}
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
              <span className="text-slate-300 text-xs truncate max-w-[180px]">{counterpartName}</span>
            </div>
          </div>

          {/* Orta: Sayaç */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/[0.06]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="text-slate-300 text-xs font-mono"><SessionTimer /></span>
          </div>

          {/* Sağ: Chat + Bitir */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChatOpen((o) => !o)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 border text-xs font-medium rounded-xl transition-all ${
                chatOpen
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/[0.06]'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span className="hidden sm:inline">Sohbet</span>
              {messages.filter((m) => !m.mine).length > 0 && !chatOpen && (
                <span className="ml-0.5 w-4 h-4 bg-teal-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {messages.filter((m) => !m.mine).length}
                </span>
              )}
            </button>

            {isTherapist ? (
              <button
                onClick={endSession}
                disabled={ending}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-400 border border-red-500/20 hover:border-red-500/40 text-xs font-medium rounded-xl transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 14s1 1 4 1 4-1 4-1"/><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span className="hidden sm:inline">Seansı Bitir</span>
                <span className="sm:hidden">Bitir</span>
              </button>
            ) : (
              <button
                onClick={leaveClient}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 text-xs font-medium rounded-xl transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span className="hidden sm:inline">Ayrıl</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main area */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Daily.co call container */}
        <div ref={containerRef} className="flex-1 min-w-0 bg-[#0f172a]" />

        {/* Side chat */}
        {chatOpen && (
          <aside className="absolute inset-y-0 right-0 w-full sm:w-80 sm:relative bg-[#0b1220] border-l border-white/[0.06] flex flex-col z-10">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span className="text-slate-200 text-xs font-semibold">Seans Sohbeti</span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="Kapat"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div ref={chatListRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {messages.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-6">Henüz mesaj yok. İlk mesajı siz gönderin.</p>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.mine ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-slate-500 mb-0.5 px-1">{m.from}</span>
                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-snug break-words ${
                      m.mine
                        ? 'bg-teal-600 text-white rounded-br-sm'
                        : 'bg-white/5 text-slate-200 rounded-bl-sm border border-white/[0.06]'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); sendChat(); }}
              className="flex items-center gap-2 px-3 py-3 border-t border-white/[0.06]"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Mesaj yazın..."
                className="flex-1 bg-white/5 border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/40"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-9 h-9 flex items-center justify-center bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl transition-colors"
                aria-label="Gönder"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
}
