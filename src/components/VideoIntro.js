'use client';

import { useState, useRef, useEffect } from 'react';

function getYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getVimeoId(url) {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}

function formatTime(s) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function VideoIntro({ src, name }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef(null);
  const hideTimer = useRef(null);

  const youtubeId = getYouTubeId(src || '');
  const vimeoId = !youtubeId ? getVimeoId(src || '') : null;
  const isEmbed = !!(youtubeId || vimeoId);

  const embedSrc = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1`
    : vimeoId
    ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1`
    : null;

  useEffect(() => {
    return () => clearTimeout(hideTimer.current);
  }, []);

  const revealControls = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  const handlePlay = () => {
    if (isEmbed) { setPlaying(true); return; }
    videoRef.current?.play();
    setPlaying(true);
    revealControls();
  };

  const handlePause = (e) => {
    e.stopPropagation();
    videoRef.current?.pause();
    setPlaying(false);
    setShowControls(true);
    clearTimeout(hideTimer.current);
  };

  const handleStop = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setShowControls(false);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = ratio * v.duration;
  };

  const handleEnded = () => {
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setShowControls(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-800 mb-4">Tanıtım Videosu</h2>
      <div
        className="relative rounded-xl overflow-hidden bg-slate-900 cursor-pointer group"
        style={{ aspectRatio: '16/9' }}
        onClick={!playing ? handlePlay : revealControls}
        onMouseMove={playing && !isEmbed ? revealControls : undefined}
      >
        {isEmbed && playing ? (
          <iframe
            src={embedSrc}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            title={`${name} tanıtım videosu`}
          />
        ) : !isEmbed ? (
          <video
            ref={videoRef}
            src={src}
            className="w-full h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            onEnded={handleEnded}
            playsInline
          />
        ) : null}

        {/* Başlangıç overlay */}
        {!playing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 hover:bg-black/50 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#0d9488" stroke="none">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <p className="mt-3 text-white text-sm font-medium opacity-90">{name} — Kısa Tanıtım</p>
            {youtubeId && <span className="mt-1 text-white/60 text-xs">YouTube</span>}
            {vimeoId && <span className="mt-1 text-white/60 text-xs">Vimeo</span>}
          </div>
        )}

        {/* Kontrol çubuğu — doğrudan video oynatılıyorken */}
        {playing && !isEmbed && (
          <div
            className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div
              className="w-full h-1.5 bg-white/30 cursor-pointer hover:h-2.5 transition-all"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-teal-400 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Butonlar */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
              {/* Duraklat */}
              <button
                type="button"
                onClick={handlePause}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
                title="Duraklat"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              </button>

              {/* Durdur */}
              <button
                type="button"
                onClick={handleStop}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
                title="Durdur"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="none">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
              </button>

              {/* Zaman */}
              <span className="text-white text-xs ml-1 tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Terapistin sizi tanıması için hazırladığı tanıtım videosu
      </p>
    </div>
  );
}
