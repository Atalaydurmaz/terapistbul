'use client';

import { useState } from 'react';
import Link from 'next/link';

const categories = [
  {
    icon: '🧑‍💼',
    title: 'Terapist Hesabı',
    desc: 'Profil oluşturma, belge yükleme, üyelik',
    slug: 'terapist',
  },
  {
    icon: '👤',
    title: 'Danışan Hesabı',
    desc: 'Kayıt, giriş, profil ayarları',
    slug: 'danisan',
  },
  {
    icon: '📅',
    title: 'Randevu & Seans',
    desc: 'Randevu alma, iptal, yeniden planlama',
    slug: 'randevu',
  },
  {
    icon: '💳',
    title: 'Ödeme & Fatura',
    desc: 'Ücretlendirme, iade, fatura talebi',
    slug: 'odeme',
  },
  {
    icon: '🔒',
    title: 'Gizlilik & Güvenlik',
    desc: 'Veri güvenliği, şifre sıfırlama, KVKK',
    slug: 'gizlilik',
  },
  {
    icon: '🤖',
    title: 'AI Eşleştirme',
    desc: 'Eşleştirme nasıl çalışır, sonuçlar',
    slug: 'ai',
  },
];

const faqs = {
  terapist: [
    { q: 'Terapist olarak nasıl kayıt olabilirim?', a: '/uye-ol sayfasından 4 adımlı kayıt formunu doldurun. Diploma ve lisans belgenizi yükleyin. Ekibimiz 1-2 iş günü içinde başvurunuzu inceleyerek profilinizi yayına alır.' },
    { q: 'Hangi belgeler gerekiyor?', a: 'Geçerli diploma veya yüksek lisans belgesi ve Türk Psikologlar Derneği ya da ilgili meslek kuruluşuna aktif üyelik belgesi gereklidir.' },
    { q: 'Profil güncelleme nasıl yapılır?', a: 'Hesabınıza giriş yaptıktan sonra "Profil Düzenle" bölümünden fotoğraf, biyografi, uzmanlık alanları ve takvim bilgilerinizi istediğiniz zaman güncelleyebilirsiniz.' },
    { q: 'Üyelik ücretli mi?', a: 'TerapistBul\'a terapist olarak katılmak tamamen ücretsizdir. Platform, başarılı seans eşleştirmelerinde küçük bir komisyon alır.' },
  ],
  danisan: [
    { q: 'Üye olmadan terapist arayabilir miyim?', a: 'Evet, terapistleri üye olmadan arayabilir ve profilleri inceleyebilirsiniz. Randevu almak ve mesaj göndermek için üye girişi gereklidir.' },
    { q: 'Şifremi unuttum, ne yapmalıyım?', a: 'Giriş sayfasındaki "Şifremi Unuttum" bağlantısına tıklayın. Kayıtlı e-posta adresinize sıfırlama bağlantısı gönderilecektir.' },
    { q: 'Hesabımı nasıl silerim?', a: 'Hesap ayarları sayfasından "Hesabı Kapat" seçeneğini kullanabilirsiniz. Tüm kişisel verileriniz KVKK kapsamında 30 gün içinde sistemden silinir.' },
  ],
  randevu: [
    { q: 'Randevumu nasıl iptal edebilirim?', a: 'Seans tarihinden en az 24 saat önce "Randevularım" sayfasından iptal edebilirsiniz. 24 saatten az süre kala iptal durumunda terapistin iptal politikası geçerlidir.' },
    { q: 'Online seans için ne gerekiyor?', a: 'Randevu onaylanınca güvenli video bağlantısı e-posta ile gönderilir. Ekstra uygulama gerekmez, tarayıcı üzerinden katılabilirsiniz. Stabil bir internet bağlantısı ve kamera/mikrofon yeterlidir.' },
    { q: 'Terapistim müsait değilse ne olur?', a: 'Terapistiniz randevuyu iptal ederse sistem sizi otomatik olarak bilgilendirir ve yeni bir seans planlamak ya da farklı bir terapistle eşleşmek için yönlendirme yapar.' },
  ],
  odeme: [
    { q: 'Hangi ödeme yöntemleri kabul ediliyor?', a: 'Kredi kartı, banka kartı ve havale/EFT ile ödeme yapabilirsiniz. Tüm ödemeler SSL şifreli güvenli altyapı üzerinden işlenir.' },
    { q: 'Para iadesi alabilir miyim?', a: 'İlk seans için memnun kalmazsanız 48 saat içinde destek@terapistbul.com adresine yazarak para iadesi talep edebilirsiniz.' },
    { q: 'Fatura nasıl alırım?', a: 'Ödeme sonrasında fatura otomatik olarak e-posta adresinize gönderilir. Geçmiş faturalarınıza hesap panelinizdeki "Ödemeler" bölümünden ulaşabilirsiniz.' },
  ],
  gizlilik: [
    { q: 'Verilerim güvende mi?', a: 'Tüm veriler SSL şifreleme ile korunur, KVKK\'ya tam uyumlu altyapıda saklanır. Hiçbir kişisel veri üçüncü taraflarla paylaşılmaz.' },
    { q: 'Arama geçmişim terapistlere görünüyor mu?', a: 'Hayır. AI arama kutusuna yazdığınız metinler yalnızca eşleştirme algoritması tarafından işlenir; hiçbir terapist bu bilgilere erişemez.' },
    { q: 'İki faktörlü doğrulama var mı?', a: 'Evet, hesap güvenliği için SMS veya e-posta ile iki faktörlü doğrulama aktif edebilirsiniz. Hesap ayarları > Güvenlik bölümünden etkinleştirin.' },
  ],
  ai: [
    { q: 'AI eşleştirme nasıl çalışır?', a: 'Arama kutusuna nasıl hissettiğinizi yazmanız yeterli. Algoritmamız metindeki duygusal tonu ve anahtar kavramları analiz ederek terapistlerin uzmanlık alanlarıyla eşleştirir ve uyumluluk puanı üretir.' },
    { q: 'Eşleşme sonuçları kişiselleştirilebilir mi?', a: 'Evet. Şehir, fiyat aralığı, seans modu ve uzmanlık filtrelerini kullanarak AI sıralamasını kendi tercihlerinize göre daraltabilirsiniz.' },
    { q: 'AI her zaman doğru eşleşmeyi buluyor mu?', a: 'AI en uyumlu adayları öne çıkarır, ancak son karar her zaman sizindir. Profilleri inceleyin, ücretsiz ön görüşme yapın ve en doğal hissettiren terapisti seçin.' },
  ],
};

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-800">{q}</span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"
          className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export default function DestekPage() {
  const [activeCategory, setActiveCategory] = useState('terapist');
  const [ticketSent, setTicketSent] = useState(false);
  const [ticket, setTicket] = useState({ name: '', email: '', subject: '', message: '' });

  const handleTicket = (e) => {
    e.preventDefault();
    setTicketSent(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Hero */}
      <section className="bg-gradient-hero border-b border-slate-100 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Nasıl yardımcı olabiliriz?</h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            Sorularınızı yanıtlamak için buradayız. Aşağıdan konunuzu seçin veya destek ekibimize ulaşın.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {/* Quick contact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: '✉️',
              title: 'E-posta',
              value: 'destek@terapistbul.com',
              sub: 'Genellikle 24 saat içinde yanıt',
              href: 'mailto:destek@terapistbul.com',
            },
            {
              icon: '💬',
              title: 'Canlı Destek',
              value: 'Şu an çevrimiçi',
              sub: 'Pzt–Cum 09:00–18:00',
              href: '#',
            },
            {
              icon: '📞',
              title: 'Telefon',
              value: '0850 XXX XX XX',
              sub: 'Pzt–Cum 09:00–18:00',
              href: 'tel:08500000000',
            },
          ].map(({ icon, title, value, sub, href }) => (
            <a key={title} href={href}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:border-teal-300 hover:shadow-md transition-all group text-left">
              <div className="text-2xl mb-3">{icon}</div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{title}</p>
              <p className="text-sm font-bold text-slate-800 group-hover:text-teal-600 transition-colors">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </a>
          ))}
        </div>

        {/* FAQ by category */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-6">Sık Sorulan Sorular</h2>
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border transition-all ${
                  activeCategory === cat.slug
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-600'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.title}
              </button>
            ))}
          </div>

          {/* FAQ items */}
          <div className="space-y-2">
            {(faqs[activeCategory] || []).map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>

          <div className="mt-5 text-center">
            <Link href="/sss" className="text-sm text-teal-600 hover:underline font-medium">
              Tüm sık sorulan soruları gör →
            </Link>
          </div>
        </div>

        {/* Support ticket */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Destek Talebi Oluştur</h2>
          <p className="text-sm text-slate-500 mb-6">Sorunuzu bulamadıysanız ekibimize yazın, en kısa sürede yanıtlayalım.</p>

          {ticketSent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Talebiniz alındı!</h3>
              <p className="text-sm text-slate-500">Destek ekibimiz 24 saat içinde <strong>{ticket.email}</strong> adresine yanıt verecek.</p>
              <button onClick={() => { setTicketSent(false); setTicket({ name: '', email: '', subject: '', message: '' }); }}
                className="mt-5 text-sm text-teal-600 hover:underline">
                Yeni talep oluştur
              </button>
            </div>
          ) : (
            <form onSubmit={handleTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Ad Soyad <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="Adınız" value={ticket.name}
                    onChange={(e) => setTicket((t) => ({ ...t, name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">E-posta <span className="text-red-500">*</span></label>
                  <input required type="email" placeholder="ornek@mail.com" value={ticket.email}
                    onChange={(e) => setTicket((t) => ({ ...t, email: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Konu <span className="text-red-500">*</span></label>
                <select required value={ticket.subject}
                  onChange={(e) => setTicket((t) => ({ ...t, subject: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50">
                  <option value="">Konu seçin</option>
                  {categories.map((c) => <option key={c.slug} value={c.title}>{c.icon} {c.title}</option>)}
                  <option value="Diğer">💡 Diğer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mesajınız <span className="text-red-500">*</span></label>
                <textarea required rows={5} placeholder="Sorununuzu veya talebinizi detaylıca açıklayın..." value={ticket.message}
                  onChange={(e) => setTicket((t) => ({ ...t, message: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 resize-none" />
              </div>
              <button type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors">
                Talep Gönder
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
