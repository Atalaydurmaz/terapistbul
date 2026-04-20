import ContactForm from './ContactForm';

export const metadata = {
  title: 'İletişim',
  description: 'TerapistBul ile iletişime geçin. Sorularınızı, önerilerinizi ve taleplerinizi bize iletin.',
};

const contactInfo = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    label: 'E-posta',
    value: 'destek@terapistibul.com',
    sub: 'Genellikle 24 saat içinde yanıtlarız',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: 'Adres',
    value: 'Maslak Mahallesi, Büyükdere Cad. No:255',
    sub: 'Sarıyer / İstanbul',
  },
];

export default function IletisimPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-hero py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">İletişim</h1>
          <p className="text-slate-600 text-lg">
            Sorularınız için bize ulaşın. En kısa sürede geri döneceğiz.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact info */}
            <div className="space-y-6">
              {contactInfo.map(({ icon, label, value, sub }) => (
                <div key={label} className="flex gap-4">
                  <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 flex-shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                    <p className="text-slate-800 font-medium mt-0.5">{value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Sosyal Medya</p>
                <div className="flex gap-3">
                  {['Instagram', 'Twitter', 'LinkedIn'].map((s) => (
                    <a
                      key={s}
                      href="#"
                      className="text-xs font-medium text-slate-600 hover:text-teal-600 border border-slate-200 hover:border-teal-300 px-3 py-1.5 rounded-full transition-all"
                    >
                      {s}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form (client component) */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
