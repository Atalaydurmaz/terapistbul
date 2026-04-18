import TestlerClient from './TestlerClient';

export const metadata = {
  title: 'Psikolojik Testler | Yapay Zeka Destekli Analiz',
  description: 'Anksiyete, depresyon, stres ve daha fazlası için yapay zeka destekli psikolojik testler. Ücretsiz, bilimsel tabanlı, anlık analiz.',
};

export default function TestlerPage() {
  return (
    <div className="bg-[#f0fdfa] min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-hero py-14 border-b border-teal-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-600 border border-teal-700 text-white text-lg font-bold px-7 py-3 rounded-2xl mb-5 shadow-lg shadow-teal-200">
            🤖 AI Psikolojik Testler
          </div>
          <p className="text-slate-500 max-w-xl mx-auto mb-6">
            Bilimsel temelli testleri tamamlayın, yapay zeka algoritmamız sonuçlarınızı analiz ederek kişiselleştirilmiş değerlendirme ve öneriler sunsun.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Tamamen ücretsiz
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Klinik tabanlı sorular
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Anlık AI analizi
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Gizlilik güvencesi
            </span>
          </div>
        </div>
      </section>

      <TestlerClient />
    </div>
  );
}
