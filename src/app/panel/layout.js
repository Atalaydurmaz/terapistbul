'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { therapists } from '../../data/therapists';

const navItems = [
  {
    href: '/panel/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: '/panel/profil',
    label: 'Profilim',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: '/panel/randevular',
    label: 'Randevular',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/panel/mesajlar',
    label: 'Mesajlar',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/panel/istatistikler',
    label: 'İstatistikler',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: '/panel/ayarlar',
    label: 'Ayarlar',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93A10 10 0 0 0 4.93 19.07M4.93 4.93a10 10 0 0 0 14.14 14.14" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
      </svg>
    ),
  },
];

const pageTitles = {
  '/panel/dashboard': 'Dashboard',
  '/panel/profil': 'Profilim',
  '/panel/randevular': 'Randevular',
  '/panel/mesajlar': 'Mesajlar',
  '/panel/istatistikler': 'İstatistikler',
  '/panel/ayarlar': 'Ayarlar',
};

export default function PanelLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [therapist, setTherapist] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('panel_auth');
    const id = localStorage.getItem('panel_therapist_id');
    if (!auth || !id) {
      router.push('/panel/giris');
      return;
    }
    const staticT = therapists.find((t) => t.id === id);
    if (staticT) {
      const merged = { ...staticT };
      try {
        const stored = localStorage.getItem(`panel_profil_${id}`);
        if (stored) {
          const s = JSON.parse(stored);
          if (s.formData?.adSoyad) merged.name = s.formData.adSoyad;
          if (s.formData?.unvan) merged.title = s.formData.unvan;
          if (s.photoPreview) merged.photo = s.photoPreview;
          merged.initials = merged.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
        }
      } catch { /* ignore */ }
      setTherapist(merged);
    } else {
      // UUID tabanlı terapist (Supabase'den onaylanmış)
      fetch(`/api/terapistler-db/${id}`)
        .then((r) => r.json())
        .then((db) => {
          if (!db || db.error) return;
          const name = db.name || '';
          const initials = name.replace(/^(Prof\. Dr\.|Doç\. Dr\.|Dr\.|Uzm\. Psk\.|Uzm\.|Psk\.)\s*/i, '').split(' ').filter(Boolean).map((w) => w[0].toUpperCase()).slice(0, 2).join('');
          setTherapist({ ...db, initials, color: '#0d9488', photo: db.photo_url || null });
        })
        .catch(() => {});
    }
  }, [router, pathname]);

  const pageTitle = pageTitles[pathname] || 'Panel';

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('panel_auth');
    }
    router.push('/panel/giris');
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Okunmamış mesaj sayısını localStorage'dan oku; mesajlar sayfasındayken sıfırla
  useEffect(() => {
    if (pathname === '/panel/mesajlar') {
      localStorage.setItem('panel_unread_messages', '0');
      setUnreadMessages(0);
    } else {
      const count = Number(localStorage.getItem('panel_unread_messages') || 0);
      setUnreadMessages(count);
    }
  }, [pathname]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-teal-700/30">
        <Link href="/panel/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/logo.svg" alt="TerapistBul" width="32" height="32" className="rounded-lg" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">TerapistBul</p>
            <p className="text-teal-200 text-xs mt-0.5">Terapist Paneli</p>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/panel/dashboard' && pathname === '/panel');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-teal-300 group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.href === '/panel/mesajlar' && unreadMessages > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadMessages}
                </span>
              )}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Therapist mini card */}
      <div className="px-3 py-4 border-t border-teal-700/30">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/10">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 bg-teal-200 rounded-full flex items-center justify-center text-teal-800 font-bold text-sm">
              {therapist?.initials || 'TB'}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-teal-700 rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{therapist?.name || 'Terapist'}</p>
            <p className="text-teal-300 text-xs truncate">{therapist?.title || ''}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Çıkış Yap"
            className="text-teal-300 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0fdfa] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-teal-700 fixed inset-y-0 left-0 z-30 shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-72 bg-teal-700 z-50 shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-teal-200 hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top header bar */}
        <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">{pageTitle}</h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notification bell */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors relative"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800 text-sm">Bildirimler</h3>
                      <span className="text-xs text-teal-600 font-medium cursor-pointer hover:underline">Tümünü okundu işaretle</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {[
                        { icon: '📅', text: 'Yeni randevu talebi: Ahmet Yılmaz', time: '5 dk önce', unread: true },
                        { icon: '⭐', text: 'Yeni yorum: "Çok memnun kaldım"', time: '1 saat önce', unread: true },
                        { icon: '💬', text: 'Yeni mesaj: Fatma Demir', time: '2 saat önce', unread: false },
                      ].map((n, i) => (
                        <div key={i} className={`flex gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer ${n.unread ? 'bg-teal-50/50' : ''}`}>
                          <span className="text-xl flex-shrink-0 mt-0.5">{n.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 leading-snug">{n.text}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                          </div>
                          {n.unread && <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1.5" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar */}
              <div className="w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:bg-teal-700 transition-colors">
                {therapist?.initials || 'TB'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
