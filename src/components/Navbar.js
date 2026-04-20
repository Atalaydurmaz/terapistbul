'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

function UserAvatar({ session }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = session.user?.name
    ? session.user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : session.user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-teal-600 text-white text-sm font-bold flex items-center justify-center hover:bg-teal-700 hover:ring-teal-300 transition-all ring-2 ring-teal-100 cursor-pointer"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-50">
          <div className="px-4 py-2 border-b border-slate-100 mb-1">
            <p className="text-xs font-semibold text-slate-800 truncate">{session.user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{session.user?.email}</p>
          </div>
          <Link
            href="/hesabim"
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            onClick={() => setOpen(false)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Hesabım
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/giris' })}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="w-full px-3 sm:px-4 lg:px-5">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="TerapistBul logo" width={36} height={36} priority />
            <span className="text-xl font-bold">
              <span className="text-[#1a56db]">Terapist</span><span className="text-[#16a34a]">Bul</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/terapistler" className="text-slate-600 hover:text-teal-600 font-medium text-sm transition-colors">
              Terapist Bul
            </Link>
            <Link href="/hakkimizda" className="text-slate-600 hover:text-teal-600 font-medium text-sm transition-colors">
              Hakkımızda
            </Link>
            <Link href="/nasil-calisir" className="text-slate-600 hover:text-teal-600 font-medium text-sm transition-colors">
              Nasıl Çalışır
            </Link>
            <Link href="/blog" className="text-slate-600 hover:text-teal-600 font-medium text-sm transition-colors">
              Psikoloji Blog
            </Link>
            <Link href="/testler" className="flex items-center gap-1.5 text-slate-600 hover:text-teal-600 font-medium text-sm transition-colors">
              <span className="text-[10px] bg-teal-100 text-teal-700 font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap">Yapay Zeka</span>
              Psikolojik Testler
            </Link>
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/panel/dashboard"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors border border-slate-200 hover:border-teal-300 px-3 py-1.5 rounded-lg hover:bg-teal-50"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              Terapist Paneli
            </Link>
            {session ? (
              <UserAvatar session={session} />
            ) : (
              <>
                <Link
                  href="/giris"
                  className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/uye-ol"
                  className="text-sm font-medium bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-colors"
                >
                  Terapist Olarak Katıl
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menüyü aç"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-3">
          <Link href="/terapistler" className="text-slate-700 font-medium py-2" onClick={() => setMenuOpen(false)}>
            Terapist Bul
          </Link>
          <Link href="/hakkimizda" className="text-slate-700 font-medium py-2" onClick={() => setMenuOpen(false)}>
            Hakkımızda
          </Link>
          <Link href="/nasil-calisir" className="text-slate-700 font-medium py-2" onClick={() => setMenuOpen(false)}>
            Nasıl Çalışır
          </Link>
          <Link href="/blog" className="text-slate-700 font-medium py-2" onClick={() => setMenuOpen(false)}>
            Psikoloji Blog
          </Link>
          <Link href="/testler" className="flex items-center gap-2 text-slate-700 font-medium py-2" onClick={() => setMenuOpen(false)}>
            <span className="text-[10px] bg-teal-100 text-teal-700 font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap">Yapay Zeka</span>
            Psikolojik Testler
          </Link>
          <hr className="border-slate-100" />
          <Link href="/panel/dashboard" className="flex items-center gap-2 text-slate-700 font-medium py-2" onClick={() => setMenuOpen(false)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Terapist Paneli
          </Link>
          {session ? (
            <>
              <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white text-sm font-bold flex items-center justify-center">
                  {session.user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{session.user?.name}</p>
                  <p className="text-xs text-slate-400">{session.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/giris' })}
                className="text-red-500 font-medium py-2 text-left"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link href="/giris" className="text-slate-700 font-medium py-2" onClick={() => setMenuOpen(false)}>
                Giriş Yap
              </Link>
              <Link
                href="/uye-ol"
                className="bg-teal-600 text-white text-center font-medium py-2.5 rounded-full"
                onClick={() => setMenuOpen(false)}
              >
                Terapist Olarak Katıl
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
