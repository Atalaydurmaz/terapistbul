import Link from 'next/link';

export const metadata = {
  title: 'Gizlilik Politikası',
  description: 'TerapistBul Gizlilik Politikası — kişisel verilerinizin nasıl toplandığını ve işlendiğini öğrenin.',
};

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold text-slate-800 mb-3">{title}</h2>
      <div className="text-sm text-slate-600 leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default function GizlilikPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-hero py-14 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gizlilik Politikası</h1>
          <p className="text-slate-500 text-sm">Son güncelleme: 1 Ocak 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">

        <Section title="1. Giriş">
          <p>
            TerapistBul Teknoloji A.Ş. ("TerapistBul", "biz", "şirket") olarak gizliliğinize saygı duyuyor ve kişisel verilerinizi korumayı taahhüt ediyoruz. Bu Gizlilik Politikası, <strong>terapistibul.com</strong> web sitesini ve mobil uygulamalarımızı kullandığınızda hangi verileri topladığımızı, bu verileri nasıl kullandığımızı ve haklarınızın neler olduğunu açıklamaktadır.
          </p>
          <p>
            Platformumuzu kullanarak bu politikayı okuduğunuzu ve kabul ettiğinizi beyan edersiniz. Bu politikayı kabul etmiyorsanız lütfen platformumuzu kullanmayınız.
          </p>
        </Section>

        <Section title="2. Topladığımız Veriler">
          <p><strong>2.1 Bize doğrudan ilettiğiniz veriler:</strong></p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Ad, soyad, e-posta adresi ve telefon numarası</li>
            <li>Şifre (şifrelenmiş biçimde saklanır)</li>
            <li>Profil bilgileri (terapistler için unvan, eğitim, uzmanlık alanları)</li>
            <li>Arama sorgularınız (nasıl hissettiğinizi anlatan metinler)</li>
            <li>Randevu ve mesajlaşma verileri</li>
          </ul>
          <p><strong>2.2 Otomatik olarak toplanan veriler:</strong></p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>IP adresi, tarayıcı türü ve cihaz bilgisi</li>
            <li>Ziyaret ettiğiniz sayfalar ve tıkladığınız bağlantılar</li>
            <li>Oturum süresi ve kullanım istatistikleri</li>
            <li>Çerezler ve benzeri takip teknolojileri</li>
          </ul>
        </Section>

        <Section title="3. Verilerin Kullanım Amaçları">
          <p>Topladığımız kişisel verileri aşağıdaki amaçlarla kullanırız:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Terapist eşleştirme algoritmamızı çalıştırmak ve size uygun uzmanları listelemek</li>
            <li>Hesabınızı oluşturmak, yönetmek ve güvende tutmak</li>
            <li>Randevu hatırlatmaları ve platform bildirimleri göndermek</li>
            <li>Müşteri desteği sağlamak</li>
            <li>Platformu geliştirmek ve teknik sorunları gidermek</li>
            <li>Yasal yükümlülüklerimizi yerine getirmek</li>
          </ul>
        </Section>

        <Section title="4. Verilerin Paylaşımı">
          <p>
            Kişisel verilerinizi üçüncü taraflarla satmaz veya kiralamayız. Verilerinizi yalnızca aşağıdaki durumlarda paylaşabiliriz:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Terapistler ile:</strong> Randevu oluşturulduğunda ilgili terapiste gerekli iletişim bilgileriniz iletilir.</li>
            <li><strong>Hizmet sağlayıcılar:</strong> Ödeme altyapısı, e-posta sistemi, bulut sunucu gibi teknik hizmetler için gizlilik sözleşmesi imzalanmış iş ortaklarıyla.</li>
            <li><strong>Yasal zorunluluk:</strong> Mahkeme kararı, savcılık talebi veya diğer yasal yükümlülükler kapsamında yetkili makamlara.</li>
          </ul>
        </Section>

        <Section title="5. Veri Güvenliği">
          <p>
            Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri uygularız:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>SSL/TLS şifreleme ile tüm veri iletimi güvence altındadır</li>
            <li>Şifreler tek yönlü hash algoritmaları ile saklanır</li>
            <li>Sunucularımız ISO 27001 sertifikalı veri merkezlerinde barındırılır</li>
            <li>Düzenli güvenlik denetimleri ve penetrasyon testleri uygulanır</li>
          </ul>
          <p>
            Bununla birlikte, internet üzerinden hiçbir iletim yönteminin %100 güvenli olmadığını hatırlatır, olası ihlal durumlarında sizi yasal süreler içinde bilgilendirmeyi taahhüt ederiz.
          </p>
        </Section>

        <Section title="6. Çerezler">
          <p>
            Platformumuz teknik ve analitik amaçlarla çerezler kullanmaktadır. Oturum çerezleri, tercih çerezleri ve analitik çerezler kullanılmaktadır. Zorunlu çerezler dışında tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durum bazı platform özelliklerinin çalışmamasına neden olabilir.
          </p>
        </Section>

        <Section title="7. Veri Saklama Süresi">
          <p>
            Kişisel verilerinizi hesabınız aktif olduğu sürece saklarız. Hesabınızı silmeniz halinde verileriniz 30 gün içinde sistemlerimizden kalıcı olarak kaldırılır. Yasal yükümlülükler kapsamında bazı veriler 5 yıla kadar arşivlenebilir.
          </p>
        </Section>

        <Section title="8. Haklarınız">
          <p>6698 sayılı KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenen verileriniz hakkında bilgi talep etme</li>
            <li>Verilerin işlenme amacını öğrenme</li>
            <li>Yurt içi veya yurt dışında aktarılan üçüncü tarafları öğrenme</li>
            <li>Eksik veya yanlış işlenen verilerin düzeltilmesini isteme</li>
            <li>Yasal şartlar oluştuğunda verilerin silinmesini talep etme</li>
            <li>İşlemeye itiraz etme ve zararın tazminini talep etme</li>
          </ul>
          <p>
            Bu haklarınızı kullanmak için <strong>destek@terapistibul.com</strong> adresine e-posta gönderebilirsiniz.
          </p>
        </Section>

        <Section title="9. Politika Değişiklikleri">
          <p>
            Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişiklikler yapılması halinde kayıtlı e-posta adresinize bildirim gönderilir. Güncel politika her zaman bu sayfada yayımlanır.
          </p>
        </Section>

        <Section title="10. İletişim">
          <p>
            Gizlilik politikamıza ilişkin sorularınız için:
          </p>
          <ul className="list-none space-y-1 pl-2">
            <li><strong>E-posta:</strong> destek@terapistibul.com</li>
            <li><strong>Adres:</strong> Maslak Mahallesi, Büyükdere Cad. No:255, Sarıyer / İstanbul</li>
          </ul>
        </Section>

        <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap gap-4 text-sm text-teal-600">
          <Link href="/kvkk" className="hover:underline">KVKK Aydınlatma Metni</Link>
          <Link href="/kullanim-kosullari" className="hover:underline">Kullanım Koşulları</Link>
          <Link href="/iletisim" className="hover:underline">İletişim</Link>
        </div>
      </div>
    </div>
  );
}
