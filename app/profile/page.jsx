'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const menuItems = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    label: { en: 'Shortlist', ar: 'المفضلة' },
    desc: { en: 'Click to check all the amazing properties you shortlisted for your stay.', ar: 'انقر لمشاهدة كل العقارات التي أضفتها للمفضلة.' },
    href: '/profile/shortlist',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
      </svg>
    ),
    label: { en: 'Bookings', ar: 'الحجوزات' },
    desc: { en: 'You can see the completed and pending bookings here.', ar: 'يمكنك مشاهدة الحجوزات المكتملة والمعلقة هنا.' },
    href: 'profile/booking',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
    label: { en: 'Refer and Earn', ar: 'أحل واكسب' },
    desc: { en: 'You can earn £50 on each successful referral. Click to see your referral code.', ar: 'يمكنك كسب 50 جنيهاً على كل إحالة ناجحة.' },
    href: '/profile/refer',
  },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { language } = useLanguage();
  const ar = language === 'ar';

  const name  = session?.user?.name  || '—';
  const email = session?.user?.email || session?.user?.phone || '—';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="bg-gray-50 pb-12" dir={ar ? 'rtl' : 'ltr'}>
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-1.5 text-sm">
          <Link href="/" className="text-rose-500 hover:text-rose-600 transition-colors font-medium">
            {ar ? 'الرئيسية' : 'Home'}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 font-medium">{ar ? 'الملف الشخصي' : 'Profile'}</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">
          {ar ? 'الملف الشخصي' : 'Profile'}
        </h1>
      </div>

      {/* Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-4 lg:px-2 pb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* User info */}
          <div className="flex items-center gap-4 px-8 py-7 border-b border-gray-100">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-gray-500 text-white flex items-center justify-center text-xl font-bold flex-shrink-0 select-none">
              {status === 'loading' ? '...' : initial}
            </div>
            <div>
              {status === 'loading' ? (
                <>
                  <div className="h-5 w-32 bg-gray-100 animate-pulse rounded mb-2" />
                  <div className="h-4 w-44 bg-gray-100 animate-pulse rounded" />
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-gray-900">{name}</p>
                  <p className="text-sm text-gray-500">{email}</p>
                </>
              )}
            </div>
          </div>

          {/* Menu grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x-0">
            {menuItems.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className={`flex items-center justify-between px-8 py-7 hover:bg-gray-50 transition-colors group
                  ${i < menuItems.length - 2 ? 'border-b border-gray-100' : ''}
                  ${i % 2 === 0 && i + 1 < menuItems.length ? 'sm:border-r sm:border-gray-100' : ''}
                `}
              >
                <div className="flex items-start gap-4">
                  <span className="text-gray-400 group-hover:text-gray-600 transition-colors mt-0.5 flex-shrink-0">
                    {item.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-base">
                        {ar ? item.label.ar : item.label.en}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                      {ar ? item.desc.ar : item.desc.en}
                    </p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 ${ar ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}