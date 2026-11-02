// app/layout.js
import localFont from 'next/font/local';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import ClientLayout from './clientLayout';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import Navbar from './components/navbar';
import Footer from './components/footer';
import ConditionalShell from './components/ConditionalShell';

// الخطوط متخزنة جوه المشروع (app/fonts) فمش بتعتمد على اتصال بـ Google وقت التشغيل أو البيلد
// Inter للإنجليزي هنا، وCairo (العربي الافتراضي) متعرّف في globals.css بـ @font-face
const inter = localFont({
  src: './fonts/inter-latin-wght-normal.woff2',
  variable: '--font-inter',
  weight: '100 900',
  display: 'swap',
});

export const metadata = {
  title: 'سكن - منصة السكن الطلابي',
  description: 'أكبر منصة للسكن الطلابي في مصر',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable}`} suppressHydrationWarning={true}>
      <body className="font-sans antialiased">
        <LanguageProvider>
          <SessionProvider>
            <FavoritesProvider>
              <ConditionalShell
                navbar={<Navbar />}
                footer={<Footer />}
                hiddenOn={['/help']}
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