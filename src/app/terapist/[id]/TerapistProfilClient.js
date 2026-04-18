'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TherapistCard from '../../../components/TherapistCard';
import BookingButtons from '../../../components/BookingButtons';
import VideoIntro from '../../../components/VideoIntro';

function Avatar({ initials, color, photo }) {
  if (photo) {
    const isBase64 = photo.startsWith('data:');
    return (
      <div className="w-24 h-24 rounded-3xl overflow-hidden flex-shrink-0 shadow-lg">
        {isBase64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="w-full h-full object-cover object-top" />
        ) : (
          <Image src={photo} alt="" width={96} height={96} className="w-full h-full object-cover object-top" />
        )}
      </div>
    );
  }
  return (
    <div
      className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-lg"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={star <= Math.round(rating) ? '#f59e0b' : 'none'}
          stroke="#f59e0b"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="ml-1 text-sm font-semibold text-slate-700">{rating}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-800 mb-4">{title}</h2>
      {children}
    </div>
  );
}

const dayMap = {
  Pazartesi: 'Pzt',
  Salı: 'Sal',
  Çarşamba: 'Çar',
  Perşembe: 'Per',
  Cuma: 'Cum',
  Cumartesi: 'Cmt',
  Pazar: 'Paz',
};

const allDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const trMonthsP = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const trDaysP   = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];

