'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const stats = [
  {
    label: 'Bu Ay Randevu',
    value: '0',
    sub: '',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    color: 'teal',
    bg: 'bg-teal-50',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    valueColor: 'text-teal-700',
    subColor: 'text-teal-500',
    border: 'border-teal-100',
  },
  {
    label: 'Toplam Danışan',
    value: '0',
    sub: '',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: 'blue',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    valueColor: 'text-blue-700',
    subColor: 'text-blue-500',
    border: 'border-blue-100',
  },
  {
    label: 'Ortalama Puan',
    value: '4.9',
    sub: '⭐ Danışan puanı',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    color: 'violet',
    bg: 'bg-violet-50',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    valueColor: 'text-violet-700',
    subColor: 'text-violet-500',
    border: 'border-violet-100',
  },
  {
    label: 'Profil Görüntüleme',
    value: '0',
    sub: '',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    color: 'orange',
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    valueColor: 'text-orange-700',
    subColor: 'text-orange-500',
    border: 'border-orange-100',
  },
];

const recentAppointments = [];

const upcomingAppointments = [];

const recentReviews = [];

const quickActions = [
  { label: 'Profil Düzenle', href: '/panel/profil', icon: '✏️', color: 'bg-teal-50 border-teal-100 text-teal-700 hover:bg-teal-100' },
  { label: 'Yeni Randevu', href: '/panel/randevular', icon: '📅', color: 'bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100' },
  { label: 'Mesajları Gör', href: '/panel/mesajlar', icon: '💬', color: 'bg-violet-50 border-violet-100 text-violet-700 hover:bg-violet-100' },
];

function StatusBadge({ status }) {
  const map = {
    onayli: 'bg-green-100 text-green-700',
    bekliyor: 'bg-amber-100 text-amber-700',
    iptal: 'bg-red-100 text-red-700',
  };
  const labels = { onayli: 'Onaylı', bekliyor: 'Bekliyor', iptal: 'İptal' };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${type === 'online' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
      {type === 'online' ? 'Online' : 'Yüz Yüze'}
    </span>
  );
}

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={s <= rating ? '#f59e0b' : 'none'} stroke={s <= rating ? '#f59e0b' : '#d1d5db'} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [therapistName, setTherapistName] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('panel_therapist_id');
    if (!id) return;

    // localStorage'dan önce kontrol et
    try {
      const stored = localStorage.getItem(`panel_profil_${id}`);
      if (stored) {
        const s = JSON.parse(stored);
        if (s.formData?.adSoyad) { setTherapistName(s.formData.adSoyad); return; }
      }
    } catch { /* ignore */ }

    // Static data
    const { therapists } = require('../../../data/therapists');
    const t = therapists.find((t) => t.id === id);
    if (t) { setTherapistName(t.name); return; }

    // Supabase'den çek (UUID tabanlı terapist)
    fetch(`/api/terapistler-db/${id}`)
      .then((r) => r.json())
      .then((db) => { if (db?.name) setTherapistName(db.name); })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-5 text-white shadow-sm">
        <p className="text-teal-100 text-sm">Hoş geldiniz 👋</p>
        <h2 className="text-xl font-bold mt-0.5">Merhaba, {therapistName}</h2>
        <p className="text-teal-100 text-sm mt-1">Bugün 0 randevunuz var. İyi günler dileriz!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`bg-white rounded-2xl border ${stat.border} p-4 sm:p-5 shadow-sm`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${stat.iconBg} ${stat.iconColor} rounded-xl flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
            <p className={`text-2xl font-bold ${stat.valueColor}`}>{stat.value}</p>
            <p className="text-slate-600 text-sm font-medium mt-0.5">{stat.label}</p>
            <p className={`text-xs mt-1 ${stat.subColor}`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Middle row: Appointments table + Upcoming */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent appointments table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Son Randevular</h3>
            <Link href="/panel/randevular" className="text-xs text-teal-600 hover:text-teal-700 font-medium hover:underline">
              Tümünü gör →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs">Danışan</th>
                  <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs">Tarih & Saat</th>
                  <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs hidden sm:table-cell">Tür</th>
                  <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentAppointments.map((apt, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {apt.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="font-medium text-slate-700 text-sm">{apt.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                      <div>{apt.date}</div>
                      <div className="font-medium text-slate-700 mt-0.5">{apt.time}</div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <TypeBadge type={apt.type} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={apt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Yaklaşan Randevular</h3>
          </div>
          <div className="p-4 space-y-3">
            {upcomingAppointments.map((apt, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${apt.color}`}>
                  {apt.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 text-sm truncate">{apt.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{apt.time}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-teal-400 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="px-5 pb-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Hızlı İşlemler</p>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-colors ${action.color}`}
                >
                  <span>{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent reviews */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Son Yorumlar</h3>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-sm font-semibold text-slate-700">4.9</span>
            <span className="text-xs text-slate-400">(0 değerlendirme)</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {recentReviews.map((review, i) => (
            <div key={i} className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {review.initials}
                </div>
                <div>
                  <p className="font-medium text-slate-700 text-sm">{review.name}</p>
                  <Stars rating={review.rating} />
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{review.text}</p>
              <p className="text-xs text-slate-400 mt-2">{review.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
