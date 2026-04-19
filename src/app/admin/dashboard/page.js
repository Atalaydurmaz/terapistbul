'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const topTherapists = [
  { name: 'Dr. Ayşe Kaya', rating: 4.9, reviews: 63, city: 'İstanbul' },
  { name: 'Uzm. Psk. Mehmet Demir', rating: 4.8, reviews: 89, city: 'Ankara' },
  { name: 'Psk. Zeynep Arslan', rating: 4.8, reviews: 47, city: 'İzmir' },
  { name: 'Dr. Kemal Aydın', rating: 4.7, reviews: 112, city: 'İstanbul' },
  { name: 'Psk. Fatma Yıldız', rating: 4.7, reviews: 58, city: 'Bursa' },
];

const statusBadge = (s) => {
  if (s === 'bekliyor') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">Bekliyor</span>;
  if (s === 'onaylandi') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">Onaylı</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">Reddedildi</span>;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    therapists: 0, clients: 0, appointments: 0, pending: 0, applications: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);

  const load = useCallback(async () => {
    try {
      const [appsRes, clientsRes, randevuRes, terapistRes] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/danisanlar'),
        fetch('/api/randevular'),
        fetch('/api/terapistler-db'),
      ]);
      const apps = await appsRes.json();
      const clients = await clientsRes.json();
      const randevular = await randevuRes.json();
      const terapistler = await terapistRes.json();

      setStats({
        therapists: terapistler.length,
        clients: clients.length,
        appointments: randevular.length,
        pending: randevular.filter((r) => r.status === 'bekliyor').length,
        applications: apps.filter((a) => a.status === 'bekliyor').length,
      });
      setRecentApplications(apps.slice(0, 5));
    } catch {}
  }, []);

  useEffect(() => {
    load();
    const supabase = createClient();
    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'therapists' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, load)
      .subscribe();
    // Fallback polling (realtime disabled veya bağlantı koparsa)
    const iv = setInterval(load, 30000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(iv);
    };
  }, [load]);

  const handleAppAction = async (id, status) => {
    setRecentApplications((prev) => prev.map((a) => String(a.id) === String(id) ? { ...a, status } : a));
    await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const kpiCards = [
    {
      title: 'Toplam Terapist',
      value: String(stats.therapists),
      sub: 'Onaylı terapist',
      subColor: 'text-teal-400',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      color: 'from-teal-500/20 to-teal-600/10',
      iconColor: 'text-teal-400',
      border: 'border-teal-500/20',
    },
    {
      title: 'Toplam Danışan',
      value: String(stats.clients),
      sub: 'Kayıtlı danışan',
      subColor: 'text-blue-400',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      color: 'from-blue-500/20 to-blue-600/10',
      iconColor: 'text-blue-400',
      border: 'border-blue-500/20',
    },
    {
      title: 'Toplam Randevu',
      value: String(stats.appointments),
      sub: `${stats.pending} bekliyor`,
      subColor: 'text-violet-400',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      color: 'from-violet-500/20 to-violet-600/10',
      iconColor: 'text-violet-400',
      border: 'border-violet-500/20',
    },
    {
      title: 'Bekleyen Başvuru',
      value: String(stats.applications),
      sub: 'Onay bekliyor',
      subColor: 'text-amber-400',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      ),
      color: 'from-amber-500/20 to-amber-600/10',
      iconColor: 'text-amber-400',
      border: 'border-amber-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.title} className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl p-4`}>
            <div className={`${card.iconColor} mb-3`}>{card.icon}</div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{card.title}</p>
            <p className={`text-xs font-medium mt-1 ${card.subColor}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-white">{stats.appointments}</p>
          <p className="text-xs text-slate-400 mt-1">Toplam Randevu</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">{stats.pending}</p>
          <p className="text-xs text-slate-400 mt-1">Onay Bekleyen Randevu</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">{stats.applications}</p>
          <p className="text-xs text-slate-400 mt-1">Bekleyen Terapist Başvurusu</p>
        </div>
      </div>

      {/* Main content row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Applications Table */}
        <div className="xl:col-span-2 bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
            <h2 className="font-semibold text-white text-sm">Son Terapist Başvuruları</h2>
            <Link href="/admin/terapistler" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">Tümünü gör →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Ad Soyad</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden sm:table-cell">Unvan</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden md:table-cell">Şehir</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Durum</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recentApplications.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500 text-sm">Henüz başvuru yok.</td></tr>
                )}
                {recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3 text-sm text-white font-medium">{app.name}</td>
                    <td className="px-5 py-3 text-sm text-slate-400 hidden sm:table-cell">{app.title || '—'}</td>
                    <td className="px-5 py-3 text-sm text-slate-400 hidden md:table-cell">{app.city || '—'}</td>
                    <td className="px-5 py-3">{statusBadge(app.status)}</td>
                    <td className="px-5 py-3">
                      {app.status === 'bekliyor' && (
                        <div className="flex gap-1">
                          <button onClick={() => handleAppAction(app.id, 'onaylandi')} className="px-2 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs rounded-lg transition-colors border border-green-500/20">Onayla</button>
                          <button onClick={() => handleAppAction(app.id, 'reddedildi')} className="px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs rounded-lg transition-colors border border-red-500/20">Reddet</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Therapists */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
            <h2 className="font-semibold text-white text-sm">En Yüksek Puanlı Terapistler</h2>
            <Link href="/admin/terapistler" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">Tümünü gör →</Link>
          </div>
          <div className="p-5 space-y-3">
            {topTherapists.map((t, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-slate-600 text-sm font-bold w-5 flex-shrink-0">{i + 1}.</span>
                <div className="w-8 h-8 bg-teal-600/30 rounded-full flex items-center justify-center text-teal-400 text-xs font-bold flex-shrink-0">
                  {t.name.split(' ').pop().charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.city} · {t.reviews} yorum</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span className="text-amber-400 text-sm font-semibold">{t.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
