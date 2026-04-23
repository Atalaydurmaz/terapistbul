'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { fmtDateTr, getJoinWindow } from '@/lib/date';

const statusConfig = {
  bekliyor:    { label: 'Bekliyor',    bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  onayli:      { label: 'Onaylı',      bg: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  iptal:       { label: 'İptal',       bg: 'bg-red-100 text-red-700',     dot: 'bg-red-500'   },
  tamamlandi:  { label: 'Tamamlandı',  bg: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500'  },
};

function HesabimInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get('tab');
  const initialTab =
    initialTabParam === 'randevular' ? 'randevular'
    : initialTabParam === 'yolculuk' ? 'yolculuk'
    : 'mesajlar';
  const [tab, setTab] = useState(initialTab);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [search, setSearch] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  // Toast ({ id, type, message }) — realtime onay bildirimleri için. Tek seferde
  // birden fazla toast yığılmasın diye basit single-slot kullanıyoruz.
  const [toast, setToast] = useState(null);
  // messages'i realtime callback içinde stale kalmadan okumak için ref tutuyoruz.
  // useEffect deps'ine `messages` eklemek subscription'ı her state değişiminde
  // tear down edip yeniden kurar — bu hem performans hem de race condition sorunu.
  const messagesRef = useRef([]);

  useEffect(() => {
    // 15 sn — countdown "dk" hassasiyetinde; 30 sn'de sayaç atladığı hissi
    // veriyordu. 15 sn hem pil dostu hem de yeterince "canlı" hissettiriyor.
    const id = setInterval(() => setNow(new Date()), 15 * 1000);
    return () => clearInterval(id);
  }, []);

  // messages ref'ini state ile senkron tut — realtime callback içinden stale
  // olmayan mevcut listeyi okumak için kullanıyoruz.
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Toast otomatik kapanma — 6 saniye sonra söner. Kullanıcı x'e basarsa hemen.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), type, message });
  }, []);

  const handleSend = async () => {
    if (!messageText.trim() || !selectedGroup) return;
    setSending(true);
    try {
      const res = await fetch('/api/hesabim/mesajlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: messageText.trim(),
          therapistName: selectedGroup.therapistName,
          therapistEmail: selectedGroup.messages[0]?.therapistEmail || '',
          type: 'mesaj',
        }),
      });
      const newMsg = await res.json();
      if (newMsg.id) {
        setMessages((prev) => [...prev, newMsg]);
        setMessageText('');
      }
    } catch { /* ignore */ }
    setSending(false);
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/hesabim/mesajlar/${id}`, { method: 'DELETE' });
    if (!res.ok) return;
    setMessages((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      const remaining = updated.filter((m) => m.therapistName === selectedTherapist);
      if (remaining.length === 0) {
        const groups = groupByTherapist(updated.filter((m) => m.type !== 'randevu'));
        setSelectedTherapist(groups[0]?.therapistName ?? null);
      }
      return updated;
    });
  };

  const loadMessages = useCallback(async () => {
    try {
      const r = await fetch('/api/hesabim/mesajlar');
      const data = await r.json();
      // Durum geçişi tespit — bekliyor → onayli olan randevu varsa toast göster.
      // Realtime event bazlı yerine fetch-sonrası karşılaştırma yapıyoruz çünkü
      // payload.new doğrudan gelse bile UI state ile senkron olmayabilir.
      setMessages((prev) => {
        try {
          const prevById = new Map(prev.map((m) => [m.id, m]));
          const newlyConfirmed = data.find((m) => {
            if (m.type !== 'randevu' || m.status !== 'onayli') return false;
            const before = prevById.get(m.id);
            return before && before.status !== 'onayli';
          });
          if (newlyConfirmed) {
            showToast(
              `Randevunuz ${newlyConfirmed.therapistName ? `(${newlyConfirmed.therapistName}) ` : ''}terapistiniz tarafından onaylandı! 🎉`,
              'success',
            );
          }
        } catch { /* ignore diff errors */ }
        return data;
      });
      setLoading(false);
      setSelectedTherapist((current) => {
        if (current) return current;
        const firstMsg = data.find((m) => m.type !== 'randevu');
        return firstMsg ? firstMsg.therapistName : null;
      });
    } catch {
      setLoading(false);
    }
  }, [showToast]);

  const loadInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const r = await fetch('/api/hesabim/session-insights');
      const data = await r.json();
      setInsights(Array.isArray(data) ? data : []);
    } catch {
      setInsights([]);
    }
    setInsightsLoading(false);
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && tab === 'yolculuk') loadInsights();
  }, [status, tab, loadInsights]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/giris');
      return;
    }
    if (status !== 'authenticated') return;

    loadMessages();

    const userEmail = session?.user?.email?.toLowerCase();
    if (!userEmail) return;

    // Realtime subscription — onaylı geçişini anlık yakalamak için.
    // Önceden `filter: email=eq.${userEmail}` kullanıyorduk ama Supabase Realtime
    // filtresi case-sensitive ve sütun null/farklı yazılırsa event hiç gelmiyor.
    // Artık tüm appointments UPDATE'lerini dinliyoruz ve server-side
    // /api/hesabim/mesajlar zaten email + isim eşlemesiyle filtreliyor.
    // Payload'daki new/old.email veya new/old.name viewer'la eşleşiyorsa veya
    // halihazırda listedeki bir randevunun id'si eşleşiyorsa refetch atıyoruz —
    // bu sayede her rastgele event için network'e gidip gelmiyoruz.
    const supabase = createClient();
    const channel = supabase
      .channel(`hesabim-${userEmail}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          const row = payload.new || payload.old || {};
          const rowEmail = (row.email || '').toLowerCase();
          const rowName = (row.name || '').toLowerCase();
          const viewerName = (session?.user?.name || '').toLowerCase();
          const knownId = messagesRef.current.some(
            (m) => m.id === row.id || m.supabaseId === row.id,
          );
          const mineByEmail = rowEmail && rowEmail === userEmail;
          const mineByName = viewerName && rowName && rowName.includes(viewerName.split(' ')[0]);
          if (knownId || mineByEmail || mineByName) {
            loadMessages();
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [status, router, session?.user?.email, session?.user?.name, loadMessages]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  function groupByTherapist(msgs) {
    const map = {};
    msgs.forEach((m) => {
      const key = m.therapistName || m.name;
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });
    return Object.entries(map).map(([name, items]) => {
      const sorted = items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      return {
        therapistName: name,
        messages: sorted,
        lastMessage: sorted[sorted.length - 1],
        initials: name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
      };
    });
  }

  const msgMessages = messages.filter((m) => m.type !== 'randevu');
  const randevular = messages.filter((m) => m.type === 'randevu');

  const groups = groupByTherapist(msgMessages);
  const filteredGroups = groups.filter((g) =>
    g.therapistName.toLowerCase().includes(search.toLowerCase())
  );
  const selectedGroup = groups.find((g) => g.therapistName === selectedTherapist);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      {/* Realtime toast — randevu onaylandığında alt-sağdan kayarak gelir.
          Mobile'da alt-orta, desktop'ta alt-sağ. aria-live ile screen reader'a
          da duyuruyoruz. */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-auto animate-[slideUp_0.3s_ease-out]"
          style={{ animation: 'slideUpFade 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div className={`flex items-start gap-3 p-4 pr-3 rounded-2xl shadow-lg border ${
            toast.type === 'success'
              ? 'bg-white border-emerald-200'
              : 'bg-white border-slate-200'
          }`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
            }`}>
              {toast.type === 'success' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-medium text-slate-800 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 -m-1"
              aria-label="Bildirimi kapat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <style jsx>{`
            @keyframes slideUpFade {
              from { opacity: 0; transform: translate(-50%, 20px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
            @media (min-width: 640px) {
              @keyframes slideUpFade {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
            }
          `}</style>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-teal-600 text-white text-xl font-bold flex items-center justify-center">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{session?.user?.name}</h1>
            <p className="text-sm text-slate-400">{session?.user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white rounded-2xl border border-slate-100 p-1.5 shadow-sm">
          {[
            { id: 'mesajlar', label: 'Mesajlarım', count: msgMessages.length },
            { id: 'randevular', label: 'Randevularım', count: randevular.length },
            { id: 'yolculuk', label: 'Seans Yolculuğum', count: insights.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Mesajlar tab */}
        {tab === 'mesajlar' && (
          msgMessages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-16">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-slate-500 text-sm">Henüz mesaj göndermediniz.</p>
              <Link href="/terapistler" className="mt-4 inline-block text-sm text-teal-600 hover:underline font-medium">
                Terapist bul
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex h-[520px]">
              {/* Left: therapist list */}
              <div className="w-64 flex-shrink-0 border-r border-slate-100 flex flex-col">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-800 mb-3 text-sm">Mesajlarım</h3>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Ara..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                  {filteredGroups.map((g) => (
                    <button
                      key={g.therapistName}
                      onClick={() => setSelectedTherapist(g.therapistName)}
                      className={`w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 transition-colors ${
                        selectedTherapist === g.therapistName ? 'bg-teal-50 border-r-2 border-teal-600' : ''
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {g.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{g.therapistName}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{g.lastMessage.note}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: message detail */}
              {selectedGroup ? (
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                      {selectedGroup.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{selectedGroup.therapistName}</p>
                      <p className="text-xs text-slate-400">{selectedGroup.messages.length} mesaj</p>
                    </div>
                    <Link href="/terapistler" className="ml-auto text-xs text-teal-600 hover:underline font-medium">
                      Yeni Mesaj
                    </Link>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {selectedGroup.messages.map((m) => {
                      const isFromTherapist = m.direction === 'therapist_to_user';
                      return (
                        <div key={m.id} className={`flex ${isFromTherapist ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-sm flex flex-col ${isFromTherapist ? 'items-start' : 'items-end'}`}>
                            {isFromTherapist && (
                              <span className="text-xs text-slate-400 mb-1 px-1">{m.therapistName || selectedTherapist}</span>
                            )}
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isFromTherapist
                                ? 'bg-slate-100 text-slate-800 rounded-tl-sm'
                                : 'bg-teal-600 text-white rounded-tr-sm'
                            }`}>
                              {m.note}
                            </div>
                            <div className={`flex items-center gap-2 mt-1 px-1 ${isFromTherapist ? '' : 'flex-row-reverse'}`}>
                              <span className="text-xs text-slate-400">
                                {new Date(m.createdAt).toLocaleDateString('tr-TR', {
                                  day: 'numeric', month: 'short',
                                  hour: '2-digit', minute: '2-digit',
                                })}
                              </span>
                              {!isFromTherapist && (
                                <button
                                  onClick={() => handleDelete(m.id)}
                                  className="text-slate-300 hover:text-red-400 transition-colors"
                                  title="Sil"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14H6L5 6" />
                                    <path d="M10 11v6M14 11v6" />
                                    <path d="M9 6V4h6v2" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-4 py-3 border-t border-slate-100 bg-white">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Mesajınızı yazın..."
                        rows={1}
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-slate-800"
                      />
                      <button
                        onClick={handleSend}
                        disabled={sending || !messageText.trim()}
                        className="p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 flex-shrink-0"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                  Bir konuşma seçin
                </div>
              )}
            </div>
          )
        )}

        {/* Randevular tab */}
        {tab === 'randevular' && (
          randevular.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-16">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-slate-500 text-sm">Henüz randevu almadınız.</p>
              <Link href="/terapistler" className="mt-4 inline-block text-sm text-teal-600 hover:underline font-medium">
                Terapist bul
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {randevular.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((r) => {
                const s = statusConfig[r.status] || statusConfig.bekliyor;
                const therapistInitials = (r.therapistName || '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
                return (
                  <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {therapistInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-slate-800">{r.therapistName}</span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                          {(r.selectedDay || r.selected_day) && (
                            <span className="flex items-center gap-1 text-teal-600 font-medium">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              {fmtDateTr(r.selectedDay || r.selected_day)}
                            </span>
                          )}
                          {(r.selectedHour || r.selected_hour) && (
                            <span className="flex items-center gap-1 text-teal-600 font-medium">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              {r.selectedHour || r.selected_hour}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            Talep: {new Date(r.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      {r.status === 'onayli' && (() => {
                        const day = r.selectedDay || r.selected_day;
                        const hour = r.selectedHour || r.selected_hour;
                        const { canJoin, isExpired, start } = getJoinWindow(day, hour, now);
                        const sessionId = r.supabaseId || r.id;
                        const isPaid = r.paymentStatus === 'paid';
                        const isRefunded = r.paymentStatus === 'refunded';
                        const hasRoom = !!r.daily_room_url;

                        // Görüşmeye kalan süre — "1 gün 3 sa", "45 dk", "Şimdi başlıyor"
                        // gibi insan-okunabilir bir ifade üret. now her 30 sn'de bir
                        // güncellendiği için otomatik sayım yapıyor.
                        let countdownLabel = null;
                        if (start) {
                          const diffMs = start.getTime() - now.getTime();
                          const absMin = Math.floor(Math.abs(diffMs) / 60000);
                          if (diffMs <= 0 && !isExpired) {
                            countdownLabel = 'Görüşme başladı — şimdi katılabilirsiniz';
                          } else if (diffMs > 0) {
                            const days = Math.floor(absMin / (60 * 24));
                            const hours = Math.floor((absMin % (60 * 24)) / 60);
                            const mins = absMin % 60;
                            const parts = [];
                            if (days > 0) parts.push(`${days} gün`);
                            if (hours > 0) parts.push(`${hours} sa`);
                            if (days === 0 && mins > 0) parts.push(`${mins} dk`);
                            countdownLabel = `Görüşmeye ${parts.join(' ') || '1 dk'} kaldı`;
                          }
                        }

                        if (isRefunded) {
                          return (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 text-sm font-medium rounded-xl">
                                Ödeme iade edildi
                              </span>
                            </div>
                          );
                        }

                        if (isExpired) {
                          return (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 text-sm font-medium rounded-xl">
                                Görüşme süresi sona erdi
                              </span>
                            </div>
                          );
                        }

                        // Onaylı randevu — görüşme linki her zaman aktif (maildeki
                        // link gibi). daily_room_url henüz oluşmadıysa butonu pasif
                        // gösterip "Bağlantı hazırlanıyor" mesajı veriyoruz; Realtime
                        // tetiklenince zaten yeniden render olacak.
                        return (
                          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                            {canJoin && (
                              hasRoom ? (
                                <Link
                                  href={`/panel/session/${sessionId}`}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                                  </svg>
                                  Görüşmeye Katıl
                                </Link>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 text-sm font-medium rounded-xl cursor-wait"
                                  title="Görüşme odası hazırlanıyor, birkaç saniye içinde aktif olacak"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                  </svg>
                                  Bağlantı hazırlanıyor, lütfen bekleyin.
                                </span>
                              )
                            )}
                            {countdownLabel && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-100 text-xs font-medium rounded-lg">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                {countdownLabel}
                              </span>
                            )}
                            {isPaid ? (
                              <span className="text-xs text-green-600 font-medium">✓ Ödendi</span>
                            ) : (
                              <Link
                                href={`/odeme/${sessionId}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-medium rounded-lg transition-colors"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                  <line x1="1" y1="10" x2="23" y2="10" />
                                </svg>
                                Ödeme Yap{r.price ? ` · ${r.price.toLocaleString('tr-TR')} ₺` : ''}
                              </Link>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Seans Yolculuğum tab */}
        {tab === 'yolculuk' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                    <path d="M12 2l2.39 4.84L20 8l-4 3.9.95 5.55L12 14.77 7.05 17.45 8 11.9 4 8l5.61-1.16L12 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">Seans Yolculuğum</h2>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Terapistinizin seanslardan sonra sizinle paylaşmayı uygun gördüğü
                    destekleyici özetler burada toplanır. Bu özetler sizi cesaretlendirmek
                    ve iki seans arası küçük adımlar atmanıza yardımcı olmak içindir.
                  </p>
                </div>
              </div>
            </div>

            {insightsLoading ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-16">
                <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : insights.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-16">
                <div className="text-4xl mb-3">🌱</div>
                <p className="text-slate-500 text-sm">Henüz paylaşılmış bir seans özeti yok.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Terapistiniz bir özet paylaştığında burada görünecek.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-5">
                <div className="absolute top-2 bottom-2 left-2 w-px bg-gradient-to-b from-emerald-300 via-teal-200 to-transparent" />
                {insights.map((ins) => {
                  const dateStr = ins.selectedDay
                    ? fmtDateTr(ins.selectedDay)
                    : ins.sharedAt
                      ? new Date(ins.sharedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '';
                  return (
                    <div key={ins.id} className="relative">
                      <div className="absolute -left-[19px] top-2 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                          <div>
                            <p className="font-semibold text-slate-800">{ins.therapistName || 'Terapistiniz'}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {dateStr}{ins.selectedHour ? ` · ${ins.selectedHour}` : ''}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 text-xs font-medium">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Paylaşıldı
                          </span>
                        </div>
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {ins.clientSummary}
                        </div>
                        {ins.sharedAt && (
                          <p className="text-xs text-slate-400 mt-3">
                            {new Date(ins.sharedAt).toLocaleDateString('tr-TR', {
                              day: 'numeric', month: 'long', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })} tarihinde paylaşıldı
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HesabimPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Yükleniyor...</div>}>
      <HesabimInner />
    </Suspense>
  );
}
