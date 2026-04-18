'use client';

import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatBot from './ChatBot';
import CookieBanner from './CookieBanner';

export default function RootLayoutClient({ children }) {
  const pathname = usePathname();
  const isPanelRoute = pathname?.startsWith('/panel');
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isPanelRoute || isAdminRoute) {
    return <SessionProvider>{children}</SessionProvider>;
  }

  return (
    <SessionProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatBot />
      <CookieBanner />
    </SessionProvider>
  );
}
