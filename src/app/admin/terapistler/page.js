'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRealtimeTable } from '@/hooks/useRealtimeTable';

const cities = ['Tümü', 'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];
const statuses = ['Tümü', 'Aktif', 'Bekliyor', 'Pasif'];

const statusBadge = (s) => {
  if (s === 'aktif') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">Aktif</span>;
  if (s === 'bekliyor') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">Bekliyor</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-600/50 text-slate-400 border border-slate-600">Pasif</span>;
};

export default function AdminTerapistlerPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('Tümü');
  const [statusFilter, setStatusFilter] = useState('Tümü');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const [applications, setApplications] = useState([]);
  const [expandedApp, setExpandedApp] = useState(null);
  const [previewTherapist, setPreviewTherapist] = useState(null);
  const [editTherapist, setEditTherapist] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [tRes, aRes] = await Promise.all([
        fetch('/api/terapistler-db'),
        fetch('/api/applications'),
      ]);
      const t = await tRes.json();
      const a = await aRes.json();
      setTherapists(t);
      setApplications(a.filter((x) => x.status === 'bekliyor'));
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Realtime — DB değişince anında güncelle
  useRealtimeTable('applications', load);
  useRealtimeTable('therapists', load);

  // --- Therapist actions ---
  const handleDelete = async (id) => {
    setTherapists((prev) => prev.filter((t) => t.id !== id));
    setDeleteConfirm(null);
    if (previewTherapist?.id === id) setPreviewTherapist(null);
    await fetch(`/api/terapistler-db/${id}`, { method: 'DELETE' });
  };

  const handleToggleStatus = async (id) => {
    const t = therapists.find((x) => x.id === id);
    if (!t) return;
    const newStatus = t.status === 'aktif' ? 'pasif' : 'aktif';
    setTherapists((prev) => prev.map((x) => x.id === id ? { ...x, status: newStatus } : x));
    if (previewTherapist?.id === id) setPreviewTherapist((prev) => ({ ...prev, status: newStatus }));
    await fetch(`/api/terapistler-db/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const handleApprove = async (id) => {
    setTherapists((prev) => prev.map((t) => t.id === id ? { ...t, status: 'aktif' } : t));
    await fetch(`/api/terapistler-db/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'aktif' }),
    });
  };

  const openEdit = (t) => {
    setEditTherapist(t);
    setEditForm({ name: t.name, specialty: t.specialty || t.title || '', city: t.city, experience: t.experience, status: t.status, rating: t.rating, price: t.price });
  };

  const handleSaveEdit = async () => {
    const updated = {
      ...editForm,
      initials: editForm.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    };
    setTherapists((prev) => prev.map((t) => t.id === editTherapist.id ? { ...t, ...updated } : t));
    setEditTherapist(null);
    await fetch(`/api/terapistler-db/${editTherapist.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  };

  // --- Application actions ---
  const sendStatusEmail = async (app, status) => {
    try {
      await fetch('/api/application-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantName: app.name, applicantEmail: app.email, status }),
      });
    } catch {}
  };

  const handleApproveApplication = async (app) => {
    setApplications((prev) => prev.filter((a) => a.id !== app.id));
    await fetch(`/api/applications/${app.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'onaylandi' }),
    });
    sendStatusEmail(app, 'approved');
    load(); // Reload therapists to show new entry
  };

  const handleRejectApplication = async (app) => {
    setApplications((prev) => prev.filter((a) => a.id !== app.id));
    await fetch(`/api/applications/${app.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'reddedildi' }),
    });
    sendStatusEmail(app, 'rejected');
  };

  // --- Filters ---
  const filtered = therapists.filter((t) => {
    const matchSearch = (t.name || '').toLowerCase().includes(search.toLowerCase());
    const matchCity = city === 'Tümü' || t.city === city;
    const matchStatus = statusFilter === 'Tümü' || t.status === statusFilter.toLowerCase();
    return matchSearch && matchCity && matchStatus;
  });

  const aktif = therapists.filter((t) => t.status === 'aktif').length;
  const bekliyor = therapists.filter((t) => t.status === 'bekliyor').length;
  const pasif = therapists.filter((t) => t.status === 'pasif').length;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Aktif Terapist', value: aktif, color: 'text-green-400', border: 'border-green-500/20', bg: 'bg-green-500/20' },
          { label: 'Onay Bekleyen', value: bekliyor, color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/20' },
          { label: 'Pasif', value: pasif, color: 'text-slate-400', border: 'border-slate-600', bg: 'bg-slate-700' },
        ].map((s) => (
          <div key={s.label} className={`bg-slate-800/60 border ${s.border} rounded-2xl p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
              <span className={`${s.color} font-bold text-lg`}>{s.value}</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{s.value} {s.label}</p>
              <p className="text-slate-500 text-xs">Toplam: {therapists.length}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Yeni Başvurular */}
      {applications.length > 0 && (
        <div className="bg-slate-800/60 border border-amber-500/30 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white">Yeni Başvurular</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">{applications.length}</span>
            <span className="ml-auto text-xs text-slate-500">Otomatik güncellenir</span>
          </div>
          <div className="divide-y divide-slate-700/50">
            {applications.map((app) => (
              <div key={app.id}>
                <div className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-700/20 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0">
                      {app.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{app.name}</p>
                      <p className="text-xs text-slate-400 truncate">{app.title} · {app.city} · {app.experience} yıl</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <button onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)} className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors" title="Detay">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </button>
                    <button onClick={() => handleApproveApplication(app)} className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-medium rounded-lg border border-green-500/30 transition-colors">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Onayla
                    </button>
                    <button onClick={() => handleRejectApplication(app)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg border border-red-500/20 transition-colors">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      Reddet
                    </button>
                  </div>
                </div>
                {expandedApp === app.id && (
                  <div className="px-5 pb-4 bg-slate-900/30 space-y-2 text-xs text-slate-400">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 pt-2">
                      <span><span className="text-slate-500">E-posta:</span> {app.email || '—'}</span>
                      <span><span className="text-slate-500">Telefon:</span> {app.phone || '—'}</span>
                      <span><span className="text-slate-500">Eğitim:</span> {app.education || '—'}</span>
                      <span><span className="text-slate-500">Ücret:</span> {app.price ? `₺${app.price}` : '—'}</span>
                      <span><span className="text-slate-500">Tarih:</span> {app.createdAt ? new Date(app.createdAt).toLocaleDateString('tr-TR') : '—'}</span>
                    </div>
                    {app.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">{app.specialties.map(s => <span key={s} className="px-2 py-0.5 bg-slate-700 rounded text-slate-300">{s}</span>)}</div>
                    )}
                    {app.about && <p className="text-slate-400 italic pt-1">"{app.about}"</p>}
                    {(app.diploma_url || app.diplomaFile) && (
                      <div className="pt-2">
                        <p className="text-slate-500 mb-1.5">Diploma:</p>
                        {(() => {
                          const url = app.diploma_url || app.diplomaFile;
                          const isImage = url && (url.match(/\.(png|jpg|jpeg|gif|webp)/i) || url.startsWith('data:image'));
                          return isImage ? (
                            <img src={url} alt="Diploma" className="max-w-xs rounded-lg border border-slate-600 cursor-pointer" onClick={() => window.open(url, '_blank')} />
                          ) : (
                            <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-xs">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                              {app.diploma_file_name || app.diplomaFileName || 'Diploma Görüntüle'}
                            </a>
                          );
                        })()}
                      </div>
                    )}
                    {(app.video_url || app.videoFileName) && (
                      <div className="pt-2">
                        <p className="text-slate-500 mb-1.5">Video:</p>
                        {app.video_url ? (
                          <video src={app.video_url} controls className="max-w-xs rounded-lg border border-slate-600" style={{ maxHeight: '200px' }} />
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-700 rounded-lg text-slate-400 text-xs">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                            {app.video_file_name || app.videoFileName} {app.video_file_size ? `· ${(app.video_file_size/1024/1024).toFixed(1)} MB` : ''}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Terapist ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
          </div>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="bg-slate-900 border border-slate-600 text-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500">
            {cities.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex gap-2 mt-3">
          {statuses.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${statusFilter === s ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'text-slate-400 hover:bg-slate-700 border border-transparent'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Terapist</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden sm:table-cell">Uzmanlık</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden md:table-cell">Şehir</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden lg:table-cell">Deneyim</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden xl:table-cell">Puan</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Durum</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-500 text-sm">Yükleniyor…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-500 text-sm">Terapist bulunamadı.</td></tr>
              )}
              {filtered.map((t) => {
                const initials = t.initials || (t.name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <tr key={t.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-600/30 rounded-full flex items-center justify-center text-teal-400 text-xs font-bold flex-shrink-0">{initials}</div>
                        <span className="text-sm text-white font-medium">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-400 hidden sm:table-cell">{t.specialty || t.title || '—'}</td>
                    <td className="px-5 py-3 text-sm text-slate-400 hidden md:table-cell">{t.city || '—'}</td>
                    <td className="px-5 py-3 text-sm text-slate-400 hidden lg:table-cell">{t.experience ? `${t.experience} yıl` : '—'}</td>
                    <td className="px-5 py-3 hidden xl:table-cell">
                      {t.rating > 0 ? (
                        <span className="flex items-center gap-1 text-sm text-amber-400 font-medium">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          {t.rating}
                        </span>
                      ) : <span className="text-slate-600 text-sm">—</span>}
                    </td>
                    <td className="px-5 py-3">{statusBadge(t.status)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setPreviewTherapist(t)} className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors" title="Önizle">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button onClick={() => openEdit(t)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Düzenle">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        {t.status === 'bekliyor' ? (
                          <button onClick={() => handleApprove(t.id)} className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors" title="Onayla">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                          </button>
                        ) : (
                          <button onClick={() => handleToggleStatus(t.id)} className={`p-1.5 rounded-lg transition-colors ${t.status === 'aktif' ? 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10' : 'text-slate-400 hover:text-green-400 hover:bg-green-500/10'}`} title={t.status === 'aktif' ? 'Pasife Al' : 'Aktif Et'}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>
                          </button>
                        )}
                        {deleteConfirm === t.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleDelete(t.id)} className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/30 border border-red-500/20">Evet</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded-lg hover:bg-slate-600">İptal</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(t.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Sil">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-700">
          <p className="text-xs text-slate-500">{filtered.length} / {therapists.length} terapist gösteriliyor</p>
        </div>
      </div>

      {/* Önizleme Modalı */}
      {previewTherapist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setPreviewTherapist(null)}>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-base">Terapist Önizleme</h3>
              <button onClick={() => setPreviewTherapist(null)} className="text-slate-400 hover:text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-teal-600/30 rounded-2xl flex items-center justify-center text-teal-400 text-xl font-bold">
                {previewTherapist.initials || (previewTherapist.name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{previewTherapist.name}</p>
                <p className="text-slate-400 text-sm">{previewTherapist.specialty || previewTherapist.title || '—'}</p>
                <div className="mt-1">{statusBadge(previewTherapist.status)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Şehir', value: previewTherapist.city || '—' },
                { label: 'Deneyim', value: previewTherapist.experience ? `${previewTherapist.experience} yıl` : '—' },
                { label: 'Puan', value: previewTherapist.rating > 0 ? `⭐ ${previewTherapist.rating}` : '—' },
                { label: 'Ücret', value: previewTherapist.price ? `₺${previewTherapist.price}` : '—' },
              ].map((row) => (
                <div key={row.label} className="bg-slate-900/50 rounded-xl px-4 py-3">
                  <p className="text-xs text-slate-500 mb-0.5">{row.label}</p>
                  <p className="text-sm text-slate-200 font-medium">{row.value}</p>
                </div>
              ))}
            </div>
            {previewTherapist.email && (
              <p className="text-xs text-slate-400 mb-4">📧 {previewTherapist.email}</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => { openEdit(previewTherapist); setPreviewTherapist(null); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 transition-colors">
                Düzenle
              </button>
              <button onClick={() => handleToggleStatus(previewTherapist.id)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${previewTherapist.status === 'aktif' ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30' : 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30'}`}>
                {previewTherapist.status === 'aktif' ? 'Pasife Al' : 'Aktif Et'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Düzenleme Modalı */}
      {editTherapist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setEditTherapist(null)}>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-base">Terapist Düzenle</h3>
              <button onClick={() => setEditTherapist(null)} className="text-slate-400 hover:text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="space-y-3 mb-5">
              {[
                { label: 'Ad Soyad', field: 'name', type: 'text' },
                { label: 'Uzmanlık', field: 'specialty', type: 'text' },
                { label: 'Şehir', field: 'city', type: 'text' },
                { label: 'Deneyim (yıl)', field: 'experience', type: 'number' },
                { label: 'Puan', field: 'rating', type: 'number' },
                { label: 'Ücret (₺)', field: 'price', type: 'number' },
              ].map((f) => (
                <div key={f.field}>
                  <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={editForm[f.field] || ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, [f.field]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Durum</label>
                <select value={editForm.status || 'aktif'} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500">
                  <option value="aktif">Aktif</option>
                  <option value="bekliyor">Bekliyor</option>
                  <option value="pasif">Pasif</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveEdit} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-colors">Kaydet</button>
              <button onClick={() => setEditTherapist(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">İptal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