function fmtDateTr(ds) {
  const [y, m, d] = ds.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${d} ${trMonthsP[m - 1]} ${trDaysP[date.getDay()]}`;
}

export default function TerapistProfilClient({ therapist, others }) {
  const [data, setData] = useState(therapist);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    // 1. localStorage'dan anlık (aynı tarayıcı) verileri yükle
    const stored = localStorage.getItem(`panel_profil_${therapist.id}`);
    if (stored) {
      try {
        const s = JSON.parse(stored);
        setData((prev) => {
          const merged = { ...prev };
          if (s.formData?.adSoyad) merged.name = s.formData.adSoyad;
          if (s.formData?.unvan) merged.title = s.formData.unvan;
          if (s.formData?.sehir) merged.city = s.formData.sehir;
          if (s.formData?.ilce) merged.district = s.formData.ilce;
          if (s.formData?.email) merged.email = s.formData.email;
          if (s.about !== undefined) merged.about = s.about;
          if (s.education !== undefined) merged.education = s.education;
          if (s.price !== undefined) merged.price = s.price;
          if (s.duration !== undefined) merged.sessionDuration = s.duration;
          if (s.isOnline !== undefined) merged.online = s.isOnline;
          if (s.isFaceToFace !== undefined) merged.inPerson = s.isFaceToFace;
          if (s.availableDays !== undefined) merged.availability = s.availableDays;
          if (s.dayHours) merged.dayHours = s.dayHours;
          if (s.selectedSpecialties?.length) merged.specialties = s.selectedSpecialties;
          if (s.selectedApproaches?.length) merged.approaches = s.selectedApproaches;
          if (s.photoPreview) merged.photo = s.photoPreview;
          if (s.galleryPhotos?.length) merged.photos = s.galleryPhotos;
          if (s.introVideoUrl) merged.introVideo = s.introVideoUrl;
          return merged;
        });
      } catch { /* ignore */ }
    }

    // 2. Supabase'den güncel verileri çek (farklı cihazlarda da görünsün)
    fetch(`/api/public/terapist-profil/${therapist.id}`)
      .then((r) => r.json())
      .then((db) => {
        if (!db || !db.panel_id) return;
        setData((prev) => {
          const merged = { ...prev };
          if (db.available_days?.length) merged.availability = db.available_days;
          else if (db.available_days) merged.availability = db.available_days;
          if (db.day_hours && Object.keys(db.day_hours).length) merged.dayHours = db.day_hours;
          if (db.price) merged.price = db.price;
          if (db.duration) merged.sessionDuration = db.duration;
          if (db.is_online !== undefined) merged.online = db.is_online;
          if (db.is_face_to_face !== undefined) merged.inPerson = db.is_face_to_face;
          if (db.about) merged.about = db.about;
          if (db.education) merged.education = db.education;
          if (db.photo_url) merged.photo = db.photo_url;
          if (db.gallery_photos?.length) merged.photos = db.gallery_photos;
          if (db.intro_video_url) merged.introVideo = db.intro_video_url;
          return merged;
        });
      })
      .catch(() => {});
  }, [therapist.id]);

  const {
    name, title, city, district, online, inPerson, price,
    specialties, approaches, experience, education, about,
    sessionDuration, availability, dayHours, rating, reviewCount,
    verified, initials, color, photo, photos, introVideo, languages, freeConsultation, email,
  } = data;

  const therapistEmail = email || `${initials.toLowerCase()}@terapistbul.com`;

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/terapistler"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 mb-6 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Terapistlere Dön
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex gap-5 items-start">
                <div className="relative">
                  <Avatar initials={initials} color={color} photo={photo} />
                  {verified && (
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-teal-500 rounded-full border-2 border-white flex items-center justify-center">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
                      <p className="text-slate-500 mt-0.5">{title}</p>
                    </div>
                    {verified && (
                      <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full border border-teal-200">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Doğrulanmış
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <StarRating rating={rating} />
                    <span className="text-sm text-slate-400">({reviewCount} değerlendirme)</span>
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {city}, {district}
                    </span>
                    <span className="text-sm text-slate-500">{experience} yıl deneyim</span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    {online && (
                      <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-medium px-3 py-1 rounded-full">
                        🖥️ Online
                      </span>
                    )}
                    {inPerson && (
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1 rounded-full">
                        🏢 Yüz yüze
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {introVideo && <VideoIntro src={introVideo} name={name} />}

            <Section title="Hakkında">
              <p className="text-sm text-slate-600 leading-relaxed">{about}</p>
            </Section>

            {photos && photos.length > 0 && (
              <Section title="Fotoğraflar">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((src, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                      {src.startsWith('data:') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={src}
                          alt={`${name} fotoğraf ${i + 1}`}
                          className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Image
                          src={src}
                          alt={`${name} fotoğraf ${i + 1}`}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Uzmanlık Alanları">
              <div className="flex flex-wrap gap-2">
                {specialties?.map((s) => (
                  <span key={s} className="bg-teal-50 text-teal-700 text-sm font-medium px-3 py-1.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </Section>

            <Section title="Terapi Yaklaşımları">
              <div className="flex flex-wrap gap-2">
                {approaches?.map((a) => (
                  <span key={a} className="bg-violet-50 text-violet-700 text-sm font-medium px-3 py-1.5 rounded-full">
                    {a}
                  </span>
                ))}
              </div>
            </Section>

            <Section title="Eğitim">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{education}</p>
              </div>
            </Section>

          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-md sticky top-24">
              <div className="text-center mb-5">
                <p className="text-3xl font-bold text-slate-900">{price?.toLocaleString('tr-TR')} ₺</p>
                <p className="text-sm text-slate-400 mt-1">seans başına · {sessionDuration} dk</p>
              </div>

              {freeConsultation && (
                <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-emerald-800">Ücretsiz Ön Görüşme</p>
                    <p className="text-xs text-emerald-600">15 dakika · Tanışma seansı</p>
                  </div>
                </div>
              )}
              <BookingButtons therapistName={name} therapistEmail={therapistEmail} selectedSlot={selectedSlot} onSlotClear={() => setSelectedSlot(null)} availability={availability} dayHours={dayHours} />

              <div className="mt-5 bg-slate-50 rounded-xl p-4 space-y-3">
                {[
                  {
                    icon: (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-teal-100">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                        </svg>
                      </span>
                    ),
                    text: 'Uçtan Uca Şifreli ve Güvenli Ödeme Altyapısı',
                  },
                  {
                    icon: (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-teal-100">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                      </span>
                    ),
                    text: 'İlk Tanışma Seansı Ücretsiz',
                  },
                  {
                    icon: (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-teal-100">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </span>
                    ),
                    text: '12 Saat Öncesine Kadar Ücretsiz İptal',
                  },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="shrink-0">{icon}</span>
                    <span className="font-medium leading-snug">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Müsait Günler ve Saatler */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <span className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </span>
                <h3 className="text-sm font-bold text-slate-800">Müsait Günler ve Saatler</h3>
              </div>

              {/* Date-based view (yeni format) */}
              {(() => {
                const isDateBased = (availability || []).some(d => /^\d{4}-\d{2}-\d{2}$/.test(d));
                const pubToday = new Date(); pubToday.setHours(0,0,0,0);
                const todayStr = pubToday.toISOString().split('T')[0];

                if (isDateBased) {
                  const futureDates = [...(availability || [])]
                    .filter(ds => ds >= todayStr)
                    .sort()
                    .slice(0, 8); // max 8 yaklaşan gün göster

                  return futureDates.length > 0 ? (
                    <div className="px-4 pt-4 pb-2 space-y-2">
                      {futureDates.map(ds => {
                        const hours = dayHours?.[ds] || [];
                        return (
                          <div key={ds}>
                            <p className="text-xs font-semibold text-slate-600 mb-1">{fmtDateTr(ds)}</p>
                            {hours.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {hours.map(h => (
                                  <button
                                    key={h}
                                    onClick={() => setSelectedSlot(
                                      selectedSlot?.day === ds && selectedSlot?.hour === h
                                        ? null : { day: ds, hour: h }
                                    )}
                                    className={`text-xs px-2 py-0.5 rounded-md font-medium transition-colors ${
                                      selectedSlot?.day === ds && selectedSlot?.hour === h
                                        ? 'bg-teal-600 text-white ring-2 ring-teal-300'
                                        : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-100'
                                    }`}
                                  >
                                    {h}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic mb-2">Saat eklenmemiş</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">Yaklaşan müsait gün yok</p>
                  );
                }

                // Eski format: haftanın günleri
                return (
                  <>
                    <div className="px-4 pt-4 pb-2 grid grid-cols-7 gap-1">
                      {allDays.map((day) => {
                        const isAvailable = availability?.includes(day);
                        return (
                          <div key={day} className="flex flex-col items-center gap-1">
                            <span className="text-xs text-slate-400 font-medium">{dayMap[day]}</span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              isAvailable ? 'bg-teal-500 text-white shadow-sm' : 'bg-slate-100 text-slate-300'
                            }`}>
                              {isAvailable ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              ) : (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="px-4 pb-4 mt-2 space-y-2">
                      {allDays.filter(day => availability?.includes(day)).map(day => {
                        const hours = dayHours?.[day] || [];
                        return (
                          <div key={day} className="flex items-start gap-2">
                            <span className="text-xs font-semibold text-slate-500 w-8 shrink-0 pt-0.5">{dayMap[day]}</span>
                            {hours.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {hours.map(h => (
                                  <button
                                    key={h}
                                    onClick={() => setSelectedSlot(
                                      selectedSlot?.day === day && selectedSlot?.hour === h
                                        ? null : { day, hour: h }
                                    )}
                                    className={`text-xs px-2 py-0.5 rounded-md font-medium transition-colors ${
                                      selectedSlot?.day === day && selectedSlot?.hour === h
                                        ? 'bg-teal-600 text-white ring-2 ring-teal-300'
                                        : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-100'
                                    }`}
                                  >
                                    {h}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Saat eklenmemiş</span>
                            )}
                          </div>
                        );
                      })}
                      {(!availability || availability.length === 0) && (
                        <p className="text-xs text-slate-400 text-center py-2">Müsaitlik bilgisi girilmemiş</p>
                      )}
                    </div>
                  </>
                );
              })()}

              {selectedSlot && (
                <div className="mx-4 mb-4 px-3 py-2.5 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span className="text-xs font-semibold text-teal-700">
                      {/^\d{4}-\d{2}-\d{2}$/.test(selectedSlot.day) ? fmtDateTr(selectedSlot.day) : selectedSlot.day}
                      {' · '}{selectedSlot.hour}
                    </span>
                  </div>
                  <span className="text-xs text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full font-medium">Seçildi ✓</span>
                </div>
              )}

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span className="text-xs text-slate-400">Her seans {sessionDuration} dakika · Türkiye saatiyle (UTC+3)</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Özet</h3>
              <div className="space-y-3">
                {[
                  { label: 'Değerlendirme', value: `${rating}/5 (${reviewCount})` },
                  { label: 'Deneyim', value: `${experience} yıl` },
                  { label: 'Şehir', value: `${city}, ${district}` },
                  { label: 'Seans süresi', value: `${sessionDuration} dakika` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-slate-700 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {others.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-slate-800 mb-5">Benzer Terapistler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {others.map((t) => (
                <TherapistCard key={t.id} therapist={t} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
