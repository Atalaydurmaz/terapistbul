'use client';

import { useState } from 'react';
import Link from 'next/link';

const categories = [
  {
    id: 'genel',
    label: 'Genel',
    icon: '💬',
    questions: [
      {
        q: 'TerapistBul nedir?',
        a: 'TerapistBul, Türkiye\'nin yapay zeka destekli terapist eşleştirme platformudur. Nasıl hissettğinizi birkaç cümleyle anlatmanız yeterli; sistemimiz 850\'den fazla doğrulanmış psikolog, psikiyatrist ve terapist arasından size en uygun adayları saniyeler içinde listeler.',
      },
      {
        q: 'Terapist arama ve eşleştirme ücretsiz mi?',
        a: 'Evet, tamamen ücretsizdir. Platform üzerinden terapist aramak, profilleri incelemek ve eşleştirme sonuçlarını görmek için herhangi bir ücret ödemezsiniz. Ücret yalnızca terapistinizle randevu aldığınızda ve seans gerçekleştiğinde ödenir.',
      },
      {
        q: 'Hangi şehirlerde hizmet veriyorsunuz?',
        a: 'Türkiye\'nin 81 ilinde hizmet veriyoruz. Yüz yüze seans için şehrinizde bulunan terapistleri, online seans için ise tüm Türkiye\'deki uzmanları görebilirsiniz.',
      },
      {
        q: 'Platformda kimler terapist olarak yer alıyor?',
        a: 'Psikolog, klinik psikolog, uzman psikolog, psikiyatrist, psikolojik danışman ve aile terapistleri gibi farklı unvanlara sahip uzmanlar yer almaktadır. Tüm terapistler diploma ve lisans belgelerinin doğrulanmasından geçtikten sonra platforma kabul edilir.',
      },
    ],
  },
  {
    id: 'eslestirme',
    label: 'Eşleştirme',
    icon: '🤖',
    questions: [
      {
        q: 'Yapay zeka eşleştirmesi nasıl çalışıyor?',
        a: 'Arama kutusuna nasıl hissettğinizi yazmanız yeterlidir. Yapay zekamız yazdığınız metni analiz ederek anahtar kelimeleri, duygusal tonu ve ihtiyaç örüntülerini tespit eder. Ardından terapistlerin uzmanlık alanları, terapi yaklaşımları, dil bilgisi ve konumuyla karşılaştırarak uyumluluk puanı hesaplar.',
      },
      {
        q: 'Eşleştirme sonuçlarını beğenmezsem ne yapabilirim?',
        a: 'Filtreleri kullanarak şehir, uzmanlık alanı, terapi yaklaşımı, seans ücreti ve online/yüz yüze gibi kriterlere göre sonuçları daraltabilirsiniz. Farklı bir arama metni yazarak sonuçları yenileyebilirsiniz.',
      },
      {
        q: 'Uyumluluk yüzdesi ne anlama geliyor?',
        a: 'Uyumluluk yüzdesi, yazdığınız metnin terapistin uzmanlık alanları ve aiTags veritabanıyla ne kadar örtüştüğünü gösterir. %90 ve üzeri çok yüksek uyum anlamına gelir. Bu bir garanti değil, kılavuz niteliktedir; son kararı her zaman siz verirsiniz.',
      },
      {
        q: 'Herhangi bir kategori seçmek zorunda mıyım?',
        a: 'Hayır. Sadece nasıl hissettğinizi doğal bir dille yazmanız yeterli. "Son zamanlarda çok kaygılıyım ve uyuyamıyorum" gibi bir cümle, sistem için yeterli bilgidir.',
      },
    ],
  },
  {
    id: 'randevu',
    label: 'Randevu',
    icon: '📅',
    questions: [
      {
        q: 'Nasıl randevu alabilirim?',
        a: 'Beğendiğiniz terapistin profil sayfasına gidip "Randevu Al" butonuna tıklamanız yeterlidir. Müsait gün ve saatlerden birini seçtikten sonra ödeme adımına yönlendirilirsiniz. Randevu onayı e-posta ile bildirilir.',
      },
      {
        q: 'Randevumu iptal edebilir miyim?',
        a: 'Evet. Seans tarihinden en az 24 saat öncesine kadar ücretsiz iptal edebilirsiniz. 24 saatten kısa süre içinde iptal edilmesi halinde ücretin tamamı veya bir kısmı alınabilir; bu politika terapiste göre farklılık gösterebilir ve profil sayfasında belirtilir.',
      },
      {
        q: 'Randevumu erteleyebilir miyim?',
        a: 'Evet, terapistinizin müsaitlik takviminde uygun başka bir zaman dilimi varsa randevunuzu erteleyebilirsiniz. Değişiklik yapabilmek için en az 24 saat öncesinde platform üzerinden veya doğrudan terapistinizle iletişime geçmeniz gerekir.',
      },
      {
        q: 'İlk seansı beğenmezsem para iadesi alabilir miyim?',
        a: 'Evet. İlk seans için para iadesi garantimiz mevcuttur. Seans tarihinden itibaren 48 saat içinde destek@terapistbul.com adresine talebinizi iletmeniz yeterlidir. Değerlendirme sonucunda uygun bulunması halinde ödeme iade edilir.',
      },
    ],
  },
  {
    id: 'seans',
    label: 'Seans',
    icon: '🖥️',
    questions: [
      {
        q: 'Online seans nasıl gerçekleşiyor?',
        a: 'Randevu onaylandıktan sonra size güvenli video bağlantı linki gönderilir. Ekstra bir uygulama indirmenize gerek yoktur; modern tarayıcılar (Chrome, Safari, Firefox) üzerinden doğrudan katılabilirsiniz. Sessiz ve özel bir ortam yeterlidir.',
      },
      {
        q: 'Seans süresi ne kadar?',
        a: 'Standart seans süresi genellikle 50 dakikadır. Bazı terapistler 45 veya 60 dakikalık seanslar sunabilir; bu bilgi terapistin profil sayfasında açıkça belirtilmektedir.',
      },
      {
        q: 'Ücretsiz ön görüşme nedir?',
        a: 'Platformumuzdaki tüm terapistler 15 dakikalık ücretsiz ön görüşme sunmaktadır. Bu görüşmede terapistinizi tanıyabilir, sorularınızı sorabilir ve birbirinize uyumlu olup olmadığınızı değerlendirebilirsiniz. Ön görüşme herhangi bir yükümlülük doğurmaz.',
      },
      {
        q: 'Terapisti değiştirebilir miyim?',
        a: 'Evet, istediğiniz zaman başka bir terapistle çalışmaya başlayabilirsiniz. Platforma tekrar girerek yeni bir eşleştirme yapabilir ve farklı bir terapistle randevu alabilirsiniz.',
      },
    ],
  },
  {
    id: 'odeme',
    label: 'Ödeme',
    icon: '💳',
    questions: [
      {
        q: 'Ödeme nasıl yapılıyor?',
        a: 'Ödemeler platform üzerinden güvenli altyapı (SSL şifreleme, PCI-DSS uyumlu) ile kredi kartı veya banka kartıyla alınmaktadır. Nakit ödeme yapılmamaktadır.',
      },
      {
        q: 'Seans ücreti ne kadar?',
        a: 'Seans ücretleri terapiste göre değişmektedir; platformumuzda 500 ₺ ile 1.200 ₺ arasında seçenekler mevcuttur. Ücret her terapistin profil sayfasında şeffaf biçimde gösterilir, gizli ek masraf yoktur.',
      },
      {
        q: 'Fatura alabilir miyim?',
        a: 'Evet. Ödeme sonrasında e-posta adresinize fatura iletilir. Kurumsal fatura talebi için destek@terapistbul.com adresine başvurabilirsiniz.',
      },
      {
        q: 'Sigortam seans ücretini karşılar mı?',
        a: 'Bu durum sigorta şirketinize ve poliçenizin kapsamına bağlıdır. Bazı özel sağlık sigortaları psikoterapi seanslarını kısmen ya da tamamen karşılayabilir. Terapistinizden fatura/makbuz alarak sigorta şirketinize başvurmanızı öneririz.',
      },
    ],
  },
  {
    id: 'gizlilik',
    label: 'Gizlilik',
    icon: '🔒',
    questions: [
      {
        q: 'Arama kutusuna yazdıklarım güvende mi?',
        a: 'Evet. Yazdığınız metinler yalnızca eşleştirme algoritması tarafından işlenir ve üçüncü taraflarla paylaşılmaz. Tüm veri iletimi SSL şifrelemesiyle güvence altındadır.',
      },
      {
        q: 'Terapistim bilgilerimi başkalarıyla paylaşır mı?',
        a: 'Hayır. Terapistler mesleki gizlilik yükümlülüğüne tabidir. Platform üzerindeki iletişim ve seans içerikleri kesinlikle üçüncü taraflarla paylaşılmaz.',
      },
      {
        q: 'Verilerimi sildirebilir miyim?',
        a: 'Evet. Hesabınızı silmek için Hesap Ayarları sayfasını kullanabilir ya da kvkk@terapistbul.com adresine e-posta gönderebilirsiniz. Hesap silinmesinin ardından 30 gün içinde verileriniz sistemden kalıcı olarak kaldırılır.',
      },
      {
        q: 'KVKK kapsamındaki haklarım neler?',
        a: 'Verilerinize erişim, düzeltme, silme, işlemeye itiraz ve veri taşınabilirliği gibi haklarınız bulunmaktadır. Detaylı bilgi için KVKK Aydınlatma Metni sayfamızı inceleyebilirsiniz.',
      },
    ],
  },
];

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-800">{q}</span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          className={`flex-shrink-0 text-teal-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function SSSPage() {
  const [activeCategory, setActiveCategory] = useState('genel');
  const current = categories.find((c) => c.id === activeCategory);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-hero py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Sık Sorulan Sorular</h1>
          <p className="text-slate-600">
            Aklınızdaki soruların cevabını burada bulamazsanız{' '}
            <Link href="/iletisim" className="text-teal-600 font-medium hover:underline">
              bize yazın
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  activeCategory === cat.id
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-600'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Questions */}
          <div className="space-y-3">
            {current?.questions.map(({ q, a }) => (
              <AccordionItem key={q} q={q} a={a} />
            ))}
          </div>

          {/* Still need help */}
          <div className="mt-14 bg-teal-50 border border-teal-100 rounded-3xl p-8 text-center">
            <div className="text-3xl mb-3">🙋</div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Sorunuz burada yok mu?</h3>
            <p className="text-slate-500 text-sm mb-5">
              Destek ekibimiz hafta içi 09:00–18:00 arasında yardıma hazır.
            </p>
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-full transition-colors text-sm"
            >
              Bize Yazın
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
