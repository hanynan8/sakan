// app/layout.js
import { Rubik, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import ClientLayout from './clientLayout';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Navbar from './components/navbar';
import Footer from './components/footer';
import ConditionalShell from './components/ConditionalShell';

const rubik = Rubik({
  variable: '--font-rubik-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'سكن - منصة السكن الطلابي',
  description: 'أكبر منصة للسكن الطلابي في مصر',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" suppressHydrationWarning={true}>
      <body className={`${rubik.className} ${geistMono.variable} antialiased`}>
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