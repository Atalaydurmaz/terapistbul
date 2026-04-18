'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRealtimeTable } from '@/hooks/useRealtimeTable';

const tabs = ['Tümü', 'Bekliyor', 'Onaylı', 'İptal'];

const statusBadge = (s) => {
  const map = {
    bekliyor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    onayli: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    iptal: 'bg-red-500/20 text-red-300 border-red-500/30',
    tamamlandi: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  };
  const labels = { bekliyor: 'Bekliyor', onayli: 'Onaylı', iptal: 'İptal', tamamlandi: 'Tamamlandı' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${map[s] || 'bg-slate-600/50 text-slate-400 border-slate-600'}`}>
      {labels[s] || s}
    </span>
  );
};

export default function AdminRandevularPage() {
  const [activeTab, setActiveTab] = useState('Tümü');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/randevular');
      const data = await res.json();
      setAppointments(data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Realtime — DB değişince anında güncelle
  useRealtimeTable('appointments', load);

  const handleStatus = async (id, status) => {
    setAppointments((prev) => prev.map((a) => String(a.id) === String(id) ? { ...a, status } : a));
    await fetch(`/api/randevular/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  };

  const tabKey = (tab) => {
    if (tab === 'Bekliyor') return 'bekliyor';
    if (tab === 'Onaylı') return 'onayli';
    if (tab === 'İptal') return 'iptal';
    return null;
  };

  const filtered = activeTab === 'Tümü'
    ? appointments
    : appointments.filter((a) => a.status === tabKey(activeTab));

  const stats = {
    total: appointments.length,
    onayli: appointments.filter((a) => a.status === 'onayli').length,
    bekliyor: appointments.filter((a) => a.status === 'bekliyor').length,
    iptal: appointments.filter((a) => a.status === 'iptal').length,
    tamamlandi: appointments.filter((a) => a.status === 'tamamlandi').length,
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Toplam Randevu', value: stats.total, color: 'text-white', border: 'border-slate-700' },
          { label: 'Onaylı', value: stats.onayli, color: 'text-teal-400', border: 'border-teal-500/20' },
          { label: 'Bekliyor', value: stats.bekliyor, color: 'text-amber-400', border: 'border-amber-500/20' },
          { label: 'İptal', value: stats.iptal, color: 'text-red-400', border: 'border-red-500/20' },
          { label: 'Tamamlandı', value: stats.tamamlandi, color: 'text-blue-400', border: 'border-blue-500/20' },
        ].map((s) => (
          <div key={s.label} className={`bg-slate-800/60 border ${s.border} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
        <div className="flex gap-2 flex-wrap items-center">
          {tabs.map((tab) => {
            const count = tab === 'Tümü' ? appointments.length : appointments.filter((a) => a.status === tabKey(tab)).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'text-slate-400 hover:bg-slate-700 border border-transparent'
                }`}
              >
                {tab} <span className="ml-1 text-xs opacity-70">({count})</span>
              </button>
            );
          })}
          <span className="ml-auto text-xs text-slate-500">Otomatik güncellenir</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Danışan</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden sm:table-cell">Terapist</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Tarih & Saat</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden md:table-cell">Not</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden lg:table-cell">Puanlar</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Durum</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-sm">Yükleniyor…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-sm">Randevu bulunamadı.</td></tr>
              )}
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm text-white font-medium">{a.name}</p>
                    <p className="text-xs text-slate-500">{a.email}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-400 hidden sm:table-cell">{a.therapist_name || a.therapistName}</td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-white">{a.selected_day || a.selectedDay || '—'}</p>
                    <p className="text-xs text-slate-500">{a.selected_hour || a.selectedHour || '—'}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400 hidden md:table-cell max-w-xs truncate">{a.note || '—'}</td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <div className="flex flex-col gap-1.5">
                      {/* Terapistin danışana verdiği puan */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600 text-xs w-16">Danışan:</span>
                        {a.therapist_rating ? (
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map((s) => (
                              <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill={s <= a.therapist_rating ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                            ))}
                          </div>
                        ) : <span className="text-slate-700 text-xs">—</span>}
                      </div>
                      {/* Danışanın terapiste verdiği puan */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600 text-xs w-16">Terapist:</span>
                        {a.client_rating ? (
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map((s) => (
                              <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill={s <= a.client_rating ? '#14b8a6' : 'none'} stroke="#14b8a6" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                            ))}
                          </div>
                        ) : <span className="text-slate-700 text-xs">—</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">{statusBadge(a.status)}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {a.status === 'bekliyor' && (
                        <>
                          <button
                            onClick={() => handleStatus(a.id, 'onayli')}
                            className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Onayla"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                          </button>
                          <button
                            onClick={() => handleStatus(a.id, 'iptal')}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="İptal"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </>
                      )}
                      {a.status === 'onayli' && (
                        <button
                          onClick={() => handleStatus(a.id, 'iptal')}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="İptal Et"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-700">
          <p className="text-xs text-slate-500">{filtered.length} randevu gösteriliyor</p>
        </div>
      </div>
    </div>
  );
}

