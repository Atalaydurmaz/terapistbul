'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function DanisanKaydolPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', passwordConfirm: '', phone: '', birthYear: '', gender: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Ad soyad zorunludur.';
    if (!form.email.includes('@')) e.email = 'Geçerli bir e-posta girin.';
    if (form.password.length < 8) e.password = 'Şifre en az 8 karakter olmalıdır.';
    if (form.password !== form.passwordConfirm) e.passwordConfirm = 'Şifreler eşleşmiyor.';
    if (!agreed) e.agreed = 'Devam etmek için koşulları kabul etmelisiniz.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch('/api/danisan-kaydol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      if (res.status === 409) {
        const data = await res.json();
        setErrors({ email: data.error });
        setLoading(false);
        return;
      }
    } catch {}
    // Admin paneli için danışanı sunucuya kaydet
    try {
      await fetch('/api/danisanlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Date.now().toString(),
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          birthYear: form.birthYear || null,
          gender: form.gender || null,
          registeredAt: new Date().toISOString(),
          status: 'aktif',
        }),
      });
    } catch {}
    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-10 text-center">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Hesabınız oluşturuldu!</h2>
          <p className="text-slate-500 text-sm mb-6">
            <strong>{form.email}</strong> adresine bir doğrulama e-postası gönderdik. Lütfen e-postanızı onaylayın.
          </p>
          <Link href="/terapistler"
            className="block w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors text-center mb-3">
            Terapist Bulmaya Başla
          </Link>
          <Link href="/giris" className="text-sm text-teal-600 hover:underline">
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Üye Ol</h1>
          <p className="text-slate-500 text-sm">Ücretsiz hesap oluşturun, terapist bulun.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Ad Soyad */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Ad Soyad <span className="text-red-500">*</span>
                </label>
                <input type="text" required placeholder="Adınız Soyadınız" value={form.name} onChange={set('name')}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-50 transition-all ${errors.name ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-teal-500'}`} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* E-posta */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  E-posta <span className="text-red-500">*</span>
                </label>
                <input type="email" required placeholder="ornek@mail.com" value={form.email} onChange={set('email')}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-50 transition-all ${errors.email ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-teal-500'}`} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefon <span className="text-slate-400 font-normal">(isteğe bağlı)</span></label>
                <input type="tel" placeholder="+90 5xx xxx xx xx" value={form.phone} onChange={set('phone')}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all" />
              </div>

              {/* Doğum yılı + Cinsiyet */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Doğum Yılı</label>
                  <select value={form.birthYear} onChange={set('birthYear')}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50">
                    <option value="">Seçin</option>
                    {Array.from({ length: 80 }, (_, i) => 2007 - i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Cinsiyet</label>
                  <select value={form.gender} onChange={set('gender')}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50">
                    <option value="">Seçin</option>
                    <option value="kadin">Kadın</option>
                    <option value="erkek">Erkek</option>
                    <option value="belirtmek-istemiyorum">Belirtmek istemiyorum</option>
                  </select>
                </div>
              </div>

              {/* Şifre */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Şifre <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required placeholder="En az 8 karakter"
                    value={form.password} onChange={set('password')}
                    className={`w-full border rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-50 transition-all ${errors.password ? 'border-red-400' : 'border-slate-200 focus:border-teal-500'}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              {/* Şifre tekrar */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Şifre Tekrar <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} required placeholder="Şifrenizi tekrar girin"
                    value={form.passwordConfirm} onChange={set('passwordConfirm')}
                    className={`w-full border rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-50 transition-all ${errors.passwordConfirm ? 'border-red-400' : 'border-slate-200 focus:border-teal-500'}`} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConfirm
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                </div>
                {errors.passwordConfirm && <p className="text-xs text-red-500 mt-1">{errors.passwordConfirm}</p>}
              </div>

              {/* KVKK onay */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div
                    onClick={() => setAgreed(!agreed)}
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${agreed ? 'bg-teal-600 border-teal-600' : 'border-slate-300 bg-white'}`}
                  >
                    {agreed && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 leading-relaxed">
                    <Link href="/kullanim-kosullari" className="text-teal-600 hover:underline font-medium">Kullanım Koşulları</Link>
                    {' '}ve{' '}
                    <Link href="/gizlilik" className="text-teal-600 hover:underline font-medium">Gizlilik Politikası</Link>
                    &apos;nı okudum, kabul ediyorum.
                  </span>
                </label>
                {errors.agreed && <p className="text-xs text-red-500 mt-1">{errors.agreed}</p>}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
                {loading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Hesap oluşturuluyor...
                  </>
                ) : 'Üye Ol'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400">veya</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Google */}
            <button type="button"
              className="w-full flex items-center justify-center gap-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-xl transition-colors text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google ile kayıt ol
            </button>
          </div>

          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Zaten hesabınız var mı?{' '}
              <Link href="/giris" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                Giriş yapın
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
