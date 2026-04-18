'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

export default function GirisPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/terapistler' });
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError('E-posta veya şifre hatalı.');
    } else {
      router.push('/terapistler');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/logo.svg" alt="TerapistBul logo" width={38} height={38} />
            <span className="text-xl font-bold">
              <span className="text-[#1a56db]">Terapist</span>
              <span className="text-[#16a34a]">Bul</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Tekrar hoş geldiniz</h1>
          <p className="text-slate-500 text-sm">Hesabınıza giriş yapın</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  E-posta
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={set('email')}
                  placeholder="ornek@mail.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={set('password')}
                    placeholder="••••••••"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <Link href="/sifremi-unuttum" className="text-xs text-teal-600 hover:text-teal-700 transition-colors">
                    Şifremi unuttum
                  </Link>
                </div>
              </div>

              {/* Submit */}
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
                    Giriş yapılıyor...
                  </>
                ) : (
                  'Giriş Yap'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400">veya</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 border border-slate-200 hover:bg-slate-50 disabled:opacity-60 text-slate-700 font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              {googleLoading ? (
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              {googleLoading ? 'Yönlendiriliyor...' : 'Google ile devam et'}
            </button>
          </div>

          <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 space-y-3 text-center">
            <p className="text-sm text-slate-500">
              Hesabınız yok mu?{' '}
              <Link href="/danisan-kaydol" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                Üye ol
              </Link>
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">Terapist misiniz?</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <p className="text-sm text-slate-500">
              <Link href="/uye-ol" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                Terapist olarak kayıt olun
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          SSL ile şifrelenmiş güvenli bağlantı
        </p>
      </div>
    </div>
  );
}
