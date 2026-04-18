'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SifremiUnuttumPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-5">
            <Image src="/logo.svg" alt="TerapistBul" width={38} height={38} />
            <span className="text-xl font-bold">
              <span className="text-[#1a56db]">Terapist</span><span className="text-[#16a34a]">Bul</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Şifremi Unuttum</h1>
          <p className="text-slate-500 text-sm">
            E-posta adresinizi girin, sıfırlama bağlantısı gönderelim.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8">
            {sent ? (
              /* Success state */
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-2">E-posta gönderildi!</h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-1">
                  <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
                </p>
                <p className="text-xs text-slate-400 mb-6">
                  E-posta birkaç dakika içinde ulaşmazsa spam klasörünüzü kontrol edin.
                </p>
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="text-sm text-teal-600 hover:underline block mx-auto mb-3"
                >
                  Farklı bir e-posta dene
                </button>
                <Link href="/giris" className="block w-full text-center bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                  Giriş sayfasına dön
                </Link>
              </div>
            ) : (
              /* Form state */
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    E-posta Adresi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="ornek@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-1">Hesabınıza kayıtlı e-posta adresini girin.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Gönderiliyor...
                    </>
                  ) : 'Sıfırlama Bağlantısı Gönder'}
                </button>
              </form>
            )}
          </div>

          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
            <Link href="/giris" className="text-sm text-slate-500 hover:text-teal-600 transition-colors flex items-center justify-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Giriş sayfasına dön
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
