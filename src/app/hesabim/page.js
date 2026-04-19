'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const statusConfig = {
  bekliyor: { label: 'Bekliyor', bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  onayli:   { label: 'Onaylı',   bg: 'bg-green-100 text-green-700',  dot: 'bg-green-500'  },
  iptal:    { label: 'İptal',    bg: 'bg-red-100 text-red-700',      dot: 'bg-red-500'    },
};

export default function HesabimPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState('mesajlar');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [search, setSearch] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

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
      setMessages(data);
      setLoading(false);
      setSelectedTherapist((current) => {
        if (current) return current;
        const firstMsg = data.find((m) => m.type !== 'randevu');
        return firstMsg ? firstMsg.therapistName : null;
      });
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/giris');
      return;
    }
    if (status !== 'authenticated') return;

    loadMessages();

    const userEmail = session?.user?.email?.toLowerCase();
    if (!userEmail) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`hesabim-${userEmail}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `email=eq.${userEmail}` },
        loadMessages,
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [status, router, session?.user?.email, loadMessages]);

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
                              {r.selectedDay || r.selected_day}
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
                      {r.status === 'onayli' && r.daily_room_url && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <a
                            href={`/gorusme?room=${encodeURIComponent(r.daily_room_url)}&terapist=${encodeURIComponent(r.therapistName || '')}&name=${encodeURIComponent(session?.user?.name || 'Danışan')}&id=${r.supabaseId || r.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                            </svg>
                            Görüşmeye Katıl
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
