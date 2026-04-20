'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

const steps = [
  { id: 1, title: 'Kişisel Bilgiler' },
  { id: 2, title: 'Mesleki Bilgiler' },
  { id: 3, title: 'Profil Detayları' },
  { id: 4, title: 'Profil Fotoğrafı' },
  { id: 5, title: 'Tamamlandı' },
];

const specialtyOptions = [
  'Anksiyete', 'Depresyon', 'Travma & TSSB', 'İlişki & Çift Terapisi',
  'Aile Terapisi', 'Çocuk & Ergen', 'Yeme Bozuklukları', 'Bağımlılık',
  'Yas & Kayıp', 'Kariyer & Burnout', 'OKB', 'Cinsel Terapi',
  'Stres Yönetimi', 'Öfke Kontrolü', 'Özgüven & Kimlik',
];

const approachOptions = [
  'Bilişsel Davranışçı Terapi', 'Psikodinamik Terapi', 'EMDR', 'Schema Terapi',
  'DBT', 'ACT', 'Gestalt Terapi', 'Varoluşçu Terapi', 'Oyun Terapisi',
  'Sistemik Terapi', 'Çözüm Odaklı Terapi',
];

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center mb-8 overflow-x-auto">
      <div className="flex items-center gap-0 min-w-0">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                  step.id < currentStep
                    ? 'bg-teal-600 text-white'
                    : step.id === currentStep
                    ? 'bg-teal-600 text-white ring-3 ring-teal-100'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step.id < currentStep ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span className={`text-[10px] font-medium text-center leading-tight w-14 ${step.id === currentStep ? 'text-teal-700' : 'text-slate-400'}`}>
                {step.title}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 h-0.5 mx-1 rounded flex-shrink-0 mb-3 ${step.id < currentStep ? 'bg-teal-600' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function InputField({ label, type = 'text', placeholder, required, hint, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
      />
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function CheckChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-sm px-3.5 py-2 rounded-xl font-medium border transition-all ${
        selected
          ? 'bg-teal-600 text-white border-teal-600'
          : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'
      }`}
    >
      {label}
    </button>
  );
}

export default function UyeOlPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '',
    title: '', experience: '', education: '',
    specialties: [], approaches: [],
    about: '', price: '', sessionMode: [],
    languages: [],
  });
  const [diplomaFile, setDiplomaFile] = useState(null);
  const [diplomaDragOver, setDiplomaDragOver] = useState(false);
  const [certFiles, setCertFiles] = useState([]);
  const [certDragOver, setCertDragOver] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoDragOver, setPhotoDragOver] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const photoInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleArr = (field, value) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((x) => x !== value)
        : [...f[field], value],
    }));
  };

  const toBase64 = (file) => new Promise((resolve) => {
    if (!file) { resolve(null); return; }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });

  const uploadToStorage = async (file, folder) => {
    if (!file) return null;
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('applications').upload(path, file, { upsert: false });
    if (error) { console.error('Storage upload error:', error); return null; }
    const { data } = supabase.storage.from('applications').getPublicUrl(path);
    return data.publicUrl;
  };

  const next = async (e) => {
    e.preventDefault();
    if (step === 4) {
      try {
        await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } catch {}

      // Dosyaları Supabase Storage'a yükle (base64 body limit sorununu çözer)
      const [diplomaUrl, videoUrl] = await Promise.all([
        uploadToStorage(diplomaFile, 'diplomas'),
        uploadToStorage(videoFile, 'videos'),
      ]);

      const application = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        city: form.city,
        title: form.title,
        experience: form.experience,
        education: form.education,
        specialties: form.specialties,
        approaches: form.approaches,
        about: form.about,
        price: form.price,
        sessionMode: form.sessionMode,
        diplomaFileName: diplomaFile?.name || null,
        diplomaUrl,
        videoFileName: videoFile?.name || null,
        videoFileSize: videoFile?.size || null,
        videoUrl,
      };
      try {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(application),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          console.error('Başvuru kaydedilemedi:', res.status, text.slice(0, 500));
        }
      } catch (e) {
        console.error('Başvuru gönderme hatası:', e);
      }
    }
    setStep((s) => Math.min(s + 1, 5));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-gradient-hero py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/logo.svg" alt="TerapistBul logo" width={38} height={38} />
            <span className="text-xl font-bold">
              <span className="text-[#1a56db]">Terapist</span><span className="text-[#16a34a]">Bul</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Terapist Olarak Katıl</h1>
          <p className="text-slate-500 text-sm">
            Ücretsiz profil oluşturun, binlerce potansiyel danışana ulaşın.
          </p>
        </div>

        {/* Benefits bar */}
        <div className="bg-teal-600 text-white rounded-2xl p-4 mb-8 grid grid-cols-3 gap-2 text-center">
          {[
            { icon: '🆓', text: 'Tamamen Ücretsiz' },
            { icon: '⚡', text: '5 Dakikada Tamamla' },
            { icon: '🤖', text: 'Yapay Zeka Eşleştirme' },
          ].map(({ icon, text }) => (
            <div key={text}>
              <div className="text-xl mb-1">{icon}</div>
              <div className="text-xs font-medium text-teal-100">{text}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8">
            <StepIndicator currentStep={step} />

            {step === 5 ? (
              /* Success screen */
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">Başvurunuz Alındı!</h2>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
                  Belgeleriniz incelendikten sonra 1-2 iş günü içinde profiliniz yayına alınacak
                  ve size e-posta ile bildirim gönderilecektir.
                </p>
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 text-left space-y-2">
                  <p className="text-sm text-teal-800 font-semibold">Sonraki Adımlar:</p>
                  <p className="text-sm text-teal-700">✓ E-posta onayınızı kontrol edin</p>
                  <p className="text-sm text-teal-700">✓ Ekibimiz 1-2 iş gününde sizinle iletişime geçecek</p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-teal-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-teal-700 transition-colors"
                >
                  Ana Sayfaya Dön
                </Link>
              </div>
            ) : (
              <form onSubmit={next} className="space-y-5">
                {step === 1 && (
                  <>
                    <h2 className="text-lg font-bold text-slate-800 mb-5">Kişisel Bilgiler</h2>
                    <InputField label="Ad Soyad" placeholder="Dr. Ayşe Kaya" required value={form.name} onChange={set('name')} />
                    <InputField label="E-posta" type="email" placeholder="ayse@ornek.com" required value={form.email} onChange={set('email')} />
                    <InputField label="Telefon" type="tel" placeholder="+90 5xx xxx xx xx" value={form.phone} onChange={set('phone')} />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Şehir <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={form.city}
                        onChange={(e) => set('city')(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                      >
                        <option value="">Seçiniz</option>
                        {[
                          'Adana','Adıyaman','Afyonkarahisar','Ağrı','Aksaray','Amasya','Ankara','Antalya',
                          'Ardahan','Artvin','Aydın','Balıkesir','Bartın','Batman','Bayburt','Bilecik',
                          'Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale','Çankırı','Çorum',
                          'Denizli','Diyarbakır','Düzce','Edirne','Elazığ','Erzincan','Erzurum','Eskişehir',
                          'Gaziantep','Giresun','Gümüşhane','Hakkari','Hatay','Iğdır','Isparta','İstanbul',
                          'İzmir','Kahramanmaraş','Karabük','Karaman','Kars','Kastamonu','Kayseri','Kilis',
                          'Kırıkkale','Kırklareli','Kırşehir','Kocaeli','Konya','Kütahya','Malatya','Manisa',
                          'Mardin','Mersin','Muğla','Muş','Nevşehir','Niğde','Ordu','Osmaniye','Rize',
                          'Sakarya','Samsun','Siirt','Sinop','Sivas','Şanlıurfa','Şırnak','Tekirdağ',
                          'Tokat','Trabzon','Tunceli','Uşak','Van','Yalova','Yozgat','Zonguldak',
                        ].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="text-lg font-bold text-slate-800 mb-5">Mesleki Bilgiler</h2>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Unvan <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={form.title}
                        onChange={(e) => set('title')(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                      >
                        <option value="">Seçiniz</option>
                        {['Psikolog', 'Klinik Psikolog', 'Uzman Psikolog', 'Psikiyatrist', 'Psikolojik Danışman', 'Aile Terapisti'].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <InputField label="Deneyim (yıl)" type="number" placeholder="5" required value={form.experience} onChange={set('experience')} />
                    <InputField
                      label="Mezun Olduğunuz Üniversite ve Bölüm"
                      placeholder="Örn: Boğaziçi Üniversitesi, Psikoloji"
                      required
                      value={form.education}
                      onChange={set('education')}
                    />

                    {/* YÖK Diploma Kontrolü */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Y.Ö.K Diploma Kontrolü <span className="text-red-500">*</span>
                      </label>

                      {/* Bilgi kutusu */}
                      <div className="flex items-start gap-2.5 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 mb-3">
                        <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                        </svg>
                        <p className="text-xs text-teal-800 leading-relaxed">
                          Diplomanız Yükseköğretim Kurulu (YÖK) kayıtlarıyla doğrulanacaktır.
                          Lütfen <strong>e-devlet üzerinden aldığınız diploma belgesi</strong> veya
                          <strong> üniversite onaylı diplomanızın</strong> fotoğrafını/taramasını yükleyin.
                        </p>
                      </div>

                      {/* Upload alanı */}
                      {!diplomaFile ? (
                        <div
                          onDragOver={(e) => { e.preventDefault(); setDiplomaDragOver(true); }}
                          onDragLeave={() => setDiplomaDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDiplomaDragOver(false);
                            const file = e.dataTransfer.files[0];
                            if (file) setDiplomaFile(file);
                          }}
                          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                            diplomaDragOver
                              ? 'border-teal-400 bg-teal-50'
                              : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                          }`}
                        >
                          <label className="cursor-pointer block">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setDiplomaFile(file);
                              }}
                            />
                            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.8">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                              </svg>
                            </div>
                            <p className="text-sm font-semibold text-slate-700 mb-1">
                              Dosyayı sürükleyin veya tıklayın
                            </p>
                            <p className="text-xs text-slate-400">PDF, JPG, PNG — Maks. 10 MB</p>
                          </label>
                        </div>
                      ) : (
                        /* Yüklendi göstergesi */
                        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                          <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-green-800 truncate">{diplomaFile.name}</p>
                            <p className="text-xs text-green-600">
                              {(diplomaFile.size / 1024 / 1024).toFixed(2)} MB · Yüklendi ✓
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDiplomaFile(null)}
                            className="text-green-400 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-slate-400 mt-1.5">
                        Belgeniz admin ekibimiz tarafından YÖK sistemiyle doğrulanacaktır.
                      </p>
                    </div>

                    {/* Sertifikasyon Yükleme */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-slate-700">
                          Sertifikalar
                          <span className="ml-1.5 text-xs font-normal text-slate-400">(İsteğe bağlı)</span>
                        </label>
                        {certFiles.length > 0 && (
                          <span className="text-xs text-teal-600 font-medium">{certFiles.length} dosya</span>
                        )}
                      </div>

                      <div className="flex items-start gap-2.5 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 mb-3">
                        <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                          <circle cx="12" cy="8" r="6"/>
                          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                        </svg>
                        <p className="text-xs text-violet-800 leading-relaxed">
                          BDT, EMDR, Şema Terapi gibi yaklaşım sertifikalarınız varsa yükleyebilirsiniz.
                          Sertifikalar profilinize güvenilirlik katarak daha fazla danışana ulaşmanızı sağlar.
                          <strong className="block mt-0.5">Sertifikanız yoksa bu adımı atlayabilirsiniz.</strong>
                        </p>
                      </div>

                      {/* Yüklü dosyalar listesi */}
                      {certFiles.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {certFiles.map((file, i) => (
                            <div key={i} className="flex items-center gap-3 bg-violet-50 border border-violet-100 rounded-xl px-4 py-2.5">
                              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                  <polyline points="14 2 14 8 20 8"/>
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-violet-900 truncate">{file.name}</p>
                                <p className="text-xs text-violet-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setCertFiles((prev) => prev.filter((_, idx) => idx !== i))}
                                className="text-violet-300 hover:text-red-500 transition-colors flex-shrink-0"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Drop zone */}
                      <div
                        onDragOver={(e) => { e.preventDefault(); setCertDragOver(true); }}
                        onDragLeave={() => setCertDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setCertDragOver(false);
                          const files = Array.from(e.dataTransfer.files);
                          setCertFiles((prev) => [...prev, ...files]);
                        }}
                        className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                          certDragOver
                            ? 'border-violet-400 bg-violet-50'
                            : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/40'
                        }`}
                      >
                        <label className="cursor-pointer block">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              setCertFiles((prev) => [...prev, ...files]);
                            }}
                          />
                          <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="17 8 12 3 7 8"/>
                              <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-slate-600 mb-0.5">
                            {certFiles.length > 0 ? 'Daha fazla sertifika ekle' : 'Sertifika yükle (isteğe bağlı)'}
                          </p>
                          <p className="text-xs text-slate-400">PDF, JPG, PNG · Birden fazla dosya seçilebilir</p>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <h2 className="text-lg font-bold text-slate-800 mb-5">Profil Detayları</h2>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Uzmanlık Alanları <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {specialtyOptions.map((s) => (
                          <CheckChip
                            key={s}
                            label={s}
                            selected={form.specialties.includes(s)}
                            onClick={() => toggleArr('specialties', s)}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Terapi Yaklaşımları</label>
                      <div className="flex flex-wrap gap-2">
                        {approachOptions.map((a) => (
                          <CheckChip
                            key={a}
                            label={a}
                            selected={form.approaches.includes(a)}
                            onClick={() => toggleArr('approaches', a)}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Seans Modu</label>
                      <div className="flex gap-2">
                        {['Online', 'Yüz yüze'].map((m) => (
                          <CheckChip
                            key={m}
                            label={m}
                            selected={form.sessionMode.includes(m)}
                            onClick={() => toggleArr('sessionMode', m)}
                          />
                        ))}
                      </div>
                    </div>

                    <InputField
                      label="Seans Ücreti (₺)"
                      type="number"
                      placeholder="1250"
                      required
                      value={form.price}
                      onChange={(v) => { if (v === '' || (Number(v) <= 99999 && v.length <= 5)) set('price')(v); }}
                      hint="Standart 50 dakikalık seans başına (max ₺99.999)"
                    />

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Kendinizi Tanıtın</label>
                      <textarea
                        rows={4}
                        placeholder="Danışanlarınıza sizi ve çalışma yaklaşımınızı tanıtın..."
                        value={form.about}
                        onChange={(e) => set('about')(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 resize-none"
                      />
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <h2 className="text-lg font-bold text-slate-800 mb-2">Profil Fotoğrafı</h2>
                    <p className="text-sm text-slate-500 mb-5">
                      Net, profesyonel bir fotoğraf danışan güvenini artırır.
                    </p>

                    {/* Profil fotoğrafı */}
                    <div className="flex flex-col items-center gap-4">
                      <div
                        onClick={() => photoInputRef.current?.click()}
                        className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-dashed border-slate-300 hover:border-teal-400 cursor-pointer flex items-center justify-center bg-slate-50 transition-colors relative"
                      >
                        {photoPreview ? (
                          <img src={photoPreview} alt="Önizleme" className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className="text-center p-3">
                            <svg className="mx-auto mb-1 text-slate-300" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                            <span className="text-xs text-slate-400">Fotoğraf Yükle</span>
                          </div>
                        )}
                      </div>
                      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }
                      }} />
                      <button type="button" onClick={() => photoInputRef.current?.click()}
                        className="text-sm text-teal-600 font-medium hover:underline">
                        {photoPreview ? 'Fotoğrafı Değiştir' : 'Fotoğraf Seç'}
                      </button>
                    </div>

                    {/* Galeri Fotoğrafları */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Galeri Fotoğrafları
                        <span className="text-slate-400 font-normal ml-1">(isteğe bağlı, en fazla 6)</span>
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {galleryPhotos.map((src, i) => (
                          <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100 relative group">
                            <img src={src} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setGalleryPhotos((p) => p.filter((_, j) => j !== i))}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
                            >✕</button>
                          </div>
                        ))}
                        {galleryPhotos.length < 6 && (
                          <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-teal-400 flex flex-col items-center justify-center text-slate-400 hover:text-teal-500 transition-colors"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            <span className="text-xs mt-1">Ekle</span>
                          </button>
                        )}
                      </div>
                      <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          const urls = files.map((f) => URL.createObjectURL(f));
                          setGalleryPhotos((prev) => [...prev, ...urls].slice(0, 6));
                        }}
                      />
                    </div>

                    {/* Tanıtım Videosu */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Tanıtım Videosu
                        <span className="text-slate-400 font-normal ml-1">(isteğe bağlı, ~10 saniye)</span>
                      </label>
                      <p className="text-xs text-slate-400 mb-3">
                        Kendinizi kısa bir videoyla tanıtın — kısa bir tanışma klibi danışanlarınızın güvenini artırır.
                      </p>
                      {videoPreview ? (
                        <div className="rounded-xl overflow-hidden bg-slate-900 aspect-video relative">
                          <video src={videoPreview} controls className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { setVideoFile(null); setVideoPreview(null); }}
                            className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg">
                            Kaldır
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-2xl py-8 flex flex-col items-center gap-2 text-slate-400 hover:text-teal-500 transition-colors"
                        >
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                          </svg>
                          <span className="text-sm font-medium">Video Yükle</span>
                          <span className="text-xs">MP4, MOV · Maks. 50 MB</span>
                        </button>
                      )}
                      <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime" className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) { setVideoFile(file); setVideoPreview(URL.createObjectURL(file)); }
                        }}
                      />
                    </div>
                  </>
                )}

                {/* Nav buttons */}
                <div className="flex gap-3 pt-4">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={prev}
                      className="flex-1 border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Geri
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    {step === 4 ? 'Başvuruyu Gönder' : 'Devam Et'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">
              Kayıt olarak{' '}
              <Link href="/kullanim-kosullari" className="text-teal-600 hover:underline">Kullanım Koşulları</Link>
              {' '}ve{' '}
              <Link href="/gizlilik" className="text-teal-600 hover:underline">Gizlilik Politikası</Link>
              &apos;nı kabul etmiş olursunuz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
