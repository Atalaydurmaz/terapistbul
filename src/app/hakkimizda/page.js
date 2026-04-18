import Link from 'next/link';

export const metadata = {
  title: 'Hakkımızda',
  description: 'TerapistBul hakkında — misyonumuz, vizyonumuz ve hikayemiz.',
};

function ValueCard({ icon, title, desc }) {
  return (
    <div className="text-center p-6">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function TeamCard({ name, role, initials, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-sm">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      <h4 className="font-semibold text-slate-800">{name}</h4>
      <p className="text-sm text-slate-500 mt-1">{role}</p>
    </div>
  );
}

export default function HakkimizdaPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-hero py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            Türkiye&apos;nin Ruh Sağlığı Platformu
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-5 leading-tight">
            Doğru yardımı bulmak
            <span className="gradient-text block">herkese açık olmalı</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            TerapistBul olarak, ruh sağlığı desteğini daha erişilebilir, şeffaf ve kişiselleştirilmiş
            hale getirmek için çalışıyoruz. Yapay zeka teknolojisi ile doğru terapisti bulmak
            artık saniyeler alıyor.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Misyonumuz</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Türkiye&apos;de her yıl milyonlarca kişi psikolojik destek ihtiyacı duyuyor, ancak
                doğru uzmana ulaşmakta güçlük çekiyor. &quot;Hangi psikolog bana uygun?&quot;,
                &quot;Nerede bulabilirim?&quot;, &quot;Ücreti ne kadar?&quot; sorularının yanıtını
                bulmak hem zaman alıyor hem de stres yaratıyor.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                TerapistBul bu engeli ortadan kaldırmak için kuruldu. Yapay zeka destekli
                eşleştirme sistemimiz ile danışanlar, ihtiyaçlarına en uygun terapisti
                dakikalar içinde bulabiliyor. Terapistler ise kendi web sitelerine gerek
                kalmadan dijital varlıklarını oluşturabiliyor.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Ruh sağlığı bir lüks değil, bir haktır.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '100+', label: 'Aktif Terapist' },
                { value: '1000+', label: 'Mutlu Danışan' },
                { value: '81', label: 'İlde Hizmet' },
                { value: '2026', label: 'Kuruluş Yılı' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-teal-50 rounded-2xl p-6 text-center border border-teal-100">
                  <p className="text-3xl font-bold text-teal-700">{value}</p>
                  <p className="text-sm text-slate-600 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-12">Değerlerimiz</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ValueCard
              icon="🔒"
              title="Gizlilik"
              desc="Danışan bilgileri KVKK kapsamında tam güvence altında. Hiçbir veri üçüncü tarafla paylaşılmaz."
            />
            <ValueCard
              icon="✅"
              title="Güven"
              desc="Her terapist diploma ve lisans doğrulamasından geçer. Sahte profil sıfır tolerans."
            />
            <ValueCard
              icon="🤖"
              title="İnovasyon"
              desc="Yapay zeka eşleştirme teknolojimiz sürekli gelişiyor. Daha iyi eşleşmeler, daha mutlu danışanlar."
            />
            <ValueCard
              icon="🌍"
              title="Erişilebilirlik"
              desc="Türkiye&apos;nin her şehrinde, online ve yüz yüze seçeneklerle hizmet sunuyoruz."
            />
          </div>
        </div>
      </section>

      {/* Press / Trust */}
      <section className="py-14 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">
            Medyada TerapistBul
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-40">
            {['Hürriyet', 'Sabah', 'Milliyet', 'NTV', 'CNN Türk'].map((m) => (
              <span key={m} className="text-xl font-bold text-slate-600">{m}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Siz de bu değişimin parçası olun</h2>
          <p className="text-teal-100 mb-8">Danışan veya terapist olarak TerapistBul ailesine katılın</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/terapistler" className="bg-white text-teal-700 font-semibold px-7 py-3 rounded-full hover:bg-teal-50 transition-colors">
              Terapist Bul
            </Link>
            <Link href="/uye-ol" className="border border-teal-400 text-white font-semibold px-7 py-3 rounded-full hover:bg-teal-500 transition-colors">
              Terapist Olarak Katıl
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
