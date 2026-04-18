'use client';

import { useState } from 'react';

const periods = ['Bu Hafta', 'Bu Ay', 'Bu Yıl'];

const weeklyData = [
  { day: 'Pzt', count: 0 },
  { day: 'Sal', count: 0 },
  { day: 'Çar', count: 0 },
  { day: 'Per', count: 0 },
  { day: 'Cum', count: 0 },
  { day: 'Cmt', count: 0 },
  { day: 'Paz', count: 0 },
];

const monthlyData = [
  { day: 'H1', count: 0 },
  { day: 'H2', count: 0 },
  { day: 'H3', count: 0 },
  { day: 'H4', count: 0 },
];

const yearlyData = [
  { day: 'Oca', count: 0 },
  { day: 'Şub', count: 0 },
  { day: 'Mar', count: 0 },
  { day: 'Nis', count: 0 },
  { day: 'May', count: 0 },
  { day: 'Haz', count: 0 },
  { day: 'Tem', count: 0 },
  { day: 'Ağu', count: 0 },
  { day: 'Eyl', count: 0 },
  { day: 'Eki', count: 0 },
  { day: 'Kas', count: 0 },
  { day: 'Ara', count: 0 },
];

const specialties = [
  { label: 'Anksiyete', percent: 0, color: 'bg-teal-500' },
  { label: 'Depresyon', percent: 0, color: 'bg-blue-500' },
  { label: 'İlişki Sorunları', percent: 0, color: 'bg-violet-500' },
  { label: 'Stres', percent: 0, color: 'bg-orange-500' },
];

const activityFeed = [];

const periodMetrics = {
  'Bu Hafta': { seans: 0, danisan: 0, gelir: '₺0', puan: '4.9' },
  'Bu Ay': { seans: 0, danisan: 0, gelir: '₺0', puan: '4.9' },
  'Bu Yıl': { seans: 0, danisan: 0, gelir: '₺0', puan: '4.9' },
};

export default function IstatistiklerPage() {
  const [period, setPeriod] = useState('Bu Ay');

  const chartData = period === 'Bu Hafta' ? weeklyData : period === 'Bu Ay' ? monthlyData : yearlyData;
  const maxCount = Math.max(...chartData.map((d) => d.count));
  const metrics = periodMetrics[period];

  const metricCards = [
    { label: 'Toplam Seans', value: metrics.seans, icon: '🗓️', color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
    { label: 'Yeni Danışan', value: metrics.danisan, icon: '👤', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    { label: 'Gelir', value: metrics.gelir, icon: '💰', color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
    { label: 'Puan Ortalaması', value: metrics.puan, icon: '⭐', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 w-fit">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              period === p
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <div key={card.label} className={`bg-white rounded-2xl border shadow-sm p-5 ${card.bg}`}>
            <div className="text-2xl mb-3">{card.icon}</div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-slate-500 text-sm mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Specialties */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800">Seans Dağılımı</h3>
            <span className="text-xs text-slate-400">{period}</span>
          </div>
          <div className="flex items-end justify-between gap-2 h-48">
            {chartData.map((d, i) => {
              const heightPercent = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">{d.count}</span>
                  <div className="w-full relative group">
                    <div
                      className="w-full bg-teal-500 rounded-t-lg hover:bg-teal-600 transition-colors cursor-pointer"
                      style={{ height: `${(heightPercent / 100) * 160}px`, minHeight: '4px' }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Specialties */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-5">En Çok Çalışılan Alanlar</h3>
          <div className="space-y-4">
            {specialties.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-700">{s.label}</span>
                  <span className="text-sm font-semibold text-slate-800">%{s.percent}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all duration-500`}
                    style={{ width: `${s.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Seans Tipi</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-teal-50 rounded-xl">
                <p className="text-xl font-bold text-teal-600">0%</p>
                <p className="text-xs text-slate-500 mt-0.5">Online</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-xl font-bold text-slate-600">0%</p>
                <p className="text-xs text-slate-500 mt-0.5">Yüz Yüze</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Son Aktiviteler</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {activityFeed.map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50/50 transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${item.color}`}>
                <span className="text-base">{item.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">{item.text}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
