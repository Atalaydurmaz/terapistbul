import Link from 'next/link';
import AISearchBar from '../components/AISearchBar';
import SpecialtySlider from '../components/SpecialtySlider';
import TherapistCarousel from '../components/TherapistCarousel';
import { therapists } from '../data/therapists';

function StatCard({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-teal-700">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 text-teal-600">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function HowItWorksStep({ number, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-slate-800 mb-1">{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}


export default function HomePage() {

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-hero py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            {/* AI badge */}
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <div className="w-4 h-4 bg-gradient-to-br from-teal-500 to-violet-500 rounded-full" />
              Yapay Zeka Destekli Eşleştirme
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-5">
              Size en uygun
              <span className="gradient-text block">terapisti bulun</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-10">
              Nasıl hissettiğinizi bize anlatın. Yapay zekamız, Türkiye&apos;nin dört bir yanındaki
              uzman psikolog ve terapistler arasından size özel en uygun eşleşmeleri getirir.
            </p>

            <AISearchBar />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-100 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <StatCard value="100+" label="Uzman Terapist" />
            <StatCard value="1,000+" label="Mutlu Danışan" />
            <StatCard value="81" label="İlde Hizmet" />
            <StatCard value="94%" label="Memnuniyet Oranı" />
          </div>
        </div>
      </section>

      {/* Specialty quick-links */}
      <SpecialtySlider />

      {/* Featured therapists carousel */}
      <TherapistCarousel />

      {/* Features */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Neden TerapistBul?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Doğru terapisti bulmak artık çok daha kolay
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                </svg>
              }
              title="Yapay Zeka Eşleştirme"
              desc="Yazdığınız birkaç cümleyi analiz ederek, ihtiyaçlarınıza en uygun terapistleri anında listeler."
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              }
              title="Gizlilik ve Güvenlik"
              desc="Tüm verileriniz KVKK kapsamında korunur. Kimliğiniz gizli tutulur, güvenli iletişim sağlanır."
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              }
              title="Onaylı Uzmanlar"
              desc="Her terapist diploma ve lisans belgeleri doğrulandıktan sonra platforma kabul edilir."
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              }
              title="Online & Yüz Yüze"
              desc="Şehrinizde yüz yüze seans yapmak ya da online görüşme tercih etmek — seçim sizin."
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
              title="Hızlı Randevu"
              desc="Profilleri inceleyin, müsaitlik takvimini görün ve doğrudan terapistinizle randevu alın."
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
              title="Çeşitli Uzmanlıklar"
              desc="Anksiyete, depresyon, travma, ilişki sorunları ve daha fazlası için alanında uzman terapistler."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Nasıl Çalışır?</h2>
              <p className="text-slate-500 mb-8">Doğru terapisti bulmak sadece 3 adım</p>
              <div className="space-y-6">
                <HowItWorksStep
                  number="1"
                  title="Kendinizi anlatın"
                  desc="Nasıl hissettiğinizi, ne yaşadığınızı arama kutusuna yazın. Yapay zekamız sizi anlar."
                />
                <HowItWorksStep
                  number="2"
                  title="Eşleşmeleri inceleyin"
                  desc="Uyumluluk puanına göre sıralanmış terapist profillerini, uzmanlıklarını ve yorumlarını gözden geçirin."
                />
                <HowItWorksStep
                  number="3"
                  title="Randevunuzu alın"
                  desc="Terapistinizi seçin, müsait gün/saate randevu oluşturun. Online ya da yüz yüze tercih edin."
                />
              </div>
              <Link
                href="/terapistler"
                className="mt-8 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-full transition-colors"
              >
                Hemen Başla
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>

            {/* Decorative right panel */}
            <div className="hidden lg:block">
              <div className="bg-gradient-to-br from-teal-50 to-violet-50 rounded-3xl p-8 border border-teal-100">
                <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-violet-500 rounded-lg flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Yapay Zeka Eşleştirme Aktif</span>
                  </div>
                  <div className="h-10 bg-slate-50 rounded-lg flex items-center px-3 text-sm text-slate-400">
                    Son zamanlarda çok kaygılıyım...
                  </div>
                </div>
                <div className="space-y-3">
                  {therapists.slice(0, 3).map((t, i) => (
                    <div key={t.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: t.color }}
                      >
                        {t.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{t.name}</p>
                        <p className="text-xs text-slate-400">{t.specialties[0]}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-teal-600">%{[94, 89, 83][i]}</div>
                        <div className="text-xs text-slate-400">eşleşme</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Block — Terapist Kadromuzu Nasıl Oluşturuyoruz */}
      <section className="py-16 bg-[#f0fdfa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Başlık */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Güvenilir Uzman Kadrosu
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Terapist Kadromuzu Nasıl Oluşturuyoruz?
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
              Platformumuzdaki her terapist, danışanlarımızın güvenliğini sağlamak için
              kapsamlı bir doğrulama sürecinden geçmektedir.
            </p>
          </div>

          {/* 3 Adım Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Adım 1 — YÖK Diploma */}
            <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-7 hover:shadow-md hover:border-teal-200 transition-all group">
              <div className="absolute -top-3 left-6">
                <span className="bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">Adım 1</span>
              </div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-teal-100 transition-colors">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.8">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Y.Ö.K Diploma Kontrolü</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                Başvuran her terapistin diploma bilgileri, Yükseköğretim Kurulu'nun
                (YÖK) resmi sistemi üzerinden doğrulanır. Yalnızca akredite
                üniversitelerden mezun uzmanlar kabul edilir.
              </p>
              <ul className="space-y-1.5">
                {['Lisans diploması doğrulama', 'Yüksek lisans teyidi', 'Mezun olunan bölüm kontrolü'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Adım 2 — Sertifikasyon */}
            <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-7 hover:shadow-md hover:border-violet-200 transition-all group md:scale-105 md:shadow-md ring-1 ring-violet-100">
              <div className="absolute -top-3 left-6">
                <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">Adım 2</span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="bg-violet-50 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-violet-200">Önerilen</span>
              </div>
              <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-violet-100 transition-colors">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Sertifikasyon Değerlendirmeleri</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                Terapistlerin sahip olduğu terapi yaklaşımı sertifikaları — BDT,
                EMDR, Şema Terapi ve diğerleri — ilgili akredite kuruluşlar
                üzerinden tek tek incelenir.
              </p>
              <ul className="space-y-1.5">
                {['BDT, EMDR, ACT sertifika kontrolü', 'Akredite kuruluş teyidi', 'Sertifika geçerlilik tarihi kontrolü'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Adım 3 — CV */}
            <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-7 hover:shadow-md hover:border-blue-200 transition-all group">
              <div className="absolute -top-3 left-6">
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Adım 3</span>
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">CV Değerlendirmesi</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                Her terapistin özgeçmişi, deneyim yılları, çalıştığı kurumlar ve
                uzmanlık alanları ekibimiz tarafından detaylı biçimde
                incelenir. Referanslar gerektiğinde doğrulanır.
              </p>
              <ul className="space-y-1.5">
                {['Mesleki deneyim doğrulama', 'Kurum referansları kontrolü', 'Uzmanlık alanı uygunluğu'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Alt güven şeridi */}
          <div className="bg-white border border-slate-100 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">%100 Doğrulanmış Uzmanlar</p>
                <p className="text-xs text-slate-400">Platformumuzdaki tüm terapistler bu 3 aşamalı süreçten geçmiştir</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-center">
              {[
                { value: '43+', label: 'Onaylı Terapist' },
                { value: '3 Aşama', label: 'Doğrulama Süreci' },
                { value: '48 saat', label: 'Ortalama İnceleme' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-base font-bold text-teal-700">{value}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA for therapists */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-teal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Siz de platformumuza katılın
          </h2>
          <p className="text-teal-100 max-w-xl mx-auto mb-8">
            Kendi web sitenize gerek yok. TerapistBul&apos;da ücretsiz profil oluşturun, yapay zeka
            destekli sistemimiz sizi ihtiyaç duyan danışanlarla buluşturur.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/uye-ol"
              className="bg-white text-teal-700 font-semibold px-7 py-3 rounded-full hover:bg-teal-50 transition-colors"
            >
              Ücretsiz Profil Oluştur
            </Link>
            <Link
              href="/hakkimizda"
              className="border border-teal-400 text-white font-semibold px-7 py-3 rounded-full hover:bg-teal-500 transition-colors"
            >
              Daha Fazla Bilgi
            </Link>
          </div>
          <p className="text-teal-200 text-xs mt-5">
            Üyelik tamamen ücretsiz · 5 dakikada tamamlanır
          </p>
        </div>
      </section>
    </>
  );
}
