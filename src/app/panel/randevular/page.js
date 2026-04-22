'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRealtimeTable } from '@/hooks/useRealtimeTable';
import { fmtDateTr, getJoinWindow } from '@/lib/date';
import Link from 'next/link';

const colors = [
  'bg-blue-100 text-blue-700',
  'bg-pink-100 text-pink-700',
  'bg-amber-100 text-amber-700',
  'bg-green-100 text-green-700',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
  'bg-teal-100 text-teal-700',
];

const filterTabs = [
  { id: 'tumu', label: 'Tümü', count: 8 },
  { id: 'bekliyor', label: 'Bekliyor', count: 3 },
  { id: 'onayli', label: 'Onaylı', count: 4 },
  { id: 'iptal', label: 'İptal', count: 1 },
];

const statusConfig = {
  onayli: { label: 'Onaylı', bg: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  bekliyor: { label: 'Bekliyor', bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  iptal: { label: 'İptal', bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  tamamlandi: { label: 'Tamamlandı', bg: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
};

export default function RandevularPage() {
  const [activeFilter, setActiveFilter] = useState('tumu');
  const [appointments, setAppointments] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [therapistName, setTherapistName] = useState('Terapist');
  const [ratingModal, setRatingModal] = useState(null); // { aptId, hover, selected }
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [notesDraft, setNotesDraft] = useState({}); // { [aptId]: string }
  const [notesSaved, setNotesSaved] = useState({}); // { [aptId]: boolean }
  const notesTimers = useRef({});
  const [now, setNow] = useState(() => new Date());
  const [aiModal, setAiModal] = useState(null); // { apt, rawText, aiText, status, loading, error }

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(id);
  }, []);

  const saveNotes = useCallback(async (aptId, val) => {
    await fetch(`/api/panel/randevular/${aptId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_notes: val }),
    });
    setAppointments((prev) => prev.map((a) => a.id === aptId ? { ...a, sessionNotes: val } : a));
    setNotesSaved((s) => ({ ...s, [aptId]: true }));
    setTimeout(() => setNotesSaved((s) => ({ ...s, [aptId]: false })), 2000);
  }, []);

  const handleNotesChange = (aptId, val) => {
    setNotesDraft((d) => ({ ...d, [aptId]: val }));
    clearTimeout(notesTimers.current[aptId]);
    notesTimers.current[aptId] = setTimeout(() => { saveNotes(aptId, val); }, 1000);
  };

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('panel_user') || '{}');
      if (u.name) setTherapistName(u.name);
    } catch {}
  }, []);

  const load = useCallback(() => {
    fetch('/api/panel/messages')
      .then((r) => r.json())
      .then((msgs) => {
        const randevular = msgs
          .filter((m) => m.type === 'randevu')
          .map((m, i) => ({
            id: m.id,
            name: m.name,
            initials: (m.name || '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
            date: new Date(m.created_at || m.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
            time: m.selected_hour || m.selectedHour || '—',
            selectedDay: m.selected_day || m.selectedDay || '',
            duration: 50,
            type: 'online',
            status: m.status || 'bekliyor',
            color: colors[i % colors.length],
            email: m.email,
            note: m.note,
            dailyRoomUrl: m.daily_room_url || null,
            therapistRating: m.therapist_rating || null,
            clientRating: m.client_rating || null,
            sessionNotes: m.session_notes || '',
          }));
        setAppointments(randevular);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  // Realtime — terapist randevu onaylayınca admin da görür, admin değiştirince terapist de görür
  useRealtimeTable('appointments', load);

  const filtered = activeFilter === 'tumu'
    ? appointments
    : appointments.filter((a) => a.status === activeFilter);

  const updateStatus = async (id, status) => {
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    await fetch(`/api/panel/randevular/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  };

  const handleApprove = (id) => updateStatus(id, 'onayli');
  const handleCancel = (id) => updateStatus(id, 'iptal');

  const handleRatingSubmit = async () => {
    if (!ratingModal?.selected) return;
    setRatingSubmitting(true);
    await fetch(`/api/panel/randevular/${ratingModal.aptId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ therapist_rating: ratingModal.selected }),
    });
    setAppointments((prev) => prev.map((a) =>
      a.id === ratingModal.aptId ? { ...a, therapistRating: ratingModal.selected } : a
    ));
    setRatingSubmitting(false);
    setRatingModal(null);
  };

  const counts = {
    onayli: appointments.filter((a) => a.status === 'onayli').length,
    bekliyor: appointments.filter((a) => a.status === 'bekliyor').length,
    iptal: appointments.filter((a) => a.status === 'iptal').length,
    tamamlandi: appointments.filter((a) => a.status === 'tamamlandi').length,
  };

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Onaylı', count: counts.onayli, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
          { label: 'Bekliyor', count: counts.bekliyor, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
          { label: 'Tamamlandı', count: counts.tamamlandi, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
          { label: 'İptal', count: counts.iptal, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-2xl border shadow-sm p-4 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-slate-500 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Filter tabs */}
        <div className="border-b border-slate-100 px-5 flex gap-1 overflow-x-auto">
          {filterTabs.map((tab) => {
            const count = tab.id === 'tumu' ? appointments.length : appointments.filter((a) => a.status === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeFilter === tab.id
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  activeFilter === tab.id ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Appointment cards */}
        <div className="divide-y divide-slate-50">
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">Bu filtrede randevu bulunmuyor.</div>
          )}
          {filtered.map((apt) => {
            const s = statusConfig[apt.status];
            return (
              <div key={apt.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${apt.color}`}>
                    {apt.initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <span className="font-semibold text-slate-800">{apt.name}</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${apt.type === 'online' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
                          {apt.type === 'online' ? 'Online' : 'Yüz Yüze'}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      {apt.selectedDay && (
                        <span className="flex items-center gap-1 font-medium text-teal-600">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {fmtDateTr(apt.selectedDay)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {apt.time}
                      </span>
                      <span className="text-xs text-slate-400">Talep: {apt.date}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {apt.status === 'bekliyor' && (
                      <>
                        <button
                          onClick={() => handleApprove(apt.id)}
                          className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-medium transition-colors"
                        >
                          Onayla
                        </button>
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors"
                        >
                          İptal Et
                        </button>
                      </>
                    )}
                    {apt.status === 'onayli' && (() => {
                      const { canJoin, minutesUntilOpen, isExpired, start } = getJoinWindow(apt.selectedDay, apt.time, now);
                      // Show "Seansı Tamamla" only after the session has started —
                      // therapist shouldn't be able to mark it completed before the
                      // appointment time actually arrives. canJoin begins 10 min
                      // before start; we gate on the real start time.
                      const sessionStarted = !!(start && now.getTime() >= start.getTime());
                      return (
                        <>
                          {canJoin && (
                            <Link
                              href={`/panel/session/${apt.id}`}
                              className="px-3 py-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                              </svg>
                              Görüşmeyi Başlat
                            </Link>
                          )}
                          {!canJoin && isExpired && (
                            <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium flex items-center gap-1">
                              Süresi Doldu
                            </span>
                          )}
                          {!canJoin && !isExpired && (
                            <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium flex items-center gap-1 cursor-not-allowed" title="Seansın başlamasına 10 dk kala aktif olur">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              {minutesUntilOpen > 60
                                ? `${Math.floor(minutesUntilOpen / 60)} sa ${minutesUntilOpen % 60} dk`
                                : `${minutesUntilOpen} dk`}
                            </span>
                          )}
                          {sessionStarted && (
                            <button
                              onClick={() => updateStatus(apt.id, 'tamamlandi')}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Seansı Tamamla
                            </button>
                          )}
                          <button
                            onClick={() => handleCancel(apt.id)}
                            className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors"
                          >
                            İptal Et
                          </button>
                        </>
                      );
                    })()}
                    {apt.status === 'tamamlandi' && (
                      <>
                        <button
                          onClick={() => setAiModal({
                            apt,
                            rawText: apt.sessionNotes || '',
                            aiText: '',
                            status: 'idle',
                            error: '',
                            noteId: null,
                          })}
                          className="px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                          title="Yapay zeka ile SOAP formatında özet oluştur"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                          </svg>
                          AI Özet
                        </button>
                        {apt.therapistRating ? (
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                            {[1,2,3,4,5].map((s) => (
                              <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= apt.therapistRating ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                            ))}
                          </div>
                        ) : (
                          <button
                            onClick={() => setRatingModal({ aptId: apt.id, hover: 0, selected: 0 })}
                            className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            Puan Ver
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => setSelectedDetail(apt.id === selectedDetail ? null : apt.id)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      Detay
                    </button>
                  </div>
                </div>

                {/* Detail expand */}
                {selectedDetail === apt.id && (
                  <div className="mt-4 ml-15 pl-4 sm:pl-15 border-l-2 border-teal-100">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl text-sm">
                      <div>
                        <p className="text-slate-400 text-xs mb-0.5">Danışan</p>
                        <p className="font-medium text-slate-700">{apt.name}</p>
                      </div>
                      {apt.selectedDay && (
                        <div>
                          <p className="text-slate-400 text-xs mb-0.5">Randevu Günü</p>
                          <p className="font-medium text-teal-700">{fmtDateTr(apt.selectedDay)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-slate-400 text-xs mb-0.5">Randevu Saati</p>
                        <p className="font-medium text-teal-700">{apt.time}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs mb-0.5">Talep Tarihi</p>
                        <p className="font-medium text-slate-700">{apt.date}</p>
                      </div>
                      {apt.email && (
                        <div>
                          <p className="text-slate-400 text-xs mb-0.5">E-posta</p>
                          <p className="font-medium text-slate-700">{apt.email}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-slate-400 text-xs mb-0.5">Durum</p>
                        <p className="font-medium text-slate-700">{statusConfig[apt.status].label}</p>
                      </div>
                    </div>
                    <div className="mt-3 p-4 bg-teal-50 border border-teal-100 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          <p className="text-teal-700 text-xs font-semibold uppercase tracking-wide">Seans Notlarım</p>
                        </div>
                        {notesSaved[apt.id] && (
                          <span className="text-green-600 text-xs flex items-center gap-1">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Kaydedildi
                          </span>
                        )}
                      </div>
                      <textarea
                        value={notesDraft[apt.id] !== undefined ? notesDraft[apt.id] : (apt.sessionNotes || '')}
                        onChange={(e) => handleNotesChange(apt.id, e.target.value)}
                        placeholder="Bu seansa dair notlarınızı buraya yazın veya düzenleyin... (otomatik kaydedilir)"
                        rows={5}
                        className="w-full bg-white border border-teal-100 rounded-lg px-3 py-2 text-slate-700 text-sm leading-relaxed resize-y outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 placeholder-slate-400"
                        spellCheck={false}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-slate-400 text-xs">
                          {((notesDraft[apt.id] !== undefined ? notesDraft[apt.id] : (apt.sessionNotes || '')).length)} karakter · otomatik kaydedilir
                        </span>
                        <button
                          type="button"
                          onClick={() => saveNotes(apt.id, notesDraft[apt.id] !== undefined ? notesDraft[apt.id] : (apt.sessionNotes || ''))}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          Kaydet
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Puan Ver Modal */}
      {ratingModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-80 flex flex-col items-center gap-5">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-200">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-slate-800 text-base">Danışanı Değerlendir</h3>
            <p className="text-slate-400 text-sm mt-1">Bu puan sadece sizin görebileceğiniz notlara eklenir</p>
          </div>
          <div className="flex items-center gap-2">
            {[1,2,3,4,5].map((s) => (
              <button
                key={s}
                onMouseEnter={() => setRatingModal((r) => ({ ...r, hover: s }))}
                onMouseLeave={() => setRatingModal((r) => ({ ...r, hover: 0 }))}
                onClick={() => setRatingModal((r) => ({ ...r, selected: s }))}
                className="transition-transform hover:scale-110"
              >
                <svg width="32" height="32" viewBox="0 0 24 24"
                  fill={s <= (ratingModal.hover || ratingModal.selected) ? '#f59e0b' : 'none'}
                  stroke="#f59e0b" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            ))}
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setRatingModal(null)}
              className="flex-1 py-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl transition-colors"
            >
              Vazgeç
            </button>
            <button
              onClick={handleRatingSubmit}
              disabled={!ratingModal.selected || ratingSubmitting}
              className="flex-1 py-2 text-sm text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-40 rounded-xl font-medium transition-colors"
            >
              {ratingSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
      )}

      {/* AI Özet Modal */}
      {aiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">AI Seans Özeti</h3>
                <p className="text-xs text-slate-400">{aiModal.apt.name} · Klinik (SOAP) + Danışan Özeti</p>
              </div>
              <button
                onClick={() => setAiModal(null)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-900">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <div>
                  <p className="font-semibold">Gizlilik</p>
                  <p className="text-blue-800/90 leading-relaxed">
                    İsimler, e-posta, telefon ve TCKN gibi kişisel veriler AI'ya gönderilmeden önce
                    otomatik olarak maskelenir. Çıktı sadece size görünür.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Hızlı Notlarınız / Transkript
                </label>
                <textarea
                  value={aiModal.rawText}
                  onChange={(e) => setAiModal((m) => ({ ...m, rawText: e.target.value }))}
                  rows={6}
                  placeholder="Seansa dair hızlı notlarınızı veya transkript parçalarını buraya yapıştırın..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 leading-relaxed resize-y outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  spellCheck={false}
                />
                <p className="text-xs text-slate-400 mt-1">{aiModal.rawText.length} karakter (maks 12000)</p>
              </div>

              {aiModal.error && (
                <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-red-700 text-xs">
                  {aiModal.error}
                </div>
              )}

              {aiModal.aiText && (
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 text-violet-700 px-2 py-0.5 text-[10px]">
                      SADECE TERAPİST
                    </span>
                    Klinik SOAP Notu (danışanla paylaşılmaz)
                  </label>
                  <textarea
                    value={aiModal.aiText}
                    onChange={(e) => setAiModal((m) => ({ ...m, aiText: e.target.value }))}
                    rows={12}
                    className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-sm text-slate-700 leading-relaxed resize-y outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 font-mono"
                    spellCheck={false}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Klinik dille, sadece dosyanızda saklanır. Bu alan hiçbir zaman danışana gönderilmez.
                  </p>
                </div>
              )}

              {aiModal.aiText && (
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px]">
                      DANIŞANA GÖSTERİLECEK
                    </span>
                    Danışan Özeti (onayınızdan sonra paylaşılır)
                  </label>
                  <textarea
                    value={aiModal.clientText || ''}
                    onChange={(e) => setAiModal((m) => ({ ...m, clientText: e.target.value }))}
                    rows={10}
                    placeholder="Destekleyici, cesaretlendirici dil. Ev ödevi ve küçük adımlar..."
                    className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-sm text-slate-700 leading-relaxed resize-y outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    spellCheck={false}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Gözden geçirip düzenleyebilirsiniz. "Danışanla Paylaş" butonu ile danışanın
                    "Seans Yolculuğum" sayfasında görünür hale gelir.
                  </p>
                  {aiModal.shared && (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Danışanla paylaşıldı
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => setAiModal(null)}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl transition-colors"
              >
                Kapat
              </button>
              {!aiModal.aiText ? (
                <button
                  onClick={async () => {
                    if (aiModal.rawText.trim().length < 10) {
                      setAiModal((m) => ({ ...m, error: 'En az 10 karakter not girin' }));
                      return;
                    }
                    setAiModal((m) => ({ ...m, status: 'loading', error: '' }));
                    try {
                      const res = await fetch('/api/panel/ai-summarize', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          appointmentId: aiModal.apt.id,
                          raw_text: aiModal.rawText,
                        }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || 'AI özeti alınamadı');
                      setAiModal((m) => ({
                        ...m,
                        aiText: data.ai_summary,
                        clientText: data.client_summary || '',
                        noteId: data.noteId,
                        status: 'ready',
                      }));
                    } catch (e) {
                      setAiModal((m) => ({ ...m, status: 'idle', error: e.message }));
                    }
                  }}
                  disabled={aiModal.status === 'loading'}
                  className="px-4 py-2 text-sm text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-60 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  {aiModal.status === 'loading' ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      AI Çalışıyor...
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                      Özeti Oluştur
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={async () => {
                      try {
                        await fetch(`/api/panel/session-notes/${aiModal.apt.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            noteId: aiModal.noteId,
                            raw_text: aiModal.rawText,
                            ai_summary: aiModal.aiText,
                            client_summary: aiModal.clientText || '',
                            status: 'draft',
                          }),
                        });
                        // randevuya da kısa özeti ana not olarak yaz (sadece SOAP)
                        await saveNotes(aiModal.apt.id, aiModal.aiText);
                        setAiModal(null);
                      } catch (e) {
                        setAiModal((m) => ({ ...m, error: e.message }));
                      }
                    }}
                    className="px-4 py-2 text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                  >
                    Taslak Kaydet
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await fetch(`/api/panel/session-notes/${aiModal.apt.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            noteId: aiModal.noteId,
                            raw_text: aiModal.rawText,
                            ai_summary: aiModal.aiText,
                            client_summary: aiModal.clientText || '',
                            status: 'final',
                          }),
                        });
                        await saveNotes(aiModal.apt.id, aiModal.aiText);
                        setAiModal(null);
                      } catch (e) {
                        setAiModal((m) => ({ ...m, error: e.message }));
                      }
                    }}
                    className="px-4 py-2 text-sm text-white bg-teal-600 hover:bg-teal-700 rounded-xl font-medium transition-colors"
                  >
                    Final Olarak Kaydet
                  </button>
                  <button
                    onClick={async () => {
                      if (!(aiModal.clientText || '').trim()) {
                        setAiModal((m) => ({ ...m, error: 'Danışan özeti boş — önce içeriği doldurun.' }));
                        return;
                      }
                      try {
                        await fetch(`/api/panel/session-notes/${aiModal.apt.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            noteId: aiModal.noteId,
                            raw_text: aiModal.rawText,
                            ai_summary: aiModal.aiText,
                            client_summary: aiModal.clientText,
                            shared_with_client: true,
                            status: 'final',
                          }),
                        });
                        setAiModal((m) => ({ ...m, shared: true, error: '' }));
                      } catch (e) {
                        setAiModal((m) => ({ ...m, error: e.message }));
                      }
                    }}
                    className="px-4 py-2 text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl font-medium transition-colors flex items-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Danışanla Paylaş
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

