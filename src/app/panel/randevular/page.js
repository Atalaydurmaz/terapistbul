'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRealtimeTable } from '@/hooks/useRealtimeTable';
import { fmtDateTr } from '@/lib/date';

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
                    {apt.status === 'onayli' && (
                      <>
                        {apt.dailyRoomUrl && (
                          <a
                            href={`/panel/gorusme?room=${encodeURIComponent(apt.dailyRoomUrl)}&name=${encodeURIComponent(apt.name)}&terapist=${encodeURIComponent(therapistName)}&id=${apt.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                            </svg>
                            Görüşmeyi Başlat
                          </a>
                        )}
                        <button
                          onClick={() => updateStatus(apt.id, 'tamamlandi')}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Seansı Tamamla
                        </button>
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors"
                        >
                          İptal Et
                        </button>
                      </>
                    )}
                    {apt.status === 'tamamlandi' && (
                      <>
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
    </div>
  );
}

