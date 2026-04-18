import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/logo.svg" alt="TerapistBul logo" width={34} height={34} />
              <span className="text-lg font-bold">
                <span className="text-blue-300">Terapist</span><span className="text-green-400">Bul</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Yapay zeka destekli eşleştirme ile size en uygun psikolog veya terapisti hızlıca bulun.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-slate-800 hover:bg-teal-600 rounded-lg flex items-center justify-center transition-colors" aria-label="Instagram">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="https://www.twitter.com/terapistbul" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-slate-800 hover:bg-teal-600 rounded-lg flex items-center justify-center transition-colors" aria-label="Twitter">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/terapistbul" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-slate-800 hover:bg-teal-600 rounded-lg flex items-center justify-center transition-colors" aria-label="LinkedIn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* For Clients */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Danışanlar İçin</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/terapistler" className="hover:text-teal-400 transition-colors">Terapist Ara</Link></li>
              <li><Link href="/nasil-calisir" className="hover:text-teal-400 transition-colors">Nasıl Çalışır?</Link></li>
              <li><Link href="/ai-eslestirme" className="hover:text-teal-400 transition-colors">AI Eşleştirme</Link></li>
              <li><Link href="/blog" className="hover:text-teal-400 transition-colors">Psikoloji Blogu</Link></li>
              <li><Link href="/sss" className="hover:text-teal-400 transition-colors">Sık Sorulan Sorular</Link></li>
            </ul>
          </div>

          {/* For Therapists */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Terapistler İçin</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/uye-ol" className="hover:text-teal-400 transition-colors">Üye Ol</Link></li>
              
              
              <li><Link href="/destek" className="hover:text-teal-400 transition-colors">Destek</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Kurumsal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/hakkimizda" className="hover:text-teal-400 transition-colors">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="hover:text-teal-400 transition-colors">İletişim</Link></li>
              <li><Link href="/gizlilik" className="hover:text-teal-400 transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="/kullanim-kosullari" className="hover:text-teal-400 transition-colors">Kullanım Koşulları</Link></li>
              <li><Link href="/kvkk" className="hover:text-teal-400 transition-colors">KVKK</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2025 TerapistBul. Tüm hakları saklıdır. Türkiye'de kurulmuş bir şirkettir.
          </p>
          <p className="text-xs text-slate-500">
            🔒 SSL korumalı · KVKK uyumlu · Verileriniz güvende
          </p>
        </div>
      </div>
    </footer>
  );
}
