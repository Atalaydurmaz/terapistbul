import Link from 'next/link';

export const metadata = {
  title: 'Nasıl Çalışır',
  description: 'TerapistBul nasıl çalışır? Yapay zeka destekli terapist eşleştirme sürecini öğrenin.',
};

const steps = [
  {
    number: '01',
    title: 'Ne hissettiğinizi anlatın',
    desc: 'Ana sayfadaki arama kutusuna nasıl hissettiğinizi, ne yaşadığınızı yazın. "Son zamanlarda çok kaygılıyım" veya "ilişki sorunları yaşıyorum" gibi kısa bir cümle yeterli.',
    detail: 'Yapay zekamız yazdığınız metni analiz eder; anahtar kelimeleri, duygusal tonu ve ihtiyaç örüntülerini tespit eder. Herhangi bir form doldurmak ya da kategori seçmek gerekmez.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    color: 'bg-teal-600',
  },
  {
    number: '02',
    title: 'Yapay Zeka eşleşmeleri inceleyin',
    desc: 'Sistemimiz, özenle seçilmiş doğrulanmış uzman kadrodan size en uygun adayları uyumluluk puanıyla sıralar.',
    detail: 'Eşleştirme; uzmanlık alanları, terapi yaklaşımı, dil, konum ve müsaitlik takvimi gibi faktörleri bir arada değerlendirir. Her kart üzerinde uyumluluk yüzdesi görürsünüz.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    color: 'bg-violet-600',
  },
  {
    number: '03',
    title: 'Profili ve yorumları inceleyin',
    desc: 'Terapist profilinde eğitim bilgisi, deneyim yılı, uzmanlık alanları, terapi yaklaşımları ve gerçek kullanıcı yorumlarını görün.',
    detail: 'Tüm terapistler diploma ve lisans belgeleriyle doğrulanmıştır. Profil sayfasında hangi günler müsait olduğunu, seans süresini ve ücretini de görebilirsiniz.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: 'bg-blue-600',
  },
  {
    number: '04',
    title: 'Randevu alın',
    desc: 'Terapistinizi seçtikten sonra müsait gün ve saate randevu oluşturun. Online veya yüz yüze seçeneklerinden birini tercih edin.',
    detail: 'Randevu onayı anında e-posta ile gelir. İlk seans sonrasında platforma geri bildirim bırakabilir, gerekirse farklı bir terapistle devam edebilirsiniz.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    color: 'bg-green-600',
  },
];

const faqs = [
  {
    q: 'Hizmet ücretsiz mi?',
    a: 'Terapist arama ve eşleştirme tamamen ücretsizdir. Ücret yalnızca terapistinizle seans aldığınızda ödenir ve doğrudan terapiste yapılır.',
  },
  {
    q: 'Terapistler nasıl doğrulanıyor?',
    a: 'Her terapist, platforma katılmadan önce diploma, yüksek lisans belgesi ve Türk Psikologlar Derneği üyelik numarasıyla doğrulama sürecinden geçer.',
  },
  {
    q: 'Bilgilerim gizli mi?',
    a: 'Evet. Arama kutusuna yazdıklarınız dahil tüm kişisel verileriniz KVKK kapsamında korunur ve üçüncü taraflarla paylaşılmaz.',
  },
  {
    q: 'Online seans nasıl gerçekleşiyor?',
    a: 'Randevu alındıktan sonra size güvenli video bağlantısı gönderilir. Ek bir uygulama yüklemek gerekmez, tarayıcı üzerinden katılabilirsiniz.',
  },
  {
    q: 'Terapistimden memnun kalmazsam ne olur?',
    a: 'İlk seans için para iadesi garantimiz vardır. Dilediğiniz zaman terapistinizi değiştirebilir, yeni bir eşleştirme yapabilirsiniz.',
  },
];

export default function NasilCalisirPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-hero py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            Sadece 4 Adım
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-5 leading-tight">
            Doğru terapisti bulmak
            <span className="gradient-text block">hiç bu kadar kolay olmamıştı</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Yapay zeka destekli sistemimiz, nasıl hissettiğinizi anlayarak size en uygun uzmanı
            dakikalar içinde listeler. Karmaşık formlar yok, uzun bekleme süreleri yok.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`flex flex-col ${i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-10 items-center`}
              >
                {/* Text */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl font-black text-slate-100">{step.number}</span>
                    <div className={`w-12 h-12 ${step.color} rounded-2xl flex items-center justify-center text-white`}>
                      {step.icon}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-3">{step.title}</h2>
                  <p className="text-slate-600 leading-relaxed mb-3">{step.desc}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.detail}</p>
                </div>

                {/* Visual card */}
                <div className="flex-1 w-full max-w-sm mx-auto lg:mx-0">
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
                      {step.icon}
                    </div>
                    <p className="text-center text-slate-500 text-sm font-medium">
                      Adım {step.number}
                    </p>
                    <p className="text-center text-slate-800 font-semibold mt-1">{step.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature highlight */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-12">
            Neden TerapistBul farklı?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: '🤖',
                title: 'Yapay Zeka Eşleştirme',
                desc: 'Kategori seçmek yerine sadece yazın. AI ne aradığınızı anlar.',
              },
              {
                icon: '✅',
                title: 'Doğrulanmış Uzmanlar',
                desc: 'Her terapist belge doğrulamasından geçer. Sahte profil sıfır tolerans.',
              },
              {
                icon: '🔒',
                title: 'Tam Gizlilik',
                desc: 'KVKK uyumlu altyapı. Verileriniz asla üçüncü tarafla paylaşılmaz.',
              },
              {
                icon: '💻',
                title: 'Online & Yüz Yüze',
                desc: 'Evinizden çıkmadan veya şehrinizde yüz yüze seans alın.',
              },
              {
                icon: '⚡',
                title: 'Anında Sonuç',
                desc: 'Günlerce araştırma yerine saniyeler içinde eşleşme.',
              },
              {
                icon: '💰',
                title: 'Şeffaf Ücret',
                desc: 'Gizli masraf yok. Seans ücretini profilde önceden görürsünüz.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">
            Sık Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="font-semibold text-slate-800 mb-2">{q}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Hazır mısınız?</h2>
          <p className="text-teal-100 mb-8">
            Birkaç cümle yazın — yapay zekamız gerisini halleder.
          </p>
          <Link
            href="/terapistler"
            className="inline-flex items-center gap-2 bg-white text-teal-700 font-semibold px-8 py-3.5 rounded-full hover:bg-teal-50 transition-colors"
          >
            Terapist Bulmaya Başla
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
