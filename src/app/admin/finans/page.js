'use client';

import { useState } from 'react';

// Yeni marketplace — gerçek işlem olmadığı için tüm değerler sıfır.
// Supabase'deki payments tablosundan besleme yapılacak; şimdilik boş state.
const monthlyData = [
  { month: 'Nis', revenue: 0 },
  { month: 'May', revenue: 0 },
  { month: 'Haz', revenue: 0 },
  { month: 'Tem', revenue: 0 },
  { month: 'Ağu', revenue: 0 },
  { month: 'Eyl', revenue: 0 },
  { month: 'Eki', revenue: 0 },
  { month: 'Kas', revenue: 0 },
  { month: 'Ara', revenue: 0 },
  { month: 'Oca', revenue: 0 },
  { month: 'Şub', revenue: 0 },
  { month: 'Mar', revenue: 0 },
];

const transactions = [];
const topEarners = [];

const periods = ['Bu Hafta', 'Bu Ay', 'Bu Yıl'];

const formatTL = (n) => `₺${Number(n || 0).toLocaleString('tr-TR')}`;

export default function AdminFinansPage() {
  const [period, setPeriod] = useState('Bu Ay');

  const maxRevenue = Math.max(1, ...monthlyData.map((m) => m.revenue));

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
          { label: 'Toplam Gelir', value: formatTL(0), sub: 'Henüz işlem yok', icon: '💰', color: 'text-green-400', border: 'border-green-500/20', subColor: 'text-slate-500' },
          { label: 'Platform Komisyonu (%10)', value: formatTL(0), sub: 'Net komisyon', icon: '🏦', color: 'text-teal-400', border: 'border-teal-500/20', subColor: 'text-slate-500' },
          { label: 'Terapist Ödemeleri', value: formatTL(0), sub: '0 terapist', icon: '👨‍⚕️', color: 'text-blue-400', border: 'border-blue-500/20', subColor: 'text-slate-500' },
          { label: 'Bekleyen Ödeme', value: formatTL(0), sub: '0 işlem', icon: '⏳', color: 'text-amber-400', border: 'border-amber-500/20', subColor: 'text-slate-500' },
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
                      className={`w-full rounded-t-lg transition-all ${isLast ? 'bg-teal-500/30' : 'bg-slate-700 group-hover:bg-slate-600'}`}
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">{m.month}</span>
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-slate-500 mt-4">
            Henüz işlem kaydı yok — ilk ödemeler geldikçe grafik dolmaya başlayacak.
          </p>
        </div>

        {/* Top earners */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
          <h2 className="font-semibold text-white text-sm mb-4">En Çok Kazanan Terapistler</h2>
          {topEarners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center text-xl mb-3">
                📊
              </div>
              <p className="text-xs text-slate-500">Henüz gelir verisi yok.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topEarners.map((t, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 truncate max-w-[60%]">{t.name}</span>
                    <span className="text-xs text-green-400 font-semibold">{formatTL(t.revenue)}</span>
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
          )}
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="font-semibold text-white text-sm">Son İşlemler</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-5">
            <div className="w-14 h-14 rounded-full bg-slate-700/50 flex items-center justify-center text-2xl mb-4">
              🧾
            </div>
            <p className="text-sm font-medium text-slate-300">Henüz işlem yok</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              İlk seans ödemesi yapıldığında burada görünecek. Gelir ve komisyon
              toplamları otomatik hesaplanır.
            </p>
          </div>
        ) : (
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
                    <td className="px-5 py-3 text-sm text-green-400 font-semibold">{formatTL(t.amount)}</td>
                    <td className="px-5 py-3 text-sm text-teal-400 hidden lg:table-cell">{formatTL(t.commission)}</td>
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
        )}
      </div>
    </div>
  );
}
