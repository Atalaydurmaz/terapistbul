import Link from 'next/link';
import AISearchBar from '../../components/AISearchBar';

export const metadata = {
  title: 'AI Eşleştirme | TerapistBul',
  description: 'Yapay zeka destekli terapist eşleştirme sistemi nasıl çalışır? Nasıl hissettğinizi yazın, saniyeler içinde en uygun terapistlerle eşleşin.',
};

const howItWorks = [
  {
    step: '01',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    color: 'bg-teal-600',
    light: 'bg-teal-50',
    text: 'text-teal-700',
    title: 'Nasıl hissettğinizi yazın',
    desc: '"Son zamanlarda çok bunalıyorum", "ilişkimde sorunlar var" veya "panik atak yaşıyorum" gibi kısa bir cümle yeterli. Form yok, kategori seçimi yok.',
  },
  {
    step: '02',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    color: 'bg-violet-600',
    light: 'bg-violet-50',
    text: 'text-violet-700',
    title: 'AI metni analiz eder',
    desc: 'Doğal dil işleme modelimiz yazdığınız metindeki duygusal tonu, anahtar kavramları ve ihtiyaç örüntülerini milisaniyeler içinde tespit eder.',
  },
  {
    step: '03',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    color: 'bg-blue-600',
    light: 'bg-blue-50',
    text: 'text-blue-700',
    title: 'Uyumluluk puanı hesaplanır',
    desc: 'Her terapist için uzmanlık alanı, terapi yaklaşımı, konum, dil ve müsaitlik faktörleri birleştirilerek 0-100 arası bir eşleşme skoru üretilir.',
  },
  {
    step: '04',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <polyline points="23 11 17 11 20 8M17 14l3 3" />
      </svg>
    ),
    color: 'bg-green-600',
    light: 'bg-green-50',
    text: 'text-green-700',
    title: 'Eşleşmeler listelenir',
    desc: 'En yüksek uyumluluktan başlayarak sıralanan terapistler kartlarında eşleşme yüzdesiyle birlikte gösterilir. Profili inceleyin, randevu alın.',
  },
];

const factors = [
  { icon: '🎯', label: 'Uzmanlık Alanı', desc: 'Travma, anksiyete, çift terapisi gibi ihtiyacınıza özel alan eşleşmesi' },
  { icon: '🧠', label: 'Terapi Yaklaşımı', desc: 'BDT, EMDR, Gestalt, şema terapi — yaklaşım uyumluluğu dikkate alınır' },
  { icon: '📍', label: 'Konum & Format', desc: 'Şehrinize göre yüz yüze veya online seans tercihiniz filtrelenir' },
  { icon: '💬', label: 'Dil Tercihi', desc: 'Türkçe, İngilizce, Arapça ve diğer dillerde hizmet veren terapistler' },
  { icon: '📅', label: 'Müsaitlik', desc: 'Hafta içi, hafta sonu, akşam saatleri — takviminize uygun eşleşme' },
  { icon: '⭐', label: 'Değerlendirmeler', desc: 'Gerçek danışan yorumları ve puanları sıralamayı etkiler' },
];

const examples = [
  {
    query: 'Son haftalarda çok kaygılıyım, uyuyamıyorum',
    tags: ['Anksiyete', 'Uyku Sorunları', 'Stres'],
    color: 'border-teal-200 bg-teal-50',
    tagColor: 'bg-teal-100 text-teal-700',
  },
  {
    query: 'Eşimle sürekli kavga ediyoruz, ne yapacağımı bilmiyorum',
    tags: ['Çift Terapisi', 'İlişki Sorunları', 'İletişim'],
    color: 'border-violet-200 bg-violet-50',
    tagColor: 'bg-violet-100 text-violet-700',
  },
  {
    query: 'Geçmişte yaşadıklarım hâlâ beni etkiliyor',
    tags: ['Travma', 'TSSB', 'EMDR'],
    color: 'border-blue-200 bg-blue-50',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    query: 'İşte tükendim, hiçbir şeye motivasyonum yok',
    tags: ['Burnout', 'Depresyon', 'Kariyer'],
    color: 'border-amber-200 bg-amber-50',
    tagColor: 'bg-amber-100 text-amber-700',
  },
];

