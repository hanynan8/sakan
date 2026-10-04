'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const menuItems = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    label: { en: 'My Properties', ar: 'سكناتي وإضافة سكن' },
    desc: { en: 'Add a new property, or manage the ones you already listed.', ar: 'أضف سكن جديد، أو تحكم في السكنات اللي ضفتها قبل كده.' },
    href: '/profile/properties',
    roles: ['owner', 'admin'],
  },
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: { en: 'Account Settings', ar: 'إعدادات الحساب' },
    desc: { en: 'Update your name and change your password.', ar: 'عدّل اسمك وغيّر كلمة المرور.' },
    href: '/profile/settings',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    label: { en: 'Admin Panel', ar: 'لوحة الإدارة' },
    desc: { en: 'Manage users, properties and support requests.', ar: 'إدارة المستخدمين والسكنات وطلبات الدعم.' },
    href: '/profile/admin',
    roles: ['admin'],
  },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { language } = useLanguage();
  const ar = language === 'ar';

  const name  = session?.user?.name  || '—';
  const email = session?.user?.email || session?.user?.phone || '—';
  const initial = name.charAt(0).toUpperCase();
  const role = session?.user?.role;

  // اعرض العناصر اللي مالهاش roles لأي حد، وعناصر الـ owner/admin لأصحابها بس
  const visibleItems = menuItems.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <div className="bg-gray-50 pb-12" dir={ar ? 'rtl' : 'ltr'}>
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-1.5 text-sm">
          <Link href="/" className="text-brand-dark hover:text-navy transition-colors font-medium">
            {ar ? 'الرئيسية' : 'Home'}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 font-medium">{ar ? 'الملف الشخصي' : 'Profile'}</span>
        </nav>
        <h1 className="text-2xl font-bold text-navy mt-3">
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
                  <p className="text-lg font-bold text-navy">{name}</p>
                  <p className="text-sm text-gray-500">{email}</p>
                </>
              )}
            </div>
          </div>

          {/* Menu grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x-0">
            {visibleItems.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className={`flex items-center justify-between px-8 py-7 hover:bg-gray-50 transition-colors group
                  ${i < visibleItems.length - 2 ? 'border-b border-gray-100' : ''}
                  ${i % 2 === 0 && i + 1 < visibleItems.length ? 'sm:border-r sm:border-gray-100' : ''}
                `}
              >
                <div className="flex items-start gap-4">
                  <span className="text-gray-400 group-hover:text-gray-600 transition-colors mt-0.5 flex-shrink-0">
                    {item.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-navy text-base">
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