'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { blogPosts } from '../../data/blogPosts';
import { blogPostsExtra } from '../../data/blogPosts2';
import { blogPostsExtra3 } from '../../data/blogPosts3';
import { blogPostsExtra4 } from '../../data/blogPosts4';

const allPosts = [...blogPosts, ...blogPostsExtra, ...blogPostsExtra3, ...blogPostsExtra4];

const POSTS_PER_PAGE = 9;

const SPECIALTIES = [
  {
    name: 'Klinik Psikoloji',
    icon: '🧠',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    activeBg: 'bg-rose-600',
    activeText: 'text-white',
    text: 'text-rose-700',
    subBg: 'bg-rose-50',
    subBorder: 'border-rose-200',
    subText: 'text-rose-700',
    subActiveBg: 'bg-rose-600',
    subcategories: [
      'Anksiyete', 'Anksiyete & Kaygı', 'Depresyon', 'Fobiler',
      'Travma', 'Travma ve Kayıp', 'Kişilik Bozuklukları', 'Psikotik Bozukluklar',
      'Bağımlılık', 'Yeme Bozuklukları', 'Uyku Bozuklukları', 'Yas',
      'Kronik Yorgunluk', 'Davranış Bozuklukları', 'Cinsel Sağlık',
      'Terapi Yaklaşımları', 'Terapi Yöntemleri', 'Psikanaliz',
      'Analitik Psikoloji', 'Varoluşçu Psikoloji', 'Transpersonal Psikoloji',
      'Pozitif Psikoloji', 'Psikoloji', 'Rehber',
    ],
  },
  {
    name: 'Gelişim Psikolojisi',
    icon: '🌱',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    activeBg: 'bg-emerald-600',
    activeText: 'text-white',
    text: 'text-emerald-700',
    subBg: 'bg-emerald-50',
    subBorder: 'border-emerald-200',
    subText: 'text-emerald-700',
    subActiveBg: 'bg-emerald-600',
    subcategories: [
      'Çocuk & Ergen', 'Gelişim Psikolojisi', 'Yaşlılık', 'Özel Eğitim',
    ],
  },
  {
    name: 'Sosyal Psikoloji',
    icon: '👥',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    activeBg: 'bg-blue-600',
    activeText: 'text-white',
    text: 'text-blue-700',
    subBg: 'bg-blue-50',
    subBorder: 'border-blue-200',
    subText: 'text-blue-700',
    subActiveBg: 'bg-blue-600',
    subcategories: [
      'Sosyal Psikoloji', 'İlişki & Aile', 'Cinsiyet ve Kimlik',
      'Yalnızlık', 'Kadın Psikolojisi', 'Erkek Psikolojisi',
      'Kadın Sağlığı', 'Dijital Psikoloji', 'Ekopsikoloji', 'Çevre Psikolojisi',
    ],
  },
  {
    name: 'Endüstri & Örgüt',
    icon: '💼',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    activeBg: 'bg-amber-600',
    activeText: 'text-white',
    text: 'text-amber-700',
    subBg: 'bg-amber-50',
    subBorder: 'border-amber-200',
    subText: 'text-amber-700',
    subActiveBg: 'bg-amber-600',
    subcategories: [
      'İş ve Kariyer', 'Kariyer & Stres', 'Finansal Psikoloji',
    ],
  },
  {
    name: 'Eğitim Psikolojisi',
    icon: '📖',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    activeBg: 'bg-violet-600',
    activeText: 'text-white',
    text: 'text-violet-700',
    subBg: 'bg-violet-50',
    subBorder: 'border-violet-200',
    subText: 'text-violet-700',
    subActiveBg: 'bg-violet-600',
    subcategories: [
      'Kişisel Gelişim', 'Bilişsel Sağlık', 'Bilişsel Psikoloji',
      'Öz Saygı', 'Kimlik ve Benlik', 'Kimlik ve Kişilik', 'Yaratıcılık Psikolojisi',
    ],
  },
  {
    name: 'Adli Psikoloji',
    icon: '⚖️',
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    activeBg: 'bg-slate-700',
    activeText: 'text-white',
    text: 'text-slate-700',
    subBg: 'bg-slate-50',
    subBorder: 'border-slate-300',
    subText: 'text-slate-700',
    subActiveBg: 'bg-slate-700',
    subcategories: ['Adli Psikoloji'],
  },
  {
    name: 'Nöropsikoloji',
    icon: '🔬',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    activeBg: 'bg-cyan-600',
    activeText: 'text-white',
    text: 'text-cyan-700',
    subBg: 'bg-cyan-50',
    subBorder: 'border-cyan-200',
    subText: 'text-cyan-700',
    subActiveBg: 'bg-cyan-600',
    subcategories: ['Nöropsikoloji', 'Sağlık & Beden'],
  },
  {
    name: 'Spor Psikolojisi',
    icon: '🏃',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    activeBg: 'bg-orange-500',
    activeText: 'text-white',
    text: 'text-orange-600',
    subBg: 'bg-orange-50',
    subBorder: 'border-orange-200',
    subText: 'text-orange-600',
    subActiveBg: 'bg-orange-500',
    subcategories: ['Performans Psikolojisi', 'Spor Psikolojisi'],
  },
];

