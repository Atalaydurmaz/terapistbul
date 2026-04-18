'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const suggestions = [
  'Son zamanlarda çok kaygılı hissediyorum',
  'İlişki sorunları yaşıyorum',
  'Depresyon belirtileri için yardım istiyorum',
  'Çocuğum için terapist arıyorum',
  'Travma sonrası iyileşmek istiyorum',
  'Kariyer stresi ve tükenmişlik',
  'Yas sürecinde destek almak istiyorum',
];

export default function AISearchBar({ initialValue = '' }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [focused, setFocused] = useState(false);

  const handleSearch = (q = query) => {
    if (q.trim()) {
      router.push(`/terapistler?q=${encodeURIComponent(q.trim())}`);
    } else {
      router.push('/terapistler');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search input */}
      <div className={`relative bg-white rounded-2xl border-2 transition-all duration-200 shadow-lg ${
        focused ? 'border-teal-500 shadow-teal-100' : 'border-slate-200 hover:border-slate-300'
      }`}>
        {/* AI indicator */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-violet-500 rounded-lg flex items-center justify-center ai-pulse">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zM7.5 13a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zm6 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z" />
            </svg>
          </div>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Ne hissediyorsunuz? Bize anlatın..."
          className="w-full pl-14 pr-32 py-4 bg-transparent text-slate-800 placeholder:text-slate-400 text-base focus:outline-none rounded-2xl"
        />

        <button
          onClick={() => handleSearch()}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
        >
          <span>Eşleştir</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      {/* Suggestion chips */}
      {focused && !query && (
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuery(s);
                handleSearch(s);
              }}
              className="text-xs bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-slate-600 hover:text-teal-700 px-3 py-1.5 rounded-full transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Trust line */}
      <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-3">
        <span className="flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Gizlilik korumalı
        </span>
        <span>·</span>
        <span>1,000+ aktif üye</span>
        <span>·</span>
        <span>Türkiye geneli</span>
      </p>
    </div>
  );
}
