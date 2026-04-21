'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TherapistCard from '../../components/TherapistCard';
import AISearchBar from '../../components/AISearchBar';
import { therapists as staticTherapists, cities, specialtyList, approachList, aiMatchTherapists } from '../../data/therapists';

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
        active
          ? 'bg-teal-600 text-white border-teal-600'
          : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-600'
      }`}
    >
      {label}
    </button>
  );
}

function TerapistlerContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialSpecialty = searchParams.get('specialty') || '';

  const [baseTherapists, setBaseTherapists] = useState([]);
  const [loadingTherapists, setLoadingTherapists] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [selectedCity, setSelectedCity] = useState('Tümü');
  const [selectedSpecialties, setSelectedSpecialties] = useState(
    initialSpecialty ? [initialSpecialty] : []
  );
  const [selectedApproaches, setSelectedApproaches] = useState([]);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState(initialQuery ? 'match' : 'rating');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch('/api/terapistler-db')
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) {
          setBaseTherapists(staticTherapists);
          setLoadingTherapists(false);
          return;
        }
        // Supabase verilerini site formatına normalize et
        const colors = ['#0d9488','#0891b2','#7c3aed','#db2777','#d97706','#16a34a','#dc2626','#2563eb'];
        const normalized = data
          .filter((t) => t.status === 'aktif')
          .map((t) => {
            const initials = (t.name || '')
              .split(' ')
              .filter(w => /^[A-ZÇĞİÖŞÜa-zçğışöşü]/.test(w))
              .map(w => w[0].toUpperCase())
              .slice(0, 2)
              .join('');
            const colorIdx = (t.name || '').charCodeAt(0) % colors.length;
            return {
              ...t,
              inPerson: t.in_person,
              reviewCount: t.review_count,
              photo: t.photo_url || null,
              initials: initials || '?',
              color: colors[colorIdx],
              aiTags: [],
            };
          });
        setBaseTherapists(normalized);
        setLoadingTherapists(false);
      })
      .catch(() => {
        setBaseTherapists(staticTherapists);
        setLoadingTherapists(false);
      });
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    if (q) setSortBy('match');
  }, [searchParams]);

  const toggleSpecialty = (s) => {
    setSelectedSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const toggleApproach = (a) => {
    setSelectedApproaches((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const results = useMemo(() => {
    let list = query ? aiMatchTherapists(query, baseTherapists) : [...baseTherapists];

    if (selectedCity !== 'Tümü') {
      list = list.filter((t) => t.city === selectedCity);
    }
    if (selectedSpecialties.length > 0) {
      list = list.filter((t) =>
        selectedSpecialties.some((s) =>
          t.specialties.some((ts) => ts.toLowerCase().includes(s.toLowerCase()))
        )
      );
    }
    if (selectedApproaches.length > 0) {
      list = list.filter((t) =>
        selectedApproaches.some((a) =>
          t.approaches.some((ta) => ta.toLowerCase().includes(a.toLowerCase()))
        )
      );
    }
    if (onlineOnly) {
      list = list.filter((t) => t.online);
    }
    list = list.filter((t) => t.price <= maxPrice);

    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'experience') list.sort((a, b) => b.experience - a.experience);
    // 'match' order already set by aiMatchTherapists

    return list;
  }, [query, selectedCity, selectedSpecialties, selectedApproaches, onlineOnly, maxPrice, sortBy, baseTherapists]);

  const activeFilterCount =
    (selectedCity !== 'Tümü' ? 1 : 0) +
    selectedSpecialties.length +
    selectedApproaches.length +
    (onlineOnly ? 1 : 0) +
    (maxPrice < 10000 ? 1 : 0);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Search header */}
      <div className="bg-white border-b border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            {query ? (
              <>
                <span className="text-teal-600">&quot;{query}&quot;</span> için eşleşmeler
              </>
            ) : (
              'Terapist Bul'
            )}
          </h1>
          <AISearchBar initialValue={query} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter toggle (mobile) + sort */}
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filtreler
              {activeFilterCount > 0 && (
                <span className="bg-white text-teal-600 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <span className="text-sm text-slate-400">{loadingTherapists ? 'Yükleniyor...' : `${results.length} uzman`}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Sırala:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-teal-500"
            >
              {query && <option value="match">Eşleşme Oranı</option>}
              <option value="rating">En Yüksek Puan</option>
              <option value="experience">Deneyim</option>
              <option value="price_asc">Düşük Ücret</option>
              <option value="price_desc">Yüksek Ücret</option>
            </select>
          </div>
        </div>

        {/* Inline filter panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-5 shadow-sm space-y-5">
            {/* City */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Şehir</p>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Specialty */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Uzmanlık Alanı</p>
              <div className="flex flex-wrap gap-2">
                {specialtyList.map((s) => (
                  <FilterChip
                    key={s}
                    label={s}
                    active={selectedSpecialties.includes(s)}
                    onClick={() => toggleSpecialty(s)}
                  />
                ))}
              </div>
            </div>

            {/* Approach */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Terapi Yaklaşımı</p>
              <div className="flex flex-wrap gap-2">
                {approachList.map((a) => (
                  <FilterChip
                    key={a}
                    label={a}
                    active={selectedApproaches.includes(a)}
                    onClick={() => toggleApproach(a)}
                  />
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Maksimum Seans Ücreti: {maxPrice.toLocaleString('tr-TR')} ₺
              </p>
              <input
                type="range"
                min="1000"
                max="10000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1.000 ₺</span>
                <span>10.000 ₺</span>
              </div>
            </div>

            {/* Online toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOnlineOnly(!onlineOnly)}
                className={`relative w-10 h-6 rounded-full transition-colors ${onlineOnly ? 'bg-teal-600' : 'bg-slate-200'}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${onlineOnly ? 'translate-x-5' : 'translate-x-1'}`}
                />
              </button>
              <span className="text-sm text-slate-700">Yalnızca Online Görüşme</span>
            </div>

            {/* Reset */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setSelectedCity('Tümü');
                  setSelectedSpecialties([]);
                  setSelectedApproaches([]);
                  setOnlineOnly(false);
                  setMaxPrice(1500);
                }}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {loadingTherapists ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                </div>
                <div className="h-9 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Sonuç bulunamadı</h3>
            <p className="text-slate-400 text-sm">Filtrelerinizi gevşetmeyi deneyin</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map((t) => (
              <TherapistCard key={t.id} therapist={t} showMatchScore={!!query && !!t.matchScore} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TerapistlerPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-96 text-slate-400">Yükleniyor...</div>}>
      <TerapistlerContent />
    </Suspense>
  );
}