const faqs = [
  {
    q: 'Yazdıklarım kimlerle paylaşılıyor?',
    a: 'Arama kutusuna yazdıklarınız yalnızca eşleştirme algoritması tarafından işlenir. Hiçbir terapist veya üçüncü tarafla paylaşılmaz. Veriler KVKK kapsamında korunur.',
  },
  {
    q: 'AI her zaman doğru eşleşmeyi buluyor mu?',
    a: 'AI, istatistiksel olarak en uyumlu adayları öne çıkarır; ancak son karar her zaman sizindir. Profilleri inceleyin, ücretsiz ön görüşme yapın ve size en doğru hissettiren terapisti seçin.',
  },
  {
    q: 'Eşleştirme kaç saniye sürüyor?',
    a: 'Tipik bir sorgu 0,3-0,8 saniye içinde sonuçlanır. Tüm algoritmik işlem anlık gerçekleşir; sayfa yüklendiğinde eşleşmeler hazırdır.',
  },
  {
    q: 'Filtreler AI eşleştirmesiyle birlikte çalışıyor mu?',
    a: 'Evet. Şehir, uzmanlık alanı, ücret aralığı gibi filtreler AI sıralamasının üstüne uygulanır. Hem semantik uyumluluk hem de pratik tercihleriniz bir arada değerlendirilir.',
  },
];

export default function AIEslestirmePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-hero py-20 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
            Yapay Zeka Destekli
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-5 leading-tight">
            AI Eşleştirme
            <span className="gradient-text block">nasıl çalışır?</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Nasıl hissettğinizi birkaç kelimeyle anlatmanız yeterli. Algoritmamız 40'tan fazla terapist
            arasından size en uygun adayları uyumluluk puanıyla saniyeler içinde listeler.
          </p>
          {/* Live search bar */}
          <div className="max-w-2xl mx-auto">
            <AISearchBar />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-14">4 adımda eşleşme</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative">
                <div className={`${item.light} rounded-3xl p-7 h-full border border-slate-100`}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-5xl font-black text-slate-100 leading-none">{item.step}</span>
                    <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center text-white flex-shrink-0`}>
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Matching factors */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Eşleştirme faktörleri</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Uyumluluk skoru hesaplanırken 6 farklı faktör ağırlıklı olarak değerlendirilir.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {factors.map(({ icon, label, desc }) => (
              <div key={label} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-slate-800 mb-1">{label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example queries */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Örnek aramalar</h2>
            <p className="text-slate-500 text-sm">
              Bu şekilde yazdığınızda AI hangi etiketleri tespit ediyor?
            </p>
          </div>
          <div className="space-y-4">
            {examples.map(({ query, tags, color, tagColor }) => (
              <div key={query} className={`rounded-2xl border p-5 ${color}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700 flex items-start gap-2">
                      <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      &quot;{query}&quot;
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    {tags.map((tag) => (
                      <span key={tag} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagColor}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">
            Kendi cümlenizi yazmak için yukarıdaki arama kutusunu kullanabilirsiniz.
          </p>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-10">Güven ve gizlilik</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '🔒', title: 'KVKK Uyumlu', desc: 'Tüm veriler Türkiye\'nin kişisel veri koruma mevzuatına uygun işlenir.' },
              { icon: '🚫', title: 'Terapistle Paylaşılmaz', desc: 'Arama metniniz hiçbir terapist tarafından görülemez, yalnızca algoritma işler.' },
              { icon: '🗑️', title: 'İstediğinizde Silin', desc: 'Hesabınızı kapattığınızda tüm kişisel verileriniz sistemden temizlenir.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">Sık sorulan sorular</h2>
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
          <div className="text-4xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold text-white mb-3">Hemen deneyin</h2>
          <p className="text-teal-100 mb-8 max-w-md mx-auto">
            Birkaç kelime yazın — yapay zekamız size en uygun terapisti saniyeler içinde bulsun.
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
