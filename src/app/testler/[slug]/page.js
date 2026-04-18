'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { tests } from '../../../data/tests';
import { useParams } from 'next/navigation';

function ScoreGauge({ score, maxScore, color }) {
  const pct = Math.min(100, Math.round((score / maxScore) * 100));
  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeDasharray="251" strokeDashoffset="0" strokeLinecap="round" />
        <circle
          cx="60" cy="60" r="50" fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray="251"
          strokeDashoffset={251 - (251 * pct) / 100}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
        <span className="text-3xl font-bold text-slate-900">{score}</span>
        <span className="text-xs text-slate-400">/ {maxScore}</span>
      </div>
    </div>
  );
}

function AITypingText({ text, delay = 0 }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, 12);
    return () => clearInterval(timer);
  }, [started, text]);

  return <span>{displayed}</span>;
}

export default function TestPage() {
  const params = useParams();
  const test = tests.find((t) => t.slug === params.slug);

  const [step, setStep] = useState('intro'); // intro | questions | analyzing | results
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const analyzeSteps = [
    'Yanıtlarınız işleniyor...',
    'Klinik ölçeklerle karşılaştırılıyor...',
    'Örüntüler analiz ediliyor...',
    'AI modeli değerlendirme yapıyor...',
    'Kişiselleştirilmiş rapor hazırlanıyor...',
  ];

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0fdfa]">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Test bulunamadı.</p>
          <Link href="/testler" className="text-teal-600 hover:underline">← Testlere dön</Link>
        </div>
      </div>
    );
  }

  const maxScore = test.questions.length * (test.options[test.options.length - 1].value);
  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const levelData = test.scoring.find((s) => totalScore >= s.min && totalScore <= s.max) || test.scoring[test.scoring.length - 1];
  const analysisData = test.analysis[levelData.level];

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQ]: value };
    setAnswers(newAnswers);
    if (currentQ < test.questions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    } else {
      // All answered → start analysis
      setTimeout(() => startAnalysis(), 400);
    }
  };

  const startAnalysis = () => {
    setStep('analyzing');
    let progress = 0;
    let stepIndex = 0;
    const interval = setInterval(() => {
      progress += 2;
      if (progress % 20 === 0 && stepIndex < analyzeSteps.length - 1) {
        stepIndex++;
        setAnalyzeStep(stepIndex);
      }
      setAnalyzeProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setStep('results');
          setTimeout(() => setShowResult(true), 300);
          // Test tamamlandı — istatistiği kaydet
          try {
            const stats = JSON.parse(localStorage.getItem('test_stats') || '{}');
            const key = String(test.id);
            const prev = stats[key] || { completions: 0, totalScore: 0 };
            stats[key] = {
              completions: prev.completions + 1,
              totalScore: prev.totalScore + totalScore,
              lastCompletedAt: new Date().toISOString(),
            };
            localStorage.setItem('test_stats', JSON.stringify(stats));
            // Bu hafta sayacı
            const weekly = JSON.parse(localStorage.getItem('test_stats_weekly') || '{}');
            const weekKey = `${new Date().getFullYear()}-W${Math.ceil(new Date().getDate() / 7)}`;
            weekly[weekKey] = (weekly[weekKey] || 0) + 1;
            localStorage.setItem('test_stats_weekly', JSON.stringify(weekly));
          } catch {}
        }, 500);
      }
    }, 40);
  };

  const resetTest = () => {
    setStep('intro');
    setAnswers({});
    setCurrentQ(0);
    setAnalyzeProgress(0);
    setAnalyzeStep(0);
    setShowResult(false);
  };

  // ─── INTRO ────────────────────────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div className="bg-[#f0fdfa] min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Link href="/testler" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 mb-6 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Testlere Dön
          </Link>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className={`bg-gradient-to-br ${test.color} p-8 text-white`}>
              <div className="text-6xl mb-4">{test.cover}</div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                🤖 Yapay Zeka Destekli Analiz
              </div>
              <h1 className="text-2xl font-bold mb-1">{test.title}</h1>
              <p className="text-white/80 text-sm">{test.subtitle}</p>
            </div>

            <div className="p-8">
              <p className="text-slate-600 text-sm leading-relaxed mb-6">{test.description}</p>

              {/* Meta */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Soru Sayısı', value: `${test.questionCount} soru`, icon: '❓' },
                  { label: 'Tahmini Süre', value: `${test.duration} dakika`, icon: '⏱️' },
                  { label: 'Analiz Tipi', value: 'AI Destekli', icon: '🤖' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="text-xl mb-1">{icon}</div>
                    <p className="text-xs font-bold text-slate-800">{value}</p>
                    <p className="text-xs text-slate-400">{label}</p>
                  </div>
                ))}
              </div>

              {/* Instruction */}
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-6">
                <p className="text-xs font-semibold text-teal-800 mb-1">📋 Talimat</p>
                <p className="text-sm text-teal-700">{test.instruction}</p>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
                <p className="text-xs text-amber-700">
                  ⚠️ Bu test klinik tanı koymaz. Sonuçlar bilgi amaçlıdır ve uzman değerlendirmesinin yerini tutamaz.
                </p>
              </div>

              <button
                onClick={() => setStep('questions')}
                className={`w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r ${test.color} hover:opacity-90 transition-opacity shadow-md`}
              >
                Teste Başla →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── QUESTIONS ────────────────────────────────────────────────────────────
  if (step === 'questions') {
    const progress = Math.round((currentQ / test.questions.length) * 100);

    return (
      <div className="bg-[#f0fdfa] min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">{test.title}</span>
              <span className="text-sm text-slate-400">
                {currentQ + 1} / {test.questions.length}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className={`bg-gradient-to-r ${test.color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            {/* Question number */}
            <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-4 ${test.bgColor} ${test.textColor} border ${test.borderColor}`}>
              Soru {currentQ + 1}
            </div>

            {/* Question */}
            <h2 className="text-lg font-bold text-slate-900 mb-8 leading-snug">
              {test.questions[currentQ]}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {test.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  className={`w-full text-left px-5 py-3.5 rounded-xl border-2 transition-all font-medium text-sm
                    ${answers[currentQ] === opt.value
                      ? `border-teal-500 bg-teal-50 text-teal-800`
                      : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50'
                    }`}
                >
                  <span className="inline-flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      answers[currentQ] === opt.value ? 'border-teal-500 bg-teal-500' : 'border-slate-300'
                    }`}>
                      {answers[currentQ] === opt.value && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Nav buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => currentQ > 0 && setCurrentQ(currentQ - 1)}
                disabled={currentQ === 0}
                className="text-sm text-slate-400 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Önceki
              </button>
              {answers[currentQ] !== undefined && currentQ < test.questions.length - 1 && (
                <button
                  onClick={() => setCurrentQ(currentQ + 1)}
                  className="text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  Sonraki →
                </button>
              )}
              {answers[currentQ] !== undefined && currentQ === test.questions.length - 1 && (
                <button
                  onClick={startAnalysis}
                  className={`text-sm font-semibold px-4 py-2 rounded-lg text-white bg-gradient-to-r ${test.color}`}
                >
                  Analiz Et 🤖
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── ANALYZING ────────────────────────────────────────────────────────────
  if (step === 'analyzing') {
    return (
      <div className="bg-[#f0fdfa] min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-10">
            {/* Animated brain */}
            <div className="text-7xl mb-6 animate-pulse">🧠</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Yapay Zeka Analiz Ediyor</h2>
            <p className="text-sm text-slate-400 mb-8">Yanıtlarınız işleniyor, lütfen bekleyin...</p>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-teal-400 to-teal-600 h-3 rounded-full transition-all duration-100"
                style={{ width: `${analyzeProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mb-6">%{analyzeProgress}</p>

            {/* Step indicators */}
            <div className="space-y-2">
              {analyzeSteps.map((s, i) => (
                <div key={i} className={`flex items-center gap-2 text-sm transition-all ${i <= analyzeStep ? 'text-teal-700' : 'text-slate-300'}`}>
                  {i < analyzeStep ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : i === analyzeStep ? (
                    <div className="w-3.5 h-3.5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200" />
                  )}
                  <span className={i === analyzeStep ? 'font-semibold' : ''}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULTS ──────────────────────────────────────────────────────────────
  if (step === 'results') {
    return (
      <div className="bg-[#f0fdfa] min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Link href="/testler" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 mb-6 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Testlere Dön
          </Link>

          {/* Score card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-5">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                🤖 AI Analizi Tamamlandı
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-1">{test.title} Sonucunuz</h1>
              <p className="text-sm text-slate-400">{test.subtitle}</p>
            </div>

            {/* Gauge */}
            {showResult && <ScoreGauge score={totalScore} maxScore={maxScore} color={levelData.color} />}

            <div className="text-center mt-4">
              <span
                className="inline-flex items-center gap-2 text-base font-bold px-5 py-2 rounded-full"
                style={{ backgroundColor: levelData.color + '20', color: levelData.color }}
              >
                {levelData.emoji} {levelData.label}
              </span>
              <p className="text-sm text-slate-500 mt-2">{levelData.desc}</p>
            </div>

            {/* Score scale */}
            <div className="mt-6 grid grid-cols-4 gap-1.5">
              {test.scoring.map((s) => (
                <div
                  key={s.level}
                  className={`text-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                    levelData.level === s.level ? 'ring-2 ring-offset-1 scale-105' : 'opacity-50'
                  }`}
                  style={{
                    backgroundColor: s.color + '20',
                    color: s.color,
                    ringColor: s.color,
                  }}
                >
                  {s.emoji} {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🤖</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">AI Değerlendirmesi</h2>
                <p className="text-xs text-slate-400">TerapistBul Yapay Zeka Motoru</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ color: levelData.color }}>
              {analysisData.title}
            </h3>

            <div className="space-y-3">
              {showResult && analysisData.paragraphs.map((para, i) => (
                <p key={i} className="text-sm text-slate-600 leading-relaxed">
                  <AITypingText text={para} delay={i * 800} />
                </p>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-5">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              📋 Kişiselleştirilmiş Öneriler
            </h2>
            <ul className="space-y-2.5">
              {analysisData.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Professional help CTA */}
          {analysisData.professionalHelp ? (
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white text-center mb-5">
              <p className="text-lg font-bold mb-1">Profesyonel Destek Önerilir</p>
              <p className="text-teal-100 text-sm mb-4">
                Sonuçlarınız uzman desteğinin faydalı olacağını göstermektedir. Alanında uzman terapistlerimize göz atın.
              </p>
              <Link
                href={`/terapistler?q=${encodeURIComponent(test.tags[0])}`}
                className="inline-block bg-white text-teal-700 font-semibold px-6 py-2.5 rounded-full hover:bg-teal-50 transition-colors"
              >
                Uzman Terapist Bul →
              </Link>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center mb-5">
              <p className="text-emerald-800 font-bold mb-1">✅ İyi Durumdasınız!</p>
              <p className="text-emerald-700 text-sm mb-4">
                Ruh sağlığınızı korumak için diğer testleri de deneyebilirsiniz.
              </p>
              <Link
                href="/testler"
                className="inline-block bg-emerald-600 text-white font-semibold px-5 py-2 rounded-full hover:bg-emerald-700 transition-colors text-sm"
              >
                Diğer Testler
              </Link>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 text-xs text-slate-500">
            <strong>Hatırlatma:</strong> Bu test sonuçları bilgi amaçlıdır ve klinik tanı niteliği taşımaz. Endişeleriniz varsa lütfen bir ruh sağlığı uzmanına başvurun.
          </div>

          {/* Retake */}
          <button
            onClick={resetTest}
            className="w-full py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-medium hover:border-teal-300 hover:text-teal-700 transition-all text-sm"
          >
            🔄 Testi Yeniden Başlat
          </button>
        </div>
      </div>
    );
  }

  return null;
}
