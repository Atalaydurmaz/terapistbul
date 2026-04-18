'use client';

import { useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

const specialtyIcons = [
  { label: 'Anksiyete', emoji: '🌿' },
  { label: 'Depresyon', emoji: '🌤️' },
  { label: 'Travma', emoji: '🧩' },
  { label: 'Stres', emoji: '🌊' },
  { label: 'Yas', emoji: '🕊️' },
  { label: 'Öfke', emoji: '🌋' },
  { label: 'İlişki', emoji: '💞' },
  { label: 'Evlilik', emoji: '💍' },
  { label: 'Boşanma', emoji: '🌪️' },
  { label: 'Aile', emoji: '🏡' },
  { label: 'Ebeveynlik', emoji: '👶' },
  { label: 'Aldatma', emoji: '💔' },
  { label: 'Kariyer', emoji: '🚀' },
  { label: 'Tükenmişlik', emoji: '🔥' },
  { label: 'İşsizlik', emoji: '📉' },
  { label: 'Yapay Zeka', emoji: '🤖' },
  { label: 'Özgüven', emoji: '✨' },
  { label: 'Kimlik', emoji: '🪞' },
  { label: 'LGBTQ+', emoji: '🏳️‍🌈' },
  { label: 'Yalnızlık', emoji: '🫂' },
  { label: 'Mükemmeliyetçilik', emoji: '🎯' },
  { label: 'Uyku', emoji: '🌙' },
  { label: 'Yeme', emoji: '🍃' },
  { label: 'Bağımlılık', emoji: '🔗' },
  { label: 'Cinsellik', emoji: '💜' },
  { label: 'Kronik Ağrı', emoji: '🩺' },
  { label: 'Çocuk', emoji: '🎈' },
  { label: 'Ergen', emoji: '🌱' },
  { label: 'Öğrenme', emoji: '📚' },
  { label: 'Zorbalık', emoji: '🛡️' },
  { label: 'Fobia', emoji: '😨' },
  { label: 'OKB', emoji: '🔄' },
  { label: 'DEHB', emoji: '⚡' },
  { label: 'Yas & Kayıp', emoji: '🕯️' },
];

export default function SpecialtySlider() {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const rafRef = useRef(null);
  const currentXRef = useRef(0);
  const targetXRef = useRef(0);
  const isHoveringRef = useRef(false);

  // Smooth lerp animation loop
  useEffect(() => {
    const loop = () => {
      const diff = targetXRef.current - currentXRef.current;
      if (Math.abs(diff) > 0.05) {
        currentXRef.current += diff * 0.07;
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(${currentXRef.current}px)`;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = useCallback((e) => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    const rect = wrapper.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, mouseX / rect.width)); // 0→1

    const overflowAmount = track.scrollWidth - rect.width;
    const maxShift = overflowAmount > 0 ? overflowAmount + 60 : 160;

    // sol kenar → sağa kay (+), sağ kenar → sola kay (-)
    targetXRef.current = (0.5 - ratio) * maxShift;
  }, []);

  const handleMouseLeave = useCallback(() => {
    targetXRef.current = 0;
    isHoveringRef.current = false;
  }, []);

  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
  }, []);

  return (
    <section className="py-14 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Konuya Göre Terapist Bul</h2>
        </div>

        {/* Mouse takip alanı */}
        <div
          ref={wrapperRef}
          className="relative overflow-hidden cursor-none select-none"
          style={{ padding: '4px 0' }}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Kenar solma */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-slate-50 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-slate-50 to-transparent z-10" />

          {/* Kayan şerit */}
          <div
            ref={trackRef}
            className="flex gap-3 will-change-transform"
            style={{ width: 'max-content' }}
          >
            {specialtyIcons.map(({ label, emoji }) => (
              <Link
                key={label}
                href={`/terapistler?specialty=${encodeURIComponent(label)}`}
                className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 border border-slate-100 hover:border-teal-300 hover:shadow-md transition-all group"
                style={{ width: '96px', minWidth: '96px' }}
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs font-medium text-slate-600 group-hover:text-teal-700 text-center leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4 select-none">
          ← fareyi sola / sağa götürerek kaydırın →
        </p>
      </div>
    </section>
  );
}
