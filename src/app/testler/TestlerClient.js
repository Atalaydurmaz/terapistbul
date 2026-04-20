'use client';

import { useState } from 'react';
import Link from 'next/link';
import { tests } from '../../data/tests';

const AREAS = [
  {
    key: 'Tümü',
    label: 'Tümü',
    icon: '🧩',
    bg: 'bg-teal-600',
    text: 'text-white',
    border: 'border-teal-600',
    inactiveBg: 'bg-white',
    inactiveText: 'text-slate-600',
    inactiveBorder: 'border-slate-200',
  },
  {
    key: 'Ruh Hali',
    label: 'Ruh Hali',
    icon: '😔',
    bg: 'bg-blue-600',
    text: 'text-white',
    border: 'border-blue-600',
    inactiveBg: 'bg-blue-50',
    inactiveText: 'text-blue-700',
    inactiveBorder: 'border-blue-200',
    activeSub: 'bg-blue-600',
  },
  {
    key: 'Stres & Tükenmişlik',
    label: 'Stres & Tükenmişlik',
    icon: '🔥',
    bg: 'bg-red-600',
    text: 'text-white',
    border: 'border-red-600',
    inactiveBg: 'bg-red-50',
    inactiveText: 'text-red-700',
    inactiveBorder: 'border-red-200',
  },
  {
    key: 'Kişisel Gelişim',
    label: 'Kişisel Gelişim',
    icon: '🌱',
    bg: 'bg-emerald-600',
    text: 'text-white',
    border: 'border-emerald-600',
    inactiveBg: 'bg-emerald-50',
    inactiveText: 'text-emerald-700',
    inactiveBorder: 'border-emerald-200',
  },
  {
    key: 'Sosyal & İlişki',
    label: 'Sosyal & İlişki',
    icon: '💞',
    bg: 'bg-pink-600',
    text: 'text-white',
    border: 'border-pink-600',
    inactiveBg: 'bg-pink-50',
    inactiveText: 'text-pink-700',
    inactiveBorder: 'border-pink-200',
  },
  {
    key: 'Yaşam Kalitesi',
    label: 'Yaşam Kalitesi',
    icon: '🌟',
    bg: 'bg-indigo-600',
    text: 'text-white',
    border: 'border-indigo-600',
    inactiveBg: 'bg-indigo-50',
    inactiveText: 'text-indigo-700',
    inactiveBorder: 'border-indigo-200',
  },
  {
    key: 'Dijital Sağlık',
    label: 'Dijital Sağlık',
    icon: '📱',
    bg: 'bg-violet-600',
    text: 'text-white',
    border: 'border-violet-600',
    inactiveBg: 'bg-violet-50',
    inactiveText: 'text-violet-700',
    inactiveBorder: 'border-violet-200',
  },
  {
    key: 'Duygusal Sağlık',
    label: 'Duygusal Sağlık',
    icon: '💙',
    bg: 'bg-cyan-600',
    text: 'text-white',
    border: 'border-cyan-600',
    inactiveBg: 'bg-cyan-50',
    inactiveText: 'text-cyan-700',
    inactiveBorder: 'border-cyan-200',
  },
];

function TestCard({ test }) {
  return (
    <Link href={`/testler/${test.slug}`} className="group block h-full">
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:border-teal-300 hover:shadow-md transition-all h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <span className="text-4xl">{test.cover}</span>
          <span className="text-xs bg-teal-50 text-teal-700 border border-teal-100 font-semibold px-2 py-0.5 rounded-full">
            🤖 Yapay Zeka
          </span>
        </div>
        <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1 group-hover:text-teal-700 transition-colors">
          {test.title}
        </h3>
        <p className="text-xs text-slate-400 mb-2">{test.subtitle}</p>
        <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-4 line-clamp-3">
          {test.description}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {test.duration} dk
          </span>
          <span className="text-xs text-slate-400">{test.questionCount} soru</span>
          <span className="text-xs text-teal-600 font-medium group-hover:underline">Teste Gir →</span>
        </div>
      </div>
    </Link>
  );
}

