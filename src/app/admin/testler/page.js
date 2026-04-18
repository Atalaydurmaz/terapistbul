'use client';

import { useState, useEffect } from 'react';
import { tests as siteTests } from '../../../data/tests';

const COLORS = [
  'bg-orange-500','bg-blue-500','bg-red-500','bg-yellow-500','bg-purple-500',
  'bg-pink-500','bg-cyan-500','bg-indigo-500','bg-violet-500','bg-sky-500',
  'bg-rose-500','bg-amber-500','bg-lime-500','bg-teal-500','bg-emerald-500',
  'bg-fuchsia-500','bg-orange-400','bg-red-400','bg-pink-400','bg-blue-400',
  'bg-green-500','bg-yellow-400','bg-purple-400','bg-cyan-400','bg-indigo-400',
  'bg-violet-400','bg-teal-400','bg-emerald-400','bg-rose-400','bg-amber-400',
];

const BASE_TESTS = siteTests.map((t, i) => ({
  id: t.id,
  name: t.title,
  subtitle: t.subtitle,
  color: COLORS[i % COLORS.length],
}));

export default function AdminTestlerPage() {
  const [tests, setTests] = useState(BASE_TESTS.map((t) => ({ ...t, completions: 0, totalScore: 0, last7: 0 })));

  useEffect(() => {
    const load = () => {
      try {
        const stats = JSON.parse(localStorage.getItem('test_stats') || '{}');
        const weekly = JSON.parse(localStorage.getItem('test_stats_weekly') || '{}');
        const weekKey = `${new Date().getFullYear()}-W${Math.ceil(new Date().getDate() / 7)}`;
        const thisWeekTotal = weekly[weekKey] || 0;

        setTests(BASE_TESTS.map((t) => {
          const s = stats[String(t.id)] || { completions: 0, totalScore: 0 };
          const avgScore = s.completions > 0 ? (s.totalScore / s.completions) : 0;
          return { ...t, completions: s.completions, totalScore: s.totalScore, avgScore, last7: 0 };
        }));
      } catch {}
    };

    load();
    // localStorage değişince yenile
    window.addEventListener('storage', load);
    // Aynı sekmede değişiklikleri de yakala
    const interval = setInterval(load, 3000);
    return () => { window.removeEventListener('storage', load); clearInterval(interval); };
  }, []);

  const totalCompletions = tests.reduce((a, t) => a + t.completions, 0);
  const mostPopular = [...tests].sort((a, b) => b.completions - a.completions)[0];
  const maxCompletions = Math.max(...tests.map((t) => t.completions), 1);

  // Bu hafta toplamı
  let thisWeekTotal = 0;
  try {
    const weekly = JSON.parse(localStorage.getItem('test_stats_weekly') || '{}');
    const weekKey = `${new Date().getFullYear()}-W${Math.ceil(new Date().getDate() / 7)}`;
    thisWeekTotal = weekly[weekKey] || 0;
  } catch {}

  return (
    <div className="space-y-5">
      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Test', value: String(BASE_TESTS.length), color: 'text-white' },
          { label: 'Toplam Tamamlanma', value: totalCompletions.toLocaleString('tr-TR'), color: 'text-teal-400' },
          { label: 'Bu Hafta', value: thisWeekTotal.toLocaleString('tr-TR'), color: 'text-blue-400' },
          { label: 'En Popüler', value: mostPopular?.completions > 0 ? mostPopular.name.split(' ').slice(0, 2).join(' ') : '—', color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color} truncate`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Popularity chart */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
        <h2 className="font-semibold text-white text-sm mb-5">Test Popülerlik Grafiği</h2>
        <div className="space-y-2.5">
          {[...tests].sort((a, b) => b.completions - a.completions).map((t) => (
            <div key={t.id} className="flex items-center gap-3">
              <div className="w-36 text-xs text-slate-400 truncate flex-shrink-0">{t.name.split('(')[0].split('&')[0].trim()}</div>
              <div className="flex-1 h-5 bg-slate-700 rounded-lg overflow-hidden">
                <div
                  className={`h-full ${t.color} rounded-lg flex items-center justify-end pr-2 transition-all duration-500`}
                  style={{ width: `${(t.completions / maxCompletions) * 100}%`, minWidth: t.completions > 0 ? '2rem' : '0' }}
                >
                  {t.completions > 0 && <span className="text-white text-[10px] font-bold">{t.completions}</span>}
                </div>
              </div>
              <div className="w-10 text-right text-xs text-slate-500 flex-shrink-0">{t.completions}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats table */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold text-white text-sm">Test İstatistikleri</h2>
          <span className="text-xs text-slate-500">Otomatik güncellenir</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Test Adı</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Ölçek</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Tamamlanma</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden md:table-cell">Ort. Puan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {[...tests].sort((a, b) => b.completions - a.completions).map((t) => (
                <tr key={t.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${t.color} flex-shrink-0`} />
                      <span className="text-sm text-white font-medium">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded-lg text-xs">{t.subtitle}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-sm font-semibold ${t.completions > 0 ? 'text-teal-400' : 'text-slate-500'}`}>
                      {t.completions.toLocaleString('tr-TR')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-400 hidden md:table-cell">
                    {t.avgScore > 0 ? t.avgScore.toFixed(1) : '—'}
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
