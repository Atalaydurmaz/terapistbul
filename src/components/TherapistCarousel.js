'use client';

import { useEffect, useRef, useState } from 'react';
import TherapistCard from './TherapistCard';
import { therapists } from '../data/therapists';
import Link from 'next/link';

const CARD_WIDTH = 300;
const GAP = 16;
const STEP = CARD_WIDTH + GAP; // 316px per card
const MAX_SPEED = 6;           // px per frame max

export default function TherapistCarousel() {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const rafRef = useRef(null);
  const offsetRef = useRef(0);       // current scroll offset
  const speedRef = useRef(0);        // current speed (px/frame, + = right scroll)
  const isHoverRef = useRef(false);

  const total = therapists.length; // 43
  const totalWidth = total * STEP;

  // Infinite scroll: duplicate list so we can loop seamlessly
  const doubled = [...therapists, ...therapists];

  // Animation loop
  useEffect(() => {
    const loop = () => {
      offsetRef.current += speedRef.current;

      // Seamless loop: when we've scrolled past the first copy, reset
      if (offsetRef.current >= totalWidth) offsetRef.current -= totalWidth;
      if (offsetRef.current < 0) offsetRef.current += totalWidth;

      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    speedRef.current = 1; // default auto-scroll speed
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [totalWidth]);

  const handleMouseMove = (e) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width; // 0 = far left, 1 = far right

    // Dead zone in the center (0.35–0.65) → slow auto scroll
    if (ratio < 0.35) {
      // Left zone: scroll backward
      const intensity = (0.35 - ratio) / 0.35; // 0→1
      speedRef.current = -intensity * MAX_SPEED;
    } else if (ratio > 0.65) {
      // Right zone: scroll forward faster
      const intensity = (ratio - 0.65) / 0.35; // 0→1
      speedRef.current = 1 + intensity * (MAX_SPEED - 1);
    } else {
      // Center: gentle auto-scroll
      speedRef.current = 0.5;
    }
  };

  const handleMouseLeave = () => {
    isHoverRef.current = false;
    speedRef.current = 1; // resume normal auto-scroll
  };

  const handleMouseEnter = () => {
    isHoverRef.current = true;
  };

  // Dot indicators (group of 4)
  const groupCount = Math.ceil(total / 4);
  const [activeGroup, setActiveGroup] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const group = Math.floor((offsetRef.current / STEP) % total / 4);
      setActiveGroup(Math.min(group, groupCount - 1));
    }, 300);
    return () => clearInterval(interval);
  }, [total, groupCount]);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Öne Çıkan Terapistler</h2>
            <p className="text-slate-500 text-sm mt-1">
              En yüksek puanlı ve onaylı uzmanlarımız —{' '}
              <span className="text-teal-600 font-medium">{total} terapist</span>
            </p>
          </div>
          <Link
            href="/terapistler"
            className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            Tümünü Gör
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        {/* Track */}
        <div
          ref={wrapperRef}
          className="relative overflow-hidden cursor-ew-resize select-none"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Edge fades */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent z-10" />

          <div
            ref={trackRef}
            className="flex gap-4 will-change-transform"
            style={{ width: `${doubled.length * STEP}px` }}
          >
            {doubled.map((t, i) => (
              <div key={`${t.id}-${i}`} style={{ width: `${CARD_WIDTH}px`, flexShrink: 0 }}>
                <TherapistCard therapist={t} />
              </div>
            ))}
          </div>
        </div>

        {/* Hint */}
        <p className="text-center text-xs text-slate-400 mt-4 select-none">
          ← fareyi sola götürün · sağa götürün →
        </p>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: groupCount }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === activeGroup
                  ? 'bg-teal-500 w-6 h-2'
                  : 'bg-slate-200 w-2 h-2'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
