'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const allDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const shortDay = { Pazartesi: 'Pzt', Salı: 'Sal', Çarşamba: 'Çar', Perşembe: 'Per', Cuma: 'Cum', Cumartesi: 'Cmt', Pazar: 'Paz' };

const bbMonths = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
const bbDaysFull = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];

function fmtBookingDate(ds) {
  const [y, m, d] = ds.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${d} ${bbMonths[m - 1]} ${bbDaysFull[date.getDay()]}`;
}

export default function BookingButtons({ therapistName, therapistEmail, selectedSlot, onSlotClear, availability, dayHours }) {
  const { data: session, status } = useSession();
  const [modal, setModal] = useState(null); // 'randevu' | 'mesaj' | null
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);

  // Slot seçimi (modal içi)
  const [pickedDay, setPickedDay] = useState(null);
  const [pickedHour, setPickedHour] = useState(null);

  // Format algılama: tarih bazlı (2026-04-07) vs haftanın günü adı
  const isDateBased = (availability || []).some(d => /^\d{4}-\d{2}-\d{2}$/.test(d));
  const bbNow = new Date();
  const bbToday = new Date(bbNow); bbToday.setHours(0,0,0,0);
  // toISOString UTC'ye çevirir — TR yerel tarihinde gün kayabilir. Yerel
  // bileşenlerden manuel kuralım ki "bugün" TR saatine göre doğru olsun.
  const bbTodayStr = `${bbToday.getFullYear()}-${String(bbToday.getMonth() + 1).padStart(2, '0')}-${String(bbToday.getDate()).padStart(2, '0')}`;
  const bbNowMinutes = bbNow.getHours() * 60 + bbNow.getMinutes();

  // Bir saatin (ör. "14:00") verilen gün için geçmişte kalıp kalmadığını döner.
  // Sadece tarih bazlı takvimde (bugünün tarihi) uygulanır; haftalık şablonda
  // "Çarşamba" seçimi gelecek haftaki Çarşamba olabileceği için gating atlanır.
  const isPastSlot = (day, hour) => {
    if (!day || !hour || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
    if (day > bbTodayStr) return false;
    if (day < bbTodayStr) return true;
    const [hh, mm] = String(hour).split(':').map(Number);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return false;
    return hh * 60 + mm <= bbNowMinutes;
  };

  // Bir günün tüm saatleri geçmişte mi? (bugün için tümüyle dolmuş gün)
  const allHoursPast = (day) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day !== bbTodayStr) return false;
    const hours = dayHours?.[day] || [];
    if (hours.length === 0) return false;
    return hours.every((h) => isPastSlot(day, h));
  };

  const futureDates = isDateBased
    ? [...(availability || [])]
        .filter(ds => ds >= bbTodayStr && !allHoursPast(ds))
        .sort()
    : [];

  const availableDays = isDateBased
    ? futureDates
    : (availability || []).filter((d) => allDays.includes(d));

  const hasSchedule = availableDays.length > 0;

  const openModal = (type) => {
    if (status === 'loading') return;
    if (!session) { setShowAuthWarning(true); return; }
    setShowAuthWarning(false);
    // Session'dan ad/mail otomatik doldur
    setForm({ name: session.user?.name || '', email: session.user?.email || '', phone: '', note: '' });
    // Eğer sağ panelden seçilmiş slot varsa onu kullan
    if (type === 'randevu' && selectedSlot) {
      setPickedDay(selectedSlot.day);
      setPickedHour(selectedSlot.hour);
    } else {
      setPickedDay(null);
      setPickedHour(null);
    }
    setModal(type);
  };

  // Sağ panelden slot seçilince otomatik aç
  useEffect(() => {
    if (selectedSlot) {
      if (!session && status !== 'loading') { setShowAuthWarning(true); return; }
      setForm((p) => ({ ...p, name: session?.user?.name || p.name, email: session?.user?.email || p.email }));
      setPickedDay(selectedSlot.day);
      setPickedHour(selectedSlot.hour);
      setModal('randevu');
    }
  }, [selectedSlot, session, status]);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modal === 'randevu' && isPastSlot(pickedDay, pickedHour)) {
      alert('Seçtiğiniz saat geçti. Lütfen gelecek bir saat seçin.');
      return;
    }
    setLoading(true);
    try {
      const body = { ...form, therapistName, therapistEmail, type: modal };
      if (modal === 'randevu' && (pickedDay || pickedHour)) {
        body.selectedDay = pickedDay;
        body.selectedHour = pickedHour;
        body.note = `${pickedDay || ''} ${pickedHour || ''}`.trim();
      }
      await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {}
    setLoading(false);
    setSent(true);
  };

  const closeModal = () => {
    setModal(null);
    setSent(false);
    setForm({ name: session?.user?.name || '', email: session?.user?.email || '', phone: '', note: '' });
    setPickedDay(null);
    setPickedHour(null);
    onSlotClear?.();
  };

  const hoursForDay = pickedDay ? (dayHours?.[pickedDay] || []) : [];

  return (
    <>
      <button
        onClick={() => openModal('randevu')}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition-colors"
      >
        Randevu Al
      </button>
      <p className="text-xs text-slate-400 text-center mt-2">
        Terapistinizle seans sonrası mesajlaşabilirsiniz.
      </p>

      {showAuthWarning && (
        <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" className="shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-sm text-amber-700">
            Devam etmek için{' '}
            <a href="/giris" className="font-semibold underline hover:text-amber-900">giriş yapmanız</a>
            {' '}veya{' '}
            <a href="/danisan-kaydol" className="font-semibold underline hover:text-amber-900">üye olmanız</a>
            {' '}gerekmektedir.
          </p>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeModal}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {sent ? (
              <div className="text-center py-10 px-6">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  {modal === 'randevu' ? 'Randevu Talebiniz Alındı!' : 'Mesajınız İletildi!'}
                </h3>
                <p className="text-sm text-slate-500 mb-5">
                  {modal === 'randevu' ? (
                    <>Randevunuzu <a href="/hesabim" className="text-teal-600 hover:underline font-medium">Hesabım</a> sayfasından takip edebilirsiniz.</>
                  ) : (
                    <>En kısa sürede <strong>{form.email}</strong> adresinize dönüş yapılacaktır.</>
                  )}
                </p>
                <button onClick={closeModal} className="bg-teal-600 text-white font-semibold px-8 py-2.5 rounded-xl hover:bg-teal-700 transition-colors">
                  Tamam
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-800">
                    {modal === 'randevu' ? 'Randevu Al' : 'Mesaj Gönder'}
                    {therapistName && <span className="text-slate-400 font-normal"> — {therapistName}</span>}
                  </h3>
                  <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[80vh] overflow-y-auto">

                  {/* 1. Oturum açmış kullanıcı rozeti — her zaman üstte */}
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(session?.user?.name || session?.user?.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{session?.user?.name || '—'}</p>
                      <p className="text-xs text-slate-400 truncate">{session?.user?.email}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5" className="ml-auto flex-shrink-0">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>

                  {/* 2. Mesaj notu — mesaj modunda üstte */}
                  {modal === 'mesaj' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Mesajınız <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={form.note}
                        onChange={set('note')}
                        placeholder="Mesajınızı yazın..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 resize-none"
                      />
                    </div>
                  )}

                  {/* 3. ── RANDEVU MODU: Gün & Saat seçimi altta ── */}
                  {modal === 'randevu' && (
                    <>
                      {/* Gün & Saat seçimi */}
                      {hasSchedule ? (
                        <>
                          {/* Tarih seçimi */}
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              <span className="flex items-center gap-1.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                Gün Seçin
                              </span>
                            </label>

                            {isDateBased ? (
                              /* Tarih bazlı: liste görünümü */
                              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                                {futureDates.map(ds => {
                                  const sel = pickedDay === ds;
                                  return (
                                    <button
                                      key={ds}
                                      type="button"
                                      onClick={() => { setPickedDay(ds); setPickedHour(null); }}
                                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all border
                                        ${sel
                                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                          : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:text-teal-600'}`}
                                    >
                                      {fmtBookingDate(ds)}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              /* Haftanın günleri: eski ızgara görünümü */
                              <div className="grid grid-cols-7 gap-1">
                                {allDays.map((day) => {
                                  const ok = availableDays.includes(day);
                                  const sel = pickedDay === day;
                                  return (
                                    <button
                                      key={day}
                                      type="button"
                                      disabled={!ok}
                                      onClick={() => { setPickedDay(day); setPickedHour(null); }}
                                      className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-medium transition-all border
                                        ${!ok ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' :
                                          sel ? 'bg-teal-600 text-white border-teal-600 shadow-sm' :
                                          'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-600'}`}
                                    >
                                      <span>{shortDay[day]}</span>
                                      {ok && <span className={`w-1.5 h-1.5 rounded-full ${sel ? 'bg-white' : 'bg-teal-500'}`} />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Saat seçimi */}
                          {pickedDay && (
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">
                                <span className="flex items-center gap-1.5">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                  </svg>
                                  Saat Seçin —{' '}
                                  <span className="text-teal-600">
                                    {isDateBased ? fmtBookingDate(pickedDay) : pickedDay}
                                  </span>
                                </span>
                              </label>
                              {hoursForDay.length > 0 ? (
                                <>
                                  <div className="flex flex-wrap gap-2">
                                    {hoursForDay.map((h) => {
                                      const past = isPastSlot(pickedDay, h);
                                      return (
                                        <button
                                          key={h}
                                          type="button"
                                          disabled={past}
                                          onClick={() => { if (!past) setPickedHour(h); }}
                                          title={past ? 'Bu saat geçti' : undefined}
                                          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all
                                            ${past
                                              ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through'
                                              : pickedHour === h
                                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-600'}`}
                                        >
                                          {h}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {hoursForDay.every((h) => isPastSlot(pickedDay, h)) && (
                                    <p className="mt-2 text-xs text-slate-400 italic">Bugünün saatleri dolmuş — lütfen başka bir gün seçin.</p>
                                  )}
                                </>
                              ) : (
                                <p className="text-sm text-slate-400 italic">Bu gün için saat bilgisi girilmemiş.</p>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        /* Takvim yoksa serbest gün + saat girişi */
                        <div className="space-y-3">
                          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" className="shrink-0 mt-0.5">
                              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <p className="text-xs text-amber-700">Terapist takvimini henüz paylaşmadı. Tercih ettiğiniz gün ve saati yazın, terapist size dönecektir.</p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                              <span className="flex items-center gap-1.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                Tercih Ettiğiniz Gün
                              </span>
                            </label>
                            <input
                              value={pickedDay || ''}
                              onChange={(e) => setPickedDay(e.target.value)}
                              placeholder="Örn: Pazartesi, Salı-Çarşamba..."
                              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                              <span className="flex items-center gap-1.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                </svg>
                                Tercih Ettiğiniz Saat
                              </span>
                            </label>
                            <input
                              value={pickedHour || ''}
                              onChange={(e) => setPickedHour(e.target.value)}
                              placeholder="Örn: 14:00, öğleden sonra..."
                              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                            />
                          </div>
                        </div>
                      )}

                      {/* Seçilen slot özeti */}
                      {pickedDay && pickedHour && (
                        <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          <span className="text-sm font-semibold text-teal-700">
                            {isDateBased ? fmtBookingDate(pickedDay) : pickedDay}
                          </span>
                          <span className="bg-teal-600 text-white text-sm font-bold px-3 py-0.5 rounded-lg ml-auto">{pickedHour}</span>
                        </div>
                      )}

                      {/* Ek not */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Not <span className="text-slate-400 font-normal">(isteğe bağlı)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={form.note}
                          onChange={set('note')}
                          placeholder="Varsa eklemek istediğiniz bilgiler..."
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 resize-none"
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading || (modal === 'randevu' && (!pickedDay || !pickedHour) && hasSchedule)}
                    className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        Gönderiliyor...
                      </>
                    ) : modal === 'randevu' ? 'Randevu Talebi Gönder' : 'Mesaj Gönder'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