export default function TestlerClient() {
  const [activeArea, setActiveArea] = useState('Tümü');

  const filteredTests = activeArea === 'Tümü'
    ? tests
    : tests.filter(t => t.category === activeArea);

  const activeAreaData = AREAS.find(a => a.key === activeArea);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Uyarı */}
      <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex gap-3">
        <span className="text-xl flex-shrink-0">⚠️</span>
        <p className="text-sm text-amber-800">
          <strong>Önemli Not:</strong> Bu testler yalnızca bilgi amaçlıdır ve klinik tanı koyma amacı taşımaz. Sonuçlar; lisanslı bir psikolog veya psikiyatristin değerlendirmesinin yerini tutamaz.
        </p>
      </div>

      {/* Alan Seçimi */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Alana Göre Filtrele</p>

        {/* 4'lü grid — Tümü hariç */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
          {AREAS.filter(a => a.key !== 'Tümü').map((area) => {
            const count = tests.filter(t => t.category === area.key).length;
            const isActive = activeArea === area.key;
            return (
              <button
                key={area.key}
                onClick={() => setActiveArea(isActive ? 'Tümü' : area.key)}
                className={`flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-2xl border transition-all duration-200 text-center ${
                  isActive
                    ? `${area.bg} ${area.text} ${area.border} shadow-lg`
                    : `${area.inactiveBg} ${area.inactiveText} ${area.inactiveBorder} hover:shadow-md hover:scale-[1.02]`
                }`}
              >
                <span className="text-2xl leading-none">{area.icon}</span>
                <span className="text-[12px] font-semibold leading-tight">{area.label}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/25 text-white' : 'bg-white/70 text-slate-500'
                }`}>
                  {count} test
                </span>
              </button>
            );
          })}
        </div>

        {/* Tümü butonu */}
        <button
          onClick={() => setActiveArea('Tümü')}
          className={`w-full py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
            activeArea === 'Tümü'
              ? 'bg-teal-600 text-white border-teal-600 shadow-md'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200'
          }`}
        >
          🧩 Tüm Testleri Göster ({tests.length} test)
        </button>
      </div>

      {/* Aktif Alan Başlığı */}
      {activeArea !== 'Tümü' && (
        <div className={`flex items-center gap-3 mb-6 px-4 py-3 rounded-2xl border ${activeAreaData?.inactiveBg} ${activeAreaData?.inactiveBorder}`}>
          <span className="text-2xl">{activeAreaData?.icon}</span>
          <div>
            <p className={`text-sm font-bold ${activeAreaData?.inactiveText}`}>{activeArea}</p>
            <p className="text-xs text-slate-400">{filteredTests.length} test bulundu</p>
          </div>
          <button
            onClick={() => setActiveArea('Tümü')}
            className="ml-auto text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            ✕ Filtreyi Kaldır
          </button>
        </div>
      )}

      {/* Test Grid */}
      {activeArea === 'Tümü' ? (
        /* Kategoriye göre gruplu görünüm */
        AREAS.filter(a => a.key !== 'Tümü').map((area) => {
          const areaTests = tests.filter(t => t.category === area.key);
          if (areaTests.length === 0) return null;
          return (
            <div key={area.key} className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xl">{area.icon}</span>
                <h2 className={`text-base font-bold ${area.inactiveText}`}>{area.label}</h2>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${area.inactiveBg} ${area.inactiveText} ${area.inactiveBorder}`}>
                  {areaTests.length} test
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {areaTests.map(test => <TestCard key={test.slug} test={test} />)}
              </div>
            </div>
          );
        })
      ) : (
        /* Filtrelenmiş görünüm */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTests.map(test => <TestCard key={test.slug} test={test} />)}
        </div>
      )}

      {/* CTA */}
      <div className="mt-10 bg-gradient-to-r from-teal-600 to-teal-700 rounded-3xl p-8 text-center text-white">
        <div className="text-4xl mb-3">🧠</div>
        <h2 className="text-xl font-bold mb-2">Testler sadece başlangıç</h2>
        <p className="text-teal-100 text-sm mb-5 max-w-md mx-auto">
          Psikolojik test sonuçlarınızı bir uzmanla değerlendirin. Kişiselleştirilmiş terapi planı için terapistlerimize göz atın.
        </p>
        <Link
          href="/terapistler"
          className="inline-block bg-white text-teal-700 font-semibold px-6 py-2.5 rounded-full hover:bg-teal-50 transition-colors"
        >
          Uzman Terapist Bul
        </Link>
      </div>
    </div>
  );
}
