// app/layout.js
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import ClientLayout from './clientLayout';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import Navbar from './components/navbar';
import Footer from './components/footer';
import ConditionalShell from './components/ConditionalShell';
import { LOGO_URL } from '@/lib/brand';

// الخط الوحيد في الموقع: Cairo (متخزن في app/fonts ومتعرّف في globals.css بـ @font-face)

export const metadata = {
  title: 'سكن - منصة السكن الطلابي',
  description: 'أكبر منصة للسكن الطلابي في مصر',
  icons: { icon: LOGO_URL, shortcut: LOGO_URL, apple: LOGO_URL },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning={true}>
      <body className="font-sans antialiased">
        <LanguageProvider>
          <SessionProvider>
            <FavoritesProvider>
              <ConditionalShell
                navbar={<Navbar />}
                footer={<Footer />}
                hiddenOn={['/help']}
                hideNavbarOn={['/profile/admin']}
              >
                <ClientLayout>{children}</ClientLayout>
              </ConditionalShell>
            </FavoritesProvider>
          </SessionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}