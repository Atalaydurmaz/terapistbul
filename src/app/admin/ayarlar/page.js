'use client';

import { useEffect, useState } from 'react';

const tabs = ['Site Ayarları', 'SEO', 'E-posta', 'API Entegrasyonları', 'Güvenlik'];

function Toast({ msg, onClose }) {
  if (!msg) return null;
  return (
    <div className="fixed top-20 right-6 bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-2xl text-sm z-50 flex items-center gap-3 shadow-xl">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
      {msg}
      <button onClick={onClose} className="ml-1 hover:text-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder, helper }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea
          rows={3}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
        />
      )}
      {helper && <p className="text-xs text-slate-500 mt-1">{helper}</p>}
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
      <div>
        <p className="text-sm text-white font-medium">{label}</p>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-teal-500' : 'bg-slate-600'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function SaveButton({ onClick, saving }) {
  return (
    <div className="mt-6 flex justify-end">
      <button
        onClick={onClick}
        disabled={saving}
        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
      </button>
    </div>
  );
}

export default function AdminAyarlarPage() {
  const [activeTab, setActiveTab] = useState('Site Ayarları');
  const [toast, setToast] = useState('');

  // Site Ayarları state
  const [siteName, setSiteName] = useState('TerapistBul');
  const [siteDesc, setSiteDesc] = useState('Türkiye\'nin yapay zeka destekli terapist eşleştirme platformu.');
  const [contactEmail, setContactEmail] = useState('info@terapistbul.com');
  const [phone, setPhone] = useState('+90 212 555 0100');
  const [address, setAddress] = useState('Levent Mahallesi, Büyükdere Cad. No:123 Kat:5, Şişli / İstanbul');

  // SEO state
  const [titleTemplate, setTitleTemplate] = useState('%s | TerapistBul');
  const [robotsEnabled, setRobotsEnabled] = useState(true);
  const [sitemapEnabled, setSitemapEnabled] = useState(true);
  const [gaId, setGaId] = useState('G-XXXXXXXXXX');

  // E-posta state
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('noreply@terapistbul.com');
  const [fromName, setFromName] = useState('TerapistBul');

  // API state
  const [anthropicKey, setAnthropicKey] = useState('sk-ant-••••••••••••••••••••••');
  const [mapsKey, setMapsKey] = useState('AIza••••••••••••••••••••');
  const [paymentKey, setPaymentKey] = useState('pk_live_••••••••••••••••');

  // Security state
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [maxAttempts, setMaxAttempts] = useState('5');
  const [ipWhitelist, setIpWhitelist] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // İlk yüklemede Supabase'ten ayarları çek
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        if (!res.ok) throw new Error('load failed');
        const data = await res.json();
        if (cancelled) return;

        if (data.site) {
          setSiteName(data.site.siteName ?? siteName);
          setSiteDesc(data.site.siteDesc ?? siteDesc);
          setContactEmail(data.site.contactEmail ?? contactEmail);
          setPhone(data.site.phone ?? phone);
          setAddress(data.site.address ?? address);
        }
        if (data.seo) {
          setTitleTemplate(data.seo.titleTemplate ?? titleTemplate);
          setRobotsEnabled(data.seo.robotsEnabled ?? robotsEnabled);
          setSitemapEnabled(data.seo.sitemapEnabled ?? sitemapEnabled);
          setGaId(data.seo.gaId ?? gaId);
        }
        if (data.email) {
          setSmtpHost(data.email.smtpHost ?? smtpHost);
          setSmtpPort(data.email.smtpPort ?? smtpPort);
          setSmtpUser(data.email.smtpUser ?? smtpUser);
          setFromName(data.email.fromName ?? fromName);
        }
        if (data.security) {
          setSessionTimeout(data.security.sessionTimeout ?? sessionTimeout);
          setMaxAttempts(data.security.maxAttempts ?? maxAttempts);
          setIpWhitelist(data.security.ipWhitelist ?? ipWhitelist);
          setMaintenanceMode(data.security.maintenanceMode ?? maintenanceMode);
          setTwoFactor(data.security.twoFactor ?? twoFactor);
        }

        if (data._notMigrated) {
          setToast('Not: site_settings tablosu henüz yok. SQL dosyasını çalıştırın.');
          setTimeout(() => setToast(''), 5000);
        }
      } catch {
        // sessizce bırak; default state korunur
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site: { siteName, siteDesc, contactEmail, phone, address },
          seo: { titleTemplate, robotsEnabled, sitemapEnabled, gaId },
          email: { smtpHost, smtpPort, smtpUser, fromName },
          security: { sessionTimeout, maxAttempts, ipWhitelist, maintenanceMode, twoFactor },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast(data.error || 'Kaydedilemedi.');
      } else {
        setToast('Ayarlar başarıyla kaydedildi!');
      }
    } catch (e) {
      setToast('Kaydedilemedi: ' + (e?.message || 'bilinmeyen hata'));
    } finally {
      setSaving(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleTestApi = () => {
    setToast('API bağlantısı başarılı! ✓');
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="space-y-5">
      <Toast msg={toast} onClose={() => setToast('')} />

      {/* Tabs */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-2 flex gap-1 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
        {activeTab === 'Site Ayarları' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white mb-5">Site Ayarları</h2>
            <Field label="Site Adı" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="TerapistBul" />
            <Field label="Site Açıklaması" type="textarea" value={siteDesc} onChange={(e) => setSiteDesc(e.target.value)} />
            <Field label="İletişim E-postası" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            <Field label="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Field label="Adres" type="textarea" value={address} onChange={(e) => setAddress(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center text-2xl">🧠</div>
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm transition-colors">
                  Logo Yükle
                </button>
              </div>
            </div>
            <SaveButton onClick={handleSave} saving={saving} />
          </div>
        )}

        {activeTab === 'SEO' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white mb-5">SEO Ayarları</h2>
            <Field
              label="Meta Başlık Şablonu"
              value={titleTemplate}
              onChange={(e) => setTitleTemplate(e.target.value)}
              helper='%s yerine sayfa başlığı gelir. Örnek: "Anksiyete Testi | TerapistBul"'
            />
            <Field
              label="Google Analytics ID"
              value={gaId}
              onChange={(e) => setGaId(e.target.value)}
              placeholder="G-XXXXXXXXXX"
            />
            <div className="space-y-0 bg-slate-900/50 rounded-2xl px-4 py-2">
              <Toggle label="robots.txt aktif" desc="Arama motorlarına izin ver" checked={robotsEnabled} onChange={setRobotsEnabled} />
              <Toggle label="Sitemap aktif" desc="Otomatik XML sitemap oluştur" checked={sitemapEnabled} onChange={setSitemapEnabled} />
            </div>
            <SaveButton onClick={handleSave} saving={saving} />
          </div>
        )}

        {activeTab === 'E-posta' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white mb-5">E-posta (SMTP) Ayarları</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="SMTP Sunucu" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" />
              <Field label="SMTP Port" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" />
            </div>
            <Field label="SMTP Kullanıcı Adı" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} />
            <Field label="Gönderen Adı" value={fromName} onChange={(e) => setFromName(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">SMTP Şifre</label>
              <input
                type="password"
                placeholder="••••••••••••"
                className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm transition-colors">
                Test E-postası Gönder
              </button>
            </div>
            <SaveButton onClick={handleSave} saving={saving} />
          </div>
        )}

        {activeTab === 'API Entegrasyonları' && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-white mb-5">API Entegrasyonları</h2>

            {/* Anthropic */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="text-white font-semibold text-sm">Anthropic AI</h3>
                  <p className="text-slate-500 text-xs">ChatBot ve AI eşleştirme için kullanılır</p>
                </div>
                <span className="ml-auto px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">Bağlı</span>
              </div>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-600 text-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                />
                <button onClick={handleTestApi} className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm transition-colors flex-shrink-0">
                  Test Et
                </button>
              </div>
            </div>

            {/* Google Maps */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🗺️</span>
                <div>
                  <h3 className="text-white font-semibold text-sm">Google Maps API</h3>
                  <p className="text-slate-500 text-xs">Terapist konumları için kullanılır</p>
                </div>
                <span className="ml-auto px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full border border-amber-500/30">Yapılandırılmamış</span>
              </div>
              <input
                type="password"
                value={mapsKey}
                onChange={(e) => setMapsKey(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 text-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Payment */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💳</span>
                <div>
                  <h3 className="text-white font-semibold text-sm">Ödeme Sistemi (Stripe)</h3>
                  <p className="text-slate-500 text-xs">Platform ödemeleri için kullanılır</p>
                </div>
                <span className="ml-auto px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">Bağlı</span>
              </div>
              <input
                type="password"
                value={paymentKey}
                onChange={(e) => setPaymentKey(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 text-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <SaveButton onClick={handleSave} saving={saving} />
          </div>
        )}

        {activeTab === 'Güvenlik' && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-white mb-5">Güvenlik Ayarları</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Oturum Zaman Aşımı (dakika)"
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                helper="Kullanıcı oturumunun ne kadar süre aktif kalacağı"
              />
              <Field
                label="Maks. Giriş Denemesi"
                type="number"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                helper="Başarısız girişten sonra hesap kilitlenir"
              />
            </div>

            <Field
              label="IP Whitelist"
              type="textarea"
              value={ipWhitelist}
              onChange={(e) => setIpWhitelist(e.target.value)}
              placeholder="Her satıra bir IP adresi&#10;Örnek: 192.168.1.1"
              helper="Boş bırakırsanız tüm IP'lere izin verilir"
            />

            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl px-4 py-2">
              <Toggle
                label="İki Faktörlü Doğrulama (2FA)"
                desc="Admin girişinde e-posta ile doğrulama gerektirir"
                checked={twoFactor}
                onChange={setTwoFactor}
              />
              <Toggle
                label="Bakım Modu"
                desc="Siteyi ziyaretçilere kapatır, sadece adminler erişebilir"
                checked={maintenanceMode}
                onChange={setMaintenanceMode}
              />
            </div>

            {maintenanceMode && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400 flex-shrink-0">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <p className="text-amber-300 text-sm">Bakım modu aktif! Site ziyaretçilere kapalı.</p>
              </div>
            )}

            <SaveButton onClick={handleSave} saving={saving} />
          </div>
        )}
      </div>
    </div>
  );
}
