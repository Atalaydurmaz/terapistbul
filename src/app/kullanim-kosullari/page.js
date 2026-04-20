import Link from 'next/link';

export const metadata = {
  title: 'Kullanım Koşulları',
  description: 'TerapistBul Kullanım Koşulları — platformu kullanmadan önce lütfen okuyun.',
};

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold text-slate-800 mb-3">{title}</h2>
      <div className="text-sm text-slate-600 leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default function KullanimKosullariPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-hero py-14 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Kullanım Koşulları</h1>
          <p className="text-slate-500 text-sm">Son güncelleme: 1 Ocak 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">

        <Section title="1. Taraflar ve Kapsam">
          <p>
            Bu Kullanım Koşulları, TerapistBul Teknoloji A.Ş. ("TerapistBul") ile <strong>terapistbul.com</strong> web sitesini ve ilgili mobil uygulamaları kullanan gerçek kişiler ("Kullanıcı") arasındaki ilişkiyi düzenler. Platformu kullanmaya devam etmeniz bu koşulları kabul ettiğiniz anlamına gelir.
          </p>
        </Section>

        <Section title="2. Hizmetin Tanımı">
          <p>
            TerapistBul, danışanların ihtiyaçlarına uygun psikolog, psikiyatrist ve terapistleri bulmasına aracılık eden yapay zeka destekli bir eşleştirme platformudur. TerapistBul:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Terapist ile danışan arasında doğrudan aracılık yapar; terapi hizmeti sunmaz.</li>
            <li>Listelenen terapistlerin belge doğrulamasını yapar, ancak seans içeriğinden sorumlu tutulamaz.</li>
            <li>Randevu, mesajlaşma ve profil yönetimi altyapısını sağlar.</li>
          </ul>
        </Section>

        <Section title="3. Kullanıcı Hesabı">
          <p>
            Platforma kayıt olurken doğru, güncel ve eksiksiz bilgi vermeyi kabul edersiniz. Hesap güvenliğinizden ve şifrenizin gizliliğinden siz sorumlusunuz. Hesabınızın yetkisiz kullanıldığını fark ettiğinizde derhal destek@terapistibul.com adresine bildirmeniz gerekmektedir.
          </p>
          <p>
            Bir hesap yalnızca bir kişiye aittir; başkasının adına hesap oluşturulamaz.
          </p>
        </Section>

        <Section title="4. Terapist Üyeliği">
          <p>Platforma terapist olarak kayıt olmak için:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Geçerli diploma, yüksek lisans veya uzmanlık belgesi sunulması zorunludur.</li>
            <li>Türk Psikologlar Derneği veya ilgili meslek kuruluşuna aktif üyelik gerekmektedir.</li>
            <li>Profil bilgilerinin eksiksiz ve doğru olması şarttır.</li>
            <li>Sahte belge sunulması üyeliğin derhal iptaline ve yasal işlem başlatılmasına neden olur.</li>
          </ul>
        </Section>

        <Section title="5. Yasaklı Davranışlar">
          <p>Aşağıdaki eylemler kesinlikle yasaktır:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Yanlış kimlik veya sahte belge ile kayıt olmak</li>
            <li>Başka kullanıcıları rahatsız etmek, taciz veya tehdit etmek</li>
            <li>Platform altyapısına zarar vermek, virüs veya zararlı kod yaymak</li>
            <li>Platform verilerini izinsiz kopyalamak veya ticari amaçla kullanmak</li>
            <li>Terapistler ile danışanlar arasındaki iletişimi manipüle etmek</li>
            <li>Herhangi bir yasal düzenlemeyi ihlal eden içerik paylaşmak</li>
          </ul>
        </Section>

        <Section title="6. Ücretlendirme ve Ödemeler">
          <p>
            TerapistBul'da terapist arama ve eşleştirme hizmeti ücretsizdir. Seans ücretleri terapist ile danışan arasındaki anlaşmaya göre belirlenir. Ödeme işlemleri güvenli ödeme altyapısı üzerinden gerçekleştirilir.
          </p>
          <p>
            İlk seans için para iadesi talebi, seans tarihinden itibaren 48 saat içinde destek@terapistibul.com adresine yapılmalıdır. İptal politikası terapistlere göre farklılık gösterebilir; detaylar ilgili terapist profilinde belirtilir.
          </p>
        </Section>

        <Section title="7. Fikri Mülkiyet">
          <p>
            Platform üzerindeki tüm içerik, tasarım, logo, yazılım ve algoritmalar TerapistBul'a aittir ve Türk Fikir ve Sanat Eserleri Kanunu ile uluslararası telif hakkı mevzuatı kapsamında korunmaktadır. Yazılı izin alınmadan hiçbir içerik kopyalanamaz, dağıtılamaz veya ticari amaçla kullanılamaz.
          </p>
        </Section>

        <Section title="8. Sorumluluk Sınırlaması">
          <p>
            TerapistBul bir aracı platform olup seans sırasında terapist tarafından verilen tavsiyeler, tanı veya tedavi süreçlerinden hukuki olarak sorumlu tutulamaz. Platformdaki bilgiler genel bilgilendirme amaçlıdır ve profesyonel tıbbi tavsiye yerine geçmez.
          </p>
          <p>
            Teknik arıza, sunucu kesintisi veya üçüncü taraf hizmet sağlayıcılardan kaynaklanan sorunlar nedeniyle oluşabilecek veri kayıplarından TerapistBul sorumlu değildir.
          </p>
        </Section>

        <Section title="9. Hesap Askıya Alma ve Sonlandırma">
          <p>
            TerapistBul, bu koşulları ihlal eden kullanıcıların hesabını önceden bildirim yapmaksızın askıya alma veya kalıcı olarak kapatma hakkını saklı tutar. Kullanıcılar hesaplarını istedikleri zaman kapatabilir; bu durumda kişisel veriler <Link href="/gizlilik" className="text-teal-600 hover:underline">Gizlilik Politikası</Link>'nda belirtilen süreler içinde silinir.
          </p>
        </Section>

        <Section title="10. Uygulanacak Hukuk ve Uyuşmazlık Çözümü">
          <p>
            Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Taraflar arasında çıkabilecek uyuşmazlıklarda İstanbul Merkez Mahkemeleri ve İcra Daireleri yetkilidir.
          </p>
        </Section>

        <Section title="11. Değişiklikler">
          <p>
            TerapistBul bu koşulları tek taraflı olarak değiştirme hakkını saklı tutar. Önemli değişiklikler 30 gün önceden e-posta ile duyurulur. Değişikliklerin yürürlüğe girmesinin ardından platformu kullanmaya devam etmeniz yeni koşulları kabul ettiğiniz anlamına gelir.
          </p>
        </Section>

        <Section title="12. İletişim">
          <p>
            Bu koşullara ilişkin sorularınız için <strong>destek@terapistibul.com</strong> adresine yazabilirsiniz.
          </p>
        </Section>

        <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap gap-4 text-sm text-teal-600">
          <Link href="/gizlilik" className="hover:underline">Gizlilik Politikası</Link>
          <Link href="/kvkk" className="hover:underline">KVKK Aydınlatma Metni</Link>
          <Link href="/iletisim" className="hover:underline">İletişim</Link>
        </div>
      </div>
    </div>
  );
}
