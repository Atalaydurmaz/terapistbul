'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gönderim hatası');
      setSent(true);
    } catch (err) {
      setError(err.message || 'Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Mesajınız alındı!</h2>
        <p className="text-slate-500 text-sm max-w-xs">
          En geç 24 saat içinde <span className="font-medium text-slate-700">{form.email}</span> adresine dönüş yapacağız.
        </p>
        <button
          onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
          className="mt-6 text-sm text-teal-600 hover:text-teal-700 font-medium"
        >
          Yeni mesaj gönder
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Ad Soyad <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={form.name}
            onChange={set('name')}
            placeholder="Adınız Soyadınız"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            E-posta <span className="text-red-500">*</span>
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
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Konu</label>
        <select
          value={form.subject}
          onChange={set('subject')}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
        >
          <option value="">Seçiniz</option>
          <option>Genel Soru</option>
          <option>Terapist Kaydı</option>
          <option>Teknik Destek</option>
          <option>Ödeme / Fatura</option>
          <option>Gizlilik / KVKK</option>
          <option>Şikayet</option>
          <option>Diğer</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Mesajınız <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={set('message')}
          placeholder="Mesajınızı buraya yazın..."
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

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
        ) : (
          <>
            Mesaj Gönder
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
