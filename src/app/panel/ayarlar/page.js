'use client';

import { useState } from 'react';

function Toggle({ value, onChange, label }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-teal-600' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function SaveButton({ onClick, success }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm ${
        success ? 'bg-green-600 text-white' : 'bg-teal-600 text-white hover:bg-teal-700'
      }`}
    >
      {success ? (
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Kaydedildi!
        </span>
      ) : 'Kaydet'}
    </button>
  );
}

export default function AyarlarPage() {
  const [activeTab, setActiveTab] = useState('hesap');

  // Hesap
  const [accountForm, setAccountForm] = useState({
    email: 'nur@terapistbul.com',
    phone: '+90 532 123 45 67',
    currentPass: '',
    newPass: '',
    confirmPass: '',
  });
  const [accountSuccess, setAccountSuccess] = useState(false);

  // Bildirimler
  const [notifs, setNotifs] = useState({
    emailNewBooking: true,
    emailMessage: true,
    emailReminder: false,
    smsNewBooking: true,
    smsReminder: true,
    smsMessage: false,
    pushNewBooking: true,
    pushMessage: true,
    pushReminder: true,
  });
  const [notifSuccess, setNotifSuccess] = useState(false);

  // Gizlilik
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showPhone: false,
    showEmail: false,
    allowAllContact: false,
    allowPatientOnly: true,
  });
  const [privacySuccess, setPrivacySuccess] = useState(false);

  // Güvenlik
  const [twoFactor, setTwoFactor] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);

  const activeSessions = [
    { device: 'Chrome — Windows 11', location: 'İstanbul, TR', time: 'Şu an aktif', current: true },
    { device: 'Safari — iPhone 15', location: 'İstanbul, TR', time: '2 saat önce', current: false },
    { device: 'Firefox — MacBook', location: 'Ankara, TR', time: '3 gün önce', current: false },
  ];

  const handleSave = (setSuccess) => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const tabs = [
    { id: 'hesap', label: 'Hesap' },
    { id: 'bildirimler', label: 'Bildirimler' },
    { id: 'gizlilik', label: 'Gizlilik' },
    { id: 'guvenlik', label: 'Güvenlik' },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-slate-100 overflow-x-auto">
          <div className="flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Hesap */}
          {activeTab === 'hesap' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-4">İletişim Bilgileri</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'E-posta', key: 'email', type: 'email' },
                    { label: 'Telefon', key: 'phone', type: 'tel' },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">{f.label}</label>
                      <input
                        type={f.type}
                        value={accountForm[f.key]}
                        onChange={(e) => setAccountForm({ ...accountForm, [f.key]: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">Şifre Değiştir</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Mevcut Şifre', key: 'currentPass' },
                    { label: 'Yeni Şifre', key: 'newPass' },
                    { label: 'Yeni Şifre (Tekrar)', key: 'confirmPass' },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">{f.label}</label>
                      <input
                        type="password"
                        value={accountForm[f.key]}
                        onChange={(e) => setAccountForm({ ...accountForm, [f.key]: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <SaveButton onClick={() => handleSave(setAccountSuccess)} success={accountSuccess} />
              </div>
            </div>
          )}

          {/* Bildirimler */}
          {activeTab === 'bildirimler' && (
            <div className="space-y-6">
              {[
                {
                  title: 'E-posta Bildirimleri',
                  items: [
                    { key: 'emailNewBooking', label: 'Yeni randevu talebi' },
                    { key: 'emailMessage', label: 'Yeni mesaj' },
                    { key: 'emailReminder', label: 'Randevu hatırlatıcısı' },
                  ],
                },
                {
                  title: 'SMS Bildirimleri',
                  items: [
                    { key: 'smsNewBooking', label: 'Yeni randevu talebi' },
                    { key: 'smsReminder', label: 'Randevu hatırlatıcısı' },
                    { key: 'smsMessage', label: 'Yeni mesaj' },
                  ],
                },
                {
                  title: 'Push Bildirimleri',
                  items: [
                    { key: 'pushNewBooking', label: 'Yeni randevu talebi' },
                    { key: 'pushMessage', label: 'Yeni mesaj' },
                    { key: 'pushReminder', label: 'Randevu hatırlatıcısı' },
                  ],
                },
              ].map((group) => (
                <div key={group.title}>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">{group.title}</h4>
                  <div className="bg-slate-50 rounded-xl px-4 divide-y divide-slate-100">
                    {group.items.map((item) => (
                      <Toggle
                        key={item.key}
                        label={item.label}
                        value={notifs[item.key]}
                        onChange={(v) => setNotifs({ ...notifs, [item.key]: v })}
                      />
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-2">
                <SaveButton onClick={() => handleSave(setNotifSuccess)} success={notifSuccess} />
              </div>
            </div>
          )}

          {/* Gizlilik */}
          {activeTab === 'gizlilik' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Profil Görünürlüğü</h4>
                <div className="bg-slate-50 rounded-xl px-4 divide-y divide-slate-100">
                  <Toggle
                    label="Profilim herkese açık"
                    value={privacy.profilePublic}
                    onChange={(v) => setPrivacy({ ...privacy, profilePublic: v })}
                  />
                  <Toggle
                    label="Telefon numaramı göster"
                    value={privacy.showPhone}
                    onChange={(v) => setPrivacy({ ...privacy, showPhone: v })}
                  />
                  <Toggle
                    label="E-posta adresimi göster"
                    value={privacy.showEmail}
                    onChange={(v) => setPrivacy({ ...privacy, showEmail: v })}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Mesajlaşma Ayarları</h4>
                <div className="bg-slate-50 rounded-xl px-4 divide-y divide-slate-100">
                  <Toggle
                    label="Herkesten mesaj al"
                    value={privacy.allowAllContact}
                    onChange={(v) => setPrivacy({ ...privacy, allowAllContact: v, allowPatientOnly: !v })}
                  />
                  <Toggle
                    label="Yalnızca kayıtlı danışanlardan mesaj al"
                    value={privacy.allowPatientOnly}
                    onChange={(v) => setPrivacy({ ...privacy, allowPatientOnly: v, allowAllContact: !v })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <SaveButton onClick={() => handleSave(setPrivacySuccess)} success={privacySuccess} />
              </div>
            </div>
          )}

          {/* Güvenlik */}
          {activeTab === 'guvenlik' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">İki Faktörlü Doğrulama</h4>
                <div className="bg-slate-50 rounded-xl px-4">
                  <Toggle
                    label="İki faktörlü doğrulamayı etkinleştir (SMS)"
                    value={twoFactor}
                    onChange={setTwoFactor}
                  />
                </div>
                {twoFactor && (
                  <div className="mt-3 p-3.5 bg-teal-50 border border-teal-100 rounded-xl text-sm text-teal-700">
                    SMS ile iki faktörlü doğrulama etkinleştirildi. Her girişte telefonunuza kod gönderilecek.
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Aktif Oturumlar</h4>
                <div className="space-y-2">
                  {activeSessions.map((session, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3.5 rounded-xl border ${session.current ? 'bg-teal-50 border-teal-100' : 'bg-white border-slate-100'}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${session.current ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-500'}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700">{session.device}</p>
                        <p className="text-xs text-slate-400">{session.location} · {session.time}</p>
                      </div>
                      {session.current ? (
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-lg font-medium flex-shrink-0">Aktif</span>
                      ) : (
                        <button className="text-xs text-red-500 hover:text-red-700 font-medium flex-shrink-0 hover:underline">
                          Sonlandır
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button className="mt-4 w-full py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors">
                  Tüm Cihazlarda Oturumu Kapat
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <SaveButton onClick={() => handleSave(setSecuritySuccess)} success={securitySuccess} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
