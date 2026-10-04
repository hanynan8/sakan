// app/layout.js
import { Inter, IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import ClientLayout from './clientLayout';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Navbar from './components/navbar';
import Footer from './components/footer';
import ConditionalShell from './components/ConditionalShell';

// الإنجليزي: Inter (عصري وبسيط) — العربي: IBM Plex Sans Arabic (نظيف ومتناسق معاه)
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: '--font-arabic',
  subsets: ['arabic'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata = {
  title: 'سكن - منصة السكن الطلابي',
  description: 'أكبر منصة للسكن الطلابي في مصر',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" className={`${inter.variable} ${plexArabic.variable}`} suppressHydrationWarning={true}>
      <body className="font-sans antialiased">
        <LanguageProvider>
          <SessionProvider>
            <ConditionalShell
              navbar={<Navbar />}
              footer={<Footer />}
              hiddenOn={['/help']}
            >
              <ClientLayout>{children}</ClientLayout>
            </ConditionalShell>
          </SessionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}