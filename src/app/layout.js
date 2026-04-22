import { Geist } from 'next/font/google';
import './globals.css';
import RootLayoutClient from '../components/RootLayoutClient';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata = {
  title: {
    default: 'TerapistBul — Yapay Zeka Destekli Terapist Eşleştirme',
    template: '%s | TerapistBul',
  },
  description:
    'Türkiye\'nin yapay zeka destekli terapist bulma platformu. Psikolog, psikiyatrist veya terapist arayışınızda size en uygun uzmanı saniyeler içinde eşleştiriyoruz.',
  keywords: ['psikolog bul', 'terapist bul', 'online terapi', 'psikolojik destek', 'ruh sağlığı'],
  authors: [{ name: 'TerapistBul' }],
  openGraph: {
    title: 'TerapistBul — Yapay Zeka Destekli Terapist Eşleştirme',
    description: 'Türkiye\'nin yapay zeka destekli terapist bulma platformu.',
    locale: 'tr_TR',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0d9488',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
