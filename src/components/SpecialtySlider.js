'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px) and (pointer: fine)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Desktop mouse-follow lerp
  useEffect(() => {
    if (!isDesktop) return;
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
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (trackRef.current) trackRef.current.style.transform = '';
      currentXRef.current = 0;
      targetXRef.current = 0;
    };
  }, [isDesktop]);

  const handleMouseMove = useCallback((e) => {
    if (!isDesktop) return;
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;
    const rect = wrapper.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, mouseX / rect.width));
    const overflowAmount = track.scrollWidth - rect.width;
    const maxShift = overflowAmount > 0 ? overflowAmount + 60 : 160;
    targetXRef.current = (0.5 - ratio) * maxShift;
  }, [isDesktop]);

  const handleMouseLeave = useCallback(() => {
    targetXRef.current = 0;
  }, []);

  return (
    <section className="py-14 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Konuya Göre Terapist Bul</h2>
        </div>

        <div
          ref={wrapperRef}
          className={`relative select-none ${isDesktop ? 'overflow-hidden cursor-none' : 'overflow-x-auto overflow-y-hidden scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6'}`}
          style={isDesktop ? { padding: '4px 0' } : { padding: '4px 0', WebkitOverflowScrolling: 'touch' }}
          onMouseMove={isDesktop ? handleMouseMove : undefined}
          onMouseLeave={isDesktop ? handleMouseLeave : undefined}
        >
          {isDesktop && (
            <>
              <div className="pointer-events-none absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-slate-50 to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-slate-50 to-transparent z-10" />
            </>
          )}

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

        {isDesktop && (
          <p className="text-center text-xs text-slate-400 mt-4 select-none">
            ← fareyi sola / sağa götürerek kaydırın →
          </p>
        )}
      </div>
    </section>
  );
}
