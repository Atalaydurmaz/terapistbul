import Link from 'next/link';

export const metadata = {
  title: 'KVKK Aydınlatma Metni',
  description: '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında TerapistBul aydınlatma metni.',
};

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold text-slate-800 mb-3">{title}</h2>
      <div className="text-sm text-slate-600 leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default function KvkkPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-hero py-14 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">KVKK Aydınlatma Metni</h1>
          <p className="text-slate-500 text-sm">
            6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında — Son güncelleme: 1 Ocak 2025
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">

        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 mb-10">
          <p className="text-sm text-teal-800 leading-relaxed">
            TerapistBul Teknoloji A.Ş. olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusu sıfatıyla kişisel verilerinizi işlemekteyiz. Bu aydınlatma metninde kişisel verilerinizin hangi amaçlarla ve hangi hukuki dayanakla işlendiğini, kimlerle paylaşıldığını ve haklarınızı açıklıyoruz.
          </p>
        </div>

        <Section title="1. Veri Sorumlusu">
          <ul className="list-none space-y-1">
            <li><strong>Unvan:</strong> TerapistBul Teknoloji A.Ş.</li>
            <li><strong>Adres:</strong> Maslak Mahallesi, Büyükdere Cad. No:255, Sarıyer / İstanbul</li>
            <li><strong>E-posta:</strong> destek@terapistibul.com</li>
            <li><strong>MERSİS No:</strong> 0123456789012345</li>
          </ul>
        </Section>

        <Section title="2. İşlenen Kişisel Veriler">
          <p><strong>Danışanlar için:</strong></p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Kimlik bilgileri: Ad, soyad</li>
            <li>İletişim bilgileri: E-posta adresi, telefon numarası</li>
            <li>Kullanım verileri: Arama sorguları, tıklama ve gezinme bilgileri</li>
            <li>İşlem bilgileri: Randevu geçmişi, ödeme bilgileri</li>
            <li>Teknik veriler: IP adresi, cihaz bilgisi, çerez verileri</li>
          </ul>
          <p className="mt-3"><strong>Terapistler için (ek olarak):</strong></p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Mesleki bilgiler: Unvan, uzmanlık alanı, eğitim bilgisi</li>
            <li>Belge bilgileri: Diploma, lisans/sicil numarası</li>
            <li>Finansal bilgiler: IBAN ve fatura bilgileri</li>
            <li>Profil fotoğrafı (isteğe bağlı)</li>
          </ul>
        </Section>

        <Section title="3. Kişisel Verilerin İşlenme Amaçları">
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Üyelik ve kimlik doğrulama işlemlerinin yürütülmesi</li>
            <li>Yapay zeka destekli terapist eşleştirme hizmetinin sunulması</li>
            <li>Randevu ve iletişim süreçlerinin yönetilmesi</li>
            <li>Terapist kimlik ve belge doğrulamasının yapılması</li>
            <li>Ödeme işlemlerinin gerçekleştirilmesi ve faturalandırma</li>
            <li>Müşteri hizmetleri ve şikayet süreçlerinin yönetimi</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Platform güvenliğinin sağlanması ve dolandırıcılığın önlenmesi</li>
            <li>İstatistiksel analizler ve hizmet geliştirme çalışmaları (anonimleştirilerek)</li>
          </ul>
        </Section>

        <Section title="4. Kişisel Verilerin İşlenme Hukuki Dayanakları">
          <p>Kişisel verileriniz KVKK'nın 5. ve 6. maddeleri kapsamında aşağıdaki hukuki dayanaklar çerçevesinde işlenmektedir:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Sözleşmenin kurulması veya ifası:</strong> Üyelik ve randevu hizmeti</li>
            <li><strong>Açık rıza:</strong> Pazarlama bildirimleri, arama sorguları analizi</li>
            <li><strong>Hukuki yükümlülük:</strong> Vergi mevzuatı, mahkeme kararları</li>
            <li><strong>Meşru menfaat:</strong> Platform güvenliği, dolandırıcılık önleme</li>
          </ul>
        </Section>

        <Section title="5. Kişisel Verilerin Aktarımı">
          <p>Kişisel verileriniz aşağıdaki taraflara aktarılabilir:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>
              <strong>Terapistler:</strong> Randevu oluşturulması halinde gerekli iletişim bilgileriniz
            </li>
            <li>
              <strong>Ödeme kuruluşları:</strong> İyzico, Stripe gibi PCI-DSS uyumlu altyapılar aracılığıyla ödeme işlemleri
            </li>
            <li>
              <strong>Bulut altyapı sağlayıcıları:</strong> AWS Türkiye veri merkezleri (yurt içi)
            </li>
            <li>
              <strong>Analitik hizmetler:</strong> Anonimleştirilmiş kullanım istatistikleri
            </li>
            <li>
              <strong>Yetkili kamu kurumları:</strong> Yasal zorunluluk halinde
            </li>
          </ul>
          <p>
            Yurt dışına veri aktarımı zorunlu olduğunda KVKK'nın 9. maddesi kapsamında gerekli güvenceler sağlanır.
          </p>
        </Section>

        <Section title="6. Veri Saklama Süreleri">
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Aktif hesap verileri: Hesap silinene kadar</li>
            <li>Hesap silindikten sonra: 30 gün (geri yükleme imkânı için)</li>
            <li>Fatura ve ödeme kayıtları: 10 yıl (Vergi Usul Kanunu gereği)</li>
            <li>Güvenlik logları: 2 yıl</li>
            <li>Çerez verileri: Oturum çerezleri tarayıcı kapatılınca; kalıcı çerezler en fazla 1 yıl</li>
          </ul>
          <p>
            Saklama süresi dolan veriler otomatik olarak silinir veya anonimleştirilir.
          </p>
        </Section>

        <Section title="7. KVKK Kapsamındaki Haklarınız">
          <p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Kişisel verilerinizin işlenip işlenmediğini <strong>öğrenme</strong></li>
            <li>İşlenmiş ise buna ilişkin <strong>bilgi talep etme</strong></li>
            <li>İşlenme amacını ve bu amaca uygun kullanılıp kullanılmadığını <strong>öğrenme</strong></li>
            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri <strong>öğrenme</strong></li>
            <li>Eksik veya yanlış işlenmiş verilerin <strong>düzeltilmesini isteme</strong></li>
            <li>KVKK'nın 7. maddesindeki şartlar çerçevesinde verilerin <strong>silinmesini veya yok edilmesini isteme</strong></li>
            <li>Düzeltme/silme işlemlerinin üçüncü kişilere <strong>bildirilmesini isteme</strong></li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhe bir sonuç çıkmasına <strong>itiraz etme</strong></li>
            <li>Kanuna aykırı işleme nedeniyle oluşan zararın <strong>tazminini talep etme</strong></li>
          </ul>
        </Section>

        <Section title="8. Başvuru Yöntemi">
          <p>
            Yukarıdaki haklarınızı kullanmak için kimliğinizi doğrulayan belgelerle birlikte aşağıdaki kanallardan bize başvurabilirsiniz:
          </p>
          <ul className="list-none space-y-2 pl-2">
            <li>
              <strong>E-posta (KEP):</strong> kvkk@terapistbul.com.tr
            </li>
            <li>
              <strong>Posta:</strong> Maslak Mahallesi, Büyükdere Cad. No:255, Sarıyer / İstanbul — "KVKK Başvurusu" ibaresiyle
            </li>
            <li>
              <strong>Şahsen:</strong> Yukarıdaki adrese kimlik belgesiyle
            </li>
          </ul>
          <p>
            Başvurular, KVKK'nın 13. maddesi uyarınca en geç <strong>30 gün</strong> içinde yanıtlanır. İşlemin ayrıca bir maliyet gerektirmesi halinde Kişisel Verileri Koruma Kurulu tarafından belirlenen tarife uygulanabilir.
          </p>
        </Section>

        <Section title="9. Kişisel Verileri Koruma Kurulu'na Şikayet">
          <p>
            Başvurunuzun reddedilmesi, verilen yanıtın yetersiz bulunması veya süresi içinde yanıt verilmemesi halinde Kişisel Verileri Koruma Kurulu'na (<strong>kvkk.gov.tr</strong>) şikayette bulunma hakkınız saklıdır.
          </p>
        </Section>

        <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap gap-4 text-sm text-teal-600">
          <Link href="/gizlilik" className="hover:underline">Gizlilik Politikası</Link>
          <Link href="/kullanim-kosullari" className="hover:underline">Kullanım Koşulları</Link>
          <Link href="/iletisim" className="hover:underline">İletişim</Link>
        </div>
      </div>
    </div>
  );
}
