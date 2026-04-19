'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <path d="M3 20h18" />
      </svg>
    ),
  },
  {
    href: '/admin/terapistler',
    label: 'Terapistler',
    badgeKey: 'terapistler',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/admin/danisanlar',
    label: 'Danışanlar',
    badgeKey: 'danisanlar',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: '/admin/randevular',
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
    href: '/admin/blog',
    label: 'Blog Yönetimi',
    badge: '108',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    href: '/admin/testler',
    label: 'Testler',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="2" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
  },
  {
    href: '/admin/finans',
    label: 'Gelir & Finans',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    href: '/admin/ayarlar',
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
  '/admin/dashboard': 'Dashboard',
  '/admin/terapistler': 'Terapistler',
  '/admin/danisanlar': 'Danışanlar',
  '/admin/randevular': 'Randevular',
  '/admin/blog': 'Blog Yönetimi',
  '/admin/testler': 'Testler',
  '/admin/finans': 'Gelir & Finans',
  '/admin/ayarlar': 'Ayarlar',
};

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [counts, setCounts] = useState({ terapistler: '…', danisanlar: '…', blog: '…' });

  useEffect(() => {
    Promise.all([
      fetch('/api/terapistler-db').then(r => r.json()).catch(() => []),
      fetch('/api/danisanlar').then(r => r.json()).catch(() => []),
    ]).then(([t, d]) => {
      setCounts(prev => ({ ...prev, terapistler: Array.isArray(t) ? t.length : '?', danisanlar: Array.isArray(d) ? d.length : '?' }));
    });
  }, []);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const pageTitle = pageTitles[pathname] || 'Admin Panel';

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_auth');
    }
    router.push('/admin/giris');
  };

  useEffect(() => {
    setSidebarOpen(false);
    setNotifOpen(false);
    setAvatarOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center">
            <img src="/logo.svg" alt="TerapistBul" width="36" height="36" className="rounded-xl" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">TerapistBul</p>
            <p className="text-slate-400 text-xs mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {(item.badge || item.badgeKey) && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                  isActive ? 'bg-teal-500/30 text-teal-300' : 'bg-slate-700 text-slate-400'
                }`}>
                  {item.badgeKey ? counts[item.badgeKey] : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin user card */}
      <div className="px-3 py-4 border-t border-slate-700 space-y-2">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-slate-800 rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">Admin</p>
            <p className="text-slate-400 text-xs truncate">Süper Yönetici</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Çıkış Yap
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 fixed inset-y-0 left-0 z-30 shadow-xl border-r border-slate-800">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-72 bg-slate-900 z-50 shadow-2xl border-r border-slate-800">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
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
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Admin</span>
                  <span>/</span>
                  <span className="text-teal-400">{pageTitle}</span>
                </div>
                <h1 className="text-base font-semibold text-white">{pageTitle}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Date */}
              <span className="hidden md:block text-xs text-slate-500 mr-2">
                {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>

              {/* Notification bell */}
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setAvatarOpen(false); }}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors relative"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">5</span>
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                      <h3 className="font-semibold text-white text-sm">Bildirimler</h3>
                      <span className="text-xs text-teal-400 cursor-pointer hover:underline">Tümünü okundu işaretle</span>
                    </div>
                    <div className="divide-y divide-slate-700">
                      {[
                        { icon: '👤', text: 'Yeni terapist başvurusu: Selin Yıldız', time: '3 dk önce', unread: true },
                        { icon: '📅', text: 'Sistem: 156 aktif randevu bugün', time: '15 dk önce', unread: true },
                        { icon: '💬', text: 'Blog yorumu onay bekliyor', time: '1 saat önce', unread: true },
                        { icon: '⚠️', text: 'Terapist Ahmet Yılmaz şikayet bildirimi', time: '2 saat önce', unread: true },
                        { icon: '💰', text: 'Aylık gelir raporu hazır', time: '3 saat önce', unread: false },
                      ].map((n, i) => (
                        <div key={i} className={`flex gap-3 px-4 py-3 hover:bg-slate-700/50 cursor-pointer transition-colors ${n.unread ? 'bg-teal-500/5' : ''}`}>
                          <span className="text-xl flex-shrink-0 mt-0.5">{n.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-200 leading-snug">{n.text}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{n.time}</p>
                          </div>
                          {n.unread && <span className="w-2 h-2 bg-teal-400 rounded-full flex-shrink-0 mt-1.5" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin avatar dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setAvatarOpen(!avatarOpen); setNotifOpen(false); }}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    A
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {avatarOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-700">
                      <p className="text-sm font-semibold text-white">Admin</p>
                      <p className="text-xs text-slate-400">admin@terapistbul.com</p>
                    </div>
                    <div className="py-1">
                      <Link href="/admin/ayarlar" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>
                        Ayarlar
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
