'use client';

import { useState } from 'react';

const monthlyData = [
  { month: 'Nis', revenue: 45200 },
  { month: 'May', revenue: 52800 },
  { month: 'Haz', revenue: 61400 },
  { month: 'Tem', revenue: 58900 },
  { month: 'Ağu', revenue: 67200 },
  { month: 'Eyl', revenue: 72100 },
  { month: 'Eki', revenue: 80300 },
  { month: 'Kas', revenue: 75600 },
  { month: 'Ara', revenue: 88400 },
  { month: 'Oca', revenue: 79200 },
  { month: 'Şub', revenue: 85600 },
  { month: 'Mar', revenue: 92400 },
];

const transactions = [
  { id: 1, therapist: 'Dr. Ayşe Kaya', client: 'Ahmet Yılmaz', date: '01 Nis 2026', amount: 1800, commission: 180, status: 'ödendi' },
  { id: 2, therapist: 'Uzm. Psk. Mehmet Demir', client: 'Fatma Demir', date: '01 Nis 2026', amount: 2200, commission: 220, status: 'ödendi' },
  { id: 3, therapist: 'Psk. Zeynep Arslan', client: 'Mustafa Kaya', date: '31 Mar 2026', amount: 1600, commission: 160, status: 'bekliyor' },
  { id: 4, therapist: 'Dr. Kemal Aydın', client: 'Zeynep Şahin', date: '31 Mar 2026', amount: 2500, commission: 250, status: 'ödendi' },
  { id: 5, therapist: 'Psk. Fatma Yıldız', client: 'Ayşe Arslan', date: '30 Mar 2026', amount: 1400, commission: 140, status: 'ödendi' },
  { id: 6, therapist: 'Dr. Leyla Çelik', client: 'Elif Yıldız', date: '30 Mar 2026', amount: 3000, commission: 300, status: 'bekliyor' },
  { id: 7, therapist: 'Uzm. Psk. Emre Şahin', client: 'Mehmet Korkmaz', date: '29 Mar 2026', amount: 1500, commission: 150, status: 'ödendi' },
  { id: 8, therapist: 'Dr. Ayşe Kaya', client: 'Seda Polat', date: '29 Mar 2026', amount: 1800, commission: 180, status: 'bekliyor' },
];

const topEarners = [
  { name: 'Dr. Leyla Çelik', revenue: 124500, pct: 100 },
  { name: 'Dr. Kemal Aydın', revenue: 108200, pct: 87 },
  { name: 'Uzm. Psk. Mehmet Demir', revenue: 98400, pct: 79 },
  { name: 'Dr. Ayşe Kaya', revenue: 87600, pct: 70 },
  { name: 'Uzm. Psk. Emre Şahin', revenue: 62300, pct: 50 },
];

const periods = ['Bu Hafta', 'Bu Ay', 'Bu Yıl'];

export default function AdminFinansPage() {
  const [period, setPeriod] = useState('Bu Ay');

  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue));

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex gap-2">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              period === p
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Gelir', value: '₺892,400', sub: '+%18 geçen ay', icon: '💰', color: 'text-green-400', border: 'border-green-500/20', subColor: 'text-green-400' },
          { label: 'Platform Komisyonu (%10)', value: '₺89,240', sub: 'Net komisyon', icon: '🏦', color: 'text-teal-400', border: 'border-teal-500/20', subColor: 'text-teal-400' },
          { label: 'Terapist Ödemeleri', value: '₺803,160', sub: '43 terapist', icon: '👨‍⚕️', color: 'text-blue-400', border: 'border-blue-500/20', subColor: 'text-blue-400' },
          { label: 'Bekleyen Ödeme', value: '₺24,800', sub: '12 işlem', icon: '⏳', color: 'text-amber-400', border: 'border-amber-500/20', subColor: 'text-amber-400' },
        ].map((card) => (
          <div key={card.label} className={`bg-slate-800/60 border ${card.border} rounded-2xl p-5`}>
            <div className="text-2xl mb-3">{card.icon}</div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{card.label}</p>
            <p className={`text-xs font-medium mt-1 ${card.subColor}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Bar chart + Top earners */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Bar chart */}
        <div className="xl:col-span-2 bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
          <h2 className="font-semibold text-white text-sm mb-5">Aylık Gelir (Son 12 Ay)</h2>
          <div className="flex items-end gap-2 h-48">
            {monthlyData.map((m, i) => {
              const heightPct = (m.revenue / maxRevenue) * 100;
              const isLast = i === monthlyData.length - 1;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full flex flex-col justify-end" style={{ height: '160px' }}>
                    <div
                      className={`w-full rounded-t-lg transition-all ${isLast ? 'bg-teal-500' : 'bg-slate-600 group-hover:bg-slate-500'}`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      ₺{m.revenue.toLocaleString('tr-TR')}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top earners */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
          <h2 className="font-semibold text-white text-sm mb-4">En Çok Kazanan Terapistler</h2>
          <div className="space-y-4">
            {topEarners.map((t, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 truncate max-w-[60%]">{t.name}</span>
                  <span className="text-xs text-green-400 font-semibold">₺{t.revenue.toLocaleString('tr-TR')}</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="font-semibold text-white text-sm">Son İşlemler</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Terapist</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden sm:table-cell">Danışan</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden md:table-cell">Tarih</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Tutar</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden lg:table-cell">Komisyon</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3 text-sm text-white font-medium">{t.therapist}</td>
                  <td className="px-5 py-3 text-sm text-slate-400 hidden sm:table-cell">{t.client}</td>
                  <td className="px-5 py-3 text-sm text-slate-400 hidden md:table-cell">{t.date}</td>
                  <td className="px-5 py-3 text-sm text-green-400 font-semibold">₺{t.amount.toLocaleString('tr-TR')}</td>
                  <td className="px-5 py-3 text-sm text-teal-400 hidden lg:table-cell">₺{t.commission}</td>
                  <td className="px-5 py-3">
                    {t.status === 'ödendi' ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">Ödendi</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">Bekliyor</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
