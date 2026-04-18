'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRealtimeTable } from '@/hooks/useRealtimeTable';

const statusBadge = (s) => {
  if (s === 'aktif') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">Aktif</span>;
  if (s === 'engellendi') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">Engellendi</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-600/50 text-slate-400 border border-slate-600">Pasif</span>;
};

export default function AdminDanisanlarPage() {
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState([]);
  const [detailClient, setDetailClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/danisanlar');
      const data = await res.json();
      setClients(data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Realtime — DB değişince anında güncelle
  useRealtimeTable('clients', load);

  const handleBlock = async (id) => {
    const client = clients.find((c) => c.id === id);
    if (!client) return;
    const newStatus = client.status === 'engellendi' ? 'aktif' : 'engellendi';
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, status: newStatus } : c));
    if (detailClient?.id === id) setDetailClient((prev) => ({ ...prev, status: newStatus }));
    await fetch(`/api/danisanlar/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const filtered = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Toplam Danışan', value: clients.length, color: 'text-blue-400', border: 'border-blue-500/20' },
          { label: 'Aktif', value: clients.filter((c) => c.status === 'aktif').length, color: 'text-green-400', border: 'border-green-500/20' },
          { label: 'Pasif', value: clients.filter((c) => c.status === 'pasif').length, color: 'text-teal-400', border: 'border-teal-500/20' },
          { label: 'Engellenen', value: clients.filter((c) => c.status === 'engellendi').length, color: 'text-red-400', border: 'border-red-500/20' },
        ].map((s) => (
          <div key={s.label} className={`bg-slate-800/60 border ${s.border} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Danışan adı veya email ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
            />
          </div>
          <span className="text-xs text-slate-500 self-center">Otomatik güncellenir</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Ad Soyad</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden sm:table-cell">E-posta</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden md:table-cell">Telefon</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden lg:table-cell">Kayıt Tarihi</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Durum</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500 text-sm">Yükleniyor…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500 text-sm">
                    Henüz kayıtlı danışan bulunmuyor.
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className={`hover:bg-slate-700/30 transition-colors ${c.status === 'engellendi' ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600/30 rounded-full flex items-center justify-center text-blue-400 text-xs font-bold flex-shrink-0">
                        {c.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm text-white font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-400 hidden sm:table-cell">{c.email}</td>
                  <td className="px-5 py-3 text-sm text-slate-400 hidden md:table-cell">{c.phone || '—'}</td>
                  <td className="px-5 py-3 text-sm text-slate-400 hidden lg:table-cell">
                    {c.registeredAt ? new Date(c.registeredAt).toLocaleDateString('tr-TR') : '—'}
                  </td>
                  <td className="px-5 py-3">{statusBadge(c.status)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDetailClient(c)}
                        className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors"
                        title="Önizle"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleBlock(c.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          c.status === 'engellendi'
                            ? 'text-green-400 hover:bg-green-500/10'
                            : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                        }`}
                        title={c.status === 'engellendi' ? 'Engeli Kaldır' : 'Engelle'}
                      >
                        {c.status === 'engellendi' ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-700">
          <p className="text-xs text-slate-500">{filtered.length} danışan gösteriliyor</p>
        </div>
      </div>

      {/* Önizleme Modalı */}
      {detailClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setDetailClient(null)}>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-base">Danışan Önizleme</h3>
              <button onClick={() => setDetailClient(null)} className="text-slate-400 hover:text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-blue-600/30 rounded-2xl flex items-center justify-center text-blue-400 text-xl font-bold">
                {detailClient.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{detailClient.name}</p>
                <div className="mt-1">{statusBadge(detailClient.status)}</div>
              </div>
            </div>
            <div className="space-y-3 mb-5">
              {[
                { label: 'E-posta', value: detailClient.email },
                { label: 'Telefon', value: detailClient.phone || '—' },
                { label: 'Kayıt Tarihi', value: detailClient.registeredAt ? new Date(detailClient.registeredAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 bg-slate-900/50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-xs text-slate-500">{row.label}</p>
                    <p className="text-sm text-slate-200">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleBlock(detailClient.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  detailClient.status === 'engellendi'
                    ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20'
                }`}
              >
                {detailClient.status === 'engellendi' ? '✓ Engeli Kaldır' : '⊘ Engelle'}
              </button>
              <button
                onClick={() => setDetailClient(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