function BlogCard({ post, aiReason }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm card-hover group-hover:border-teal-200 transition-all h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{post.cover}</span>
          <span className="text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full whitespace-nowrap truncate max-w-[55%]">
            {post.category}
          </span>
        </div>
        <h2 className="text-sm font-bold text-slate-800 leading-snug mb-2 group-hover:text-teal-700 transition-colors line-clamp-2 flex-shrink-0">
          {post.title}
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1 mb-3">
          {post.excerpt}
        </p>
        {aiReason && (
          <div className="flex items-center gap-1.5 mb-3 bg-violet-50 border border-violet-100 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px]">✨</span>
            <span className="text-[11px] text-violet-700 font-medium leading-snug">{aiReason}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {post.readTime} dk
          </span>
          <span className="text-[11px] text-teal-600 font-medium group-hover:underline">Devamını Oku →</span>
        </div>
      </article>
    </Link>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-10 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ← Önceki
      </button>

      {getPages().map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="px-2 py-2 text-slate-400 text-sm">•••</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
              currentPage === page
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-teal-50 hover:text-teal-700'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Sonraki →
      </button>
    </div>
  );
}

function AISearchLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-violet-100 p-4 shadow-sm animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 bg-slate-100 rounded-full" />
            <div className="w-20 h-5 bg-slate-100 rounded-full" />
          </div>
          <div className="h-4 bg-slate-100 rounded mb-2 w-full" />
          <div className="h-4 bg-slate-100 rounded mb-2 w-4/5" />
          <div className="h-3 bg-slate-100 rounded mb-1 w-full" />
          <div className="h-3 bg-slate-100 rounded mb-3 w-3/4" />
          <div className="h-8 bg-violet-50 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function BlogPage() {
  const [activeSpecialty, setActiveSpecialty] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // AI search state
  const [aiMode, setAiMode] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResults, setAiResults] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const inputRef = useRef(null);

  const currentSpecialty = SPECIALTIES.find(s => s.name === activeSpecialty) || null;

  // Basic filtered posts (non-AI mode)
  const filtered = useMemo(() => {
    return allPosts.filter((post) => {
      let matchCat;
      if (activeCategory !== 'Tümü') {
        matchCat = post.category === activeCategory;
      } else if (activeSpecialty) {
        const sp = SPECIALTIES.find(s => s.name === activeSpecialty);
        matchCat = sp ? sp.subcategories.includes(post.category) : true;
      } else {
        matchCat = true;
      }
      const matchSearch =
        !search ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        (post.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [activeCategory, activeSpecialty, search]);

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const handleSpecialtyChange = (name) => {
    if (activeSpecialty === name) {
      setActiveSpecialty(null);
      setActiveCategory('Tümü');
    } else {
      setActiveSpecialty(name);
      setActiveCategory('Tümü');
    }
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearch = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAiSearch = async () => {
    const q = aiQuery.trim();
    if (!q || q.length < 2) return;

    setAiLoading(true);
    setAiError('');
    setAiResults(null);

    try {
      const res = await fetch('/api/blog-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hata oluştu');
      setAiResults(data.results || []);
    } catch (err) {
      setAiError(err.message || 'Arama sırasında bir hata oluştu');
    } finally {
      setAiLoading(false);
    }
  };

  const handleToggleAiMode = () => {
    const next = !aiMode;
    setAiMode(next);
    if (!next) {
      setAiResults(null);
      setAiQuery('');
      setAiError('');
    } else {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleAiKeyDown = (e) => {
    if (e.key === 'Enter') handleAiSearch();
  };

  return (
    <div className="bg-[#f0fdfa] min-h-screen">
      {/* Header */}
      <section className="bg-gradient-hero py-14 border-b border-teal-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-600 border border-teal-700 text-white text-lg font-bold px-7 py-3 rounded-2xl mb-5 shadow-lg shadow-teal-200">
            📚 Psikoloji Blogu
          </div>
          <p className="text-slate-500 max-w-xl mx-auto mb-8">
            Uzman psikologların katkısıyla hazırlanan bilimsel içerikler. Anksiyete, depresyon, ilişkiler ve daha fazlası.
          </p>

          {/* Search area */}
          <div className="max-w-lg mx-auto space-y-3">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleToggleAiMode}
                className={`inline-flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-full border transition-all shadow-md ${
                  aiMode
                    ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-white border-teal-400 shadow-teal-200 scale-105'
                    : 'bg-gradient-to-r from-teal-300 to-emerald-300 text-teal-900 border-teal-300 shadow-teal-100 hover:from-teal-400 hover:to-emerald-400 hover:text-white hover:shadow-teal-200 hover:scale-105'
                }`}
              >
                <span className={aiMode ? 'animate-spin' : 'text-xl'} style={aiMode ? { animationDuration: '3s' } : {}}>✨</span>
                {aiMode ? 'AI Arama Aktif' : 'AI ile Ara'}
                {!aiMode && <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full font-semibold">YENİ</span>}
              </button>
              {aiMode && (
                <span className="text-[11px] text-violet-500 font-medium">
                  Doğal dilde yazabilirsin
                </span>
              )}
            </div>

            {aiMode ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400 text-base">✨</span>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Örn: kaygım var, uyuyamıyorum, ilişki sorunum..."
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={handleAiKeyDown}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-violet-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 shadow-sm"
                  />
                </div>
                <button
                  onClick={handleAiSearch}
                  disabled={aiLoading || !aiQuery.trim()}
                  className="px-5 py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm whitespace-nowrap"
                >
                  {aiLoading ? 'Aranıyor...' : 'Ara'}
                </button>
              </div>
            ) : (
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Makale ara..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 shadow-sm"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* AI Search Results */}
        {aiMode ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-violet-700">✨ Yapay Zeka Arama</span>
                {aiResults && (
                  <span className="text-xs text-slate-400">{aiResults.length} öneri bulundu</span>
                )}
              </div>
              <button onClick={handleToggleAiMode} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                ← Normal aramaya dön
              </button>
            </div>

            {aiLoading && <AISearchLoadingSkeleton />}

            {aiError && (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="text-slate-500 text-sm">{aiError}</p>
                <button onClick={handleAiSearch} className="mt-3 text-sm text-teal-600 font-medium hover:underline">
                  Tekrar dene
                </button>
              </div>
            )}

            {!aiLoading && aiResults === null && !aiError && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">✨</div>
                <p className="text-slate-600 font-medium mb-1">Nasıl hissediyorsunuz?</p>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                  Doğal dilde yazın — AI size en uygun makaleleri bulsun.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-5">
                  {['Çok kaygılıyım', 'Uyuyamıyorum', 'Mutsuzum', 'İlişki sorunum var', 'Kendime güvenemiyorum', 'İş stresi'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setAiQuery(s)}
                      className="text-xs px-3 py-1.5 bg-white border border-violet-100 text-violet-600 rounded-full hover:border-violet-400 hover:bg-violet-50 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!aiLoading && aiResults !== null && aiResults.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-slate-500">Eşleşen makale bulunamadı.</p>
                <p className="text-slate-400 text-sm mt-1">Farklı kelimeler kullanmayı deneyin.</p>
              </div>
            )}

            {!aiLoading && aiResults && aiResults.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiResults.map(({ post, reason }) =>
                    post ? <BlogCard key={post.slug} post={post} aiReason={reason} /> : null
                  )}
                </div>
                <p className="text-center text-[11px] text-slate-400 mt-6">
                  AI önerileri bilgi amaçlıdır. Profesyonel destek için terapist bulucu aracımızı kullanın.
                </p>
              </>
            )}
          </>
        ) : (
          <>
            {/* ── Uzmanlık Alanları ── */}
            <div className="mb-6">
              {/* Tümü butonu */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => { setActiveSpecialty(null); setActiveCategory('Tümü'); setCurrentPage(1); }}
                  className={`text-sm px-5 py-2 rounded-full font-semibold border transition-all duration-200 ${
                    !activeSpecialty && activeCategory === 'Tümü'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-[0_2px_12px_rgba(13,148,136,0.35)]'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200'
                  }`}
                >
                  Tümü
                </button>
                <span className="text-xs text-slate-400">{filtered.length} makale · Sayfa {currentPage}/{totalPages}</span>
              </div>

              {/* 8 Uzmanlık kartı — 4 sütunlu grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                {SPECIALTIES.map((sp) => {
                  const isActive = activeSpecialty === sp.name;
                  const count = allPosts.filter(p => sp.subcategories.includes(p.category)).length;
                  return (
                    <button
                      key={sp.name}
                      onClick={() => handleSpecialtyChange(sp.name)}
                      className={`group relative flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-2xl border transition-all duration-200 text-center ${
                        isActive
                          ? `${sp.activeBg} ${sp.activeText} border-transparent shadow-lg`
                          : `bg-white ${sp.text} ${sp.border} hover:${sp.bg} hover:shadow-md`
                      }`}
                    >
                      <span className="text-2xl leading-none">{sp.icon}</span>
                      <span className="text-[12px] font-semibold leading-tight">{sp.name}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count} makale
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Alt kategoriler (seçili uzmanlık varsa) */}
              {currentSpecialty && (
                <div className={`rounded-2xl border p-4 ${currentSpecialty.subBg} ${currentSpecialty.subBorder}`}>
                  <p className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${currentSpecialty.subText} opacity-60`}>
                    {currentSpecialty.name} · Alt Dallar
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentSpecialty.subcategories.map((cat) => {
                      const isActive = activeCategory === cat;
                      const catCount = allPosts.filter(p => p.category === cat).length;
                      if (catCount === 0) return null;
                      return (
                        <button
                          key={cat}
                          onClick={() => handleCategoryChange(isActive ? 'Tümü' : cat)}
                          className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full font-medium border transition-all duration-200 ${
                            isActive
                              ? `${currentSpecialty.subActiveBg} text-white border-transparent shadow-sm`
                              : `bg-white ${currentSpecialty.subText} ${currentSpecialty.subBorder} hover:shadow-sm`
                          }`}
                        >
                          {cat}
                          <span className={`text-[10px] font-semibold ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                            {catCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Grid */}
            {paginated.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-slate-500">Arama sonucu bulunamadı</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginated.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-14 bg-gradient-to-r from-teal-600 to-teal-700 rounded-3xl p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Profesyonel destek almaya hazır mısınız?</h2>
          <p className="text-teal-100 text-sm mb-5">Makaleler bilgi verir; gerçek değişim uzman desteğiyle başlar.</p>
          <Link href="/terapistler" className="inline-block bg-white text-teal-700 font-semibold px-6 py-2.5 rounded-full hover:bg-teal-50 transition-colors">
            Terapist Bul
          </Link>
        </div>
      </div>
    </div>
  );
}
