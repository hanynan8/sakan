'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

function EmptyIllustration() {
  return (
    <svg viewBox="0 0 220 180" className="w-56 h-44 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="48" r="14" fill="#F9A8C9" opacity="0.7" />
      <path d="M80 38 Q83 35 86 38" stroke="#555" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M88 34 Q91 31 94 34" stroke="#555" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <rect x="65" y="95" width="90" height="60" rx="2" fill="#F3D0D7"/>
      <polygon points="55,97 110,55 165,97" fill="#B03060"/>
      <rect x="130" y="60" width="10" height="22" fill="#C94070"/>
      <circle cx="135" cy="55" r="4" fill="#F9A8C9" opacity="0.5"/>
      <circle cx="138" cy="48" r="3" fill="#F9A8C9" opacity="0.3"/>
      <circle cx="110" cy="82" r="9" fill="white" stroke="#B03060" strokeWidth="2"/>
      <line x1="110" y1="73" x2="110" y2="91" stroke="#B03060" strokeWidth="1.5"/>
      <line x1="101" y1="82" x2="119" y2="82" stroke="#B03060" strokeWidth="1.5"/>
      <rect x="96" y="120" width="28" height="35" rx="14" fill="#C94070"/>
      <circle cx="121" cy="137" r="2" fill="white"/>
      <rect x="70" y="105" width="20" height="16" rx="2" fill="white" stroke="#ddd" strokeWidth="1"/>
      <line x1="80" y1="105" x2="80" y2="121" stroke="#ddd" strokeWidth="1"/>
      <line x1="70" y1="113" x2="90" y2="113" stroke="#ddd" strokeWidth="1"/>
      <rect x="130" y="105" width="20" height="16" rx="2" fill="white" stroke="#ddd" strokeWidth="1"/>
      <line x1="140" y1="105" x2="140" y2="121" stroke="#ddd" strokeWidth="1"/>
      <line x1="130" y1="113" x2="150" y2="113" stroke="#ddd" strokeWidth="1"/>
      <rect x="148" y="130" width="7" height="25" rx="1" fill="#e74c7c" opacity="0.7"/>
      <rect x="142" y="145" width="22" height="10" rx="3" fill="#e74c7c"/>
      <rect x="145" y="140" width="16" height="8" rx="2" fill="#f08090"/>
      <circle cx="147" cy="156" r="3" fill="#333"/>
      <circle cx="161" cy="156" r="3" fill="#333"/>
      <line x1="52" y1="155" x2="58" y2="110" stroke="#2d5a27" strokeWidth="2.5"/>
      <path d="M58 110 Q45 100 35 108" stroke="#3a7a32" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M58 110 Q50 95 55 85" stroke="#3a7a32" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M58 110 Q68 98 72 103" stroke="#3a7a32" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <line x1="170" y1="155" x2="166" y2="112" stroke="#2d5a27" strokeWidth="2.5"/>
      <path d="M166 112 Q178 102 188 110" stroke="#3a7a32" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M166 112 Q172 97 168 87" stroke="#3a7a32" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M166 112 Q155 100 152 105" stroke="#3a7a32" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <rect x="40" y="155" width="140" height="4" rx="2" fill="#e8e8e8"/>
    </svg>
  );
}

// ── Booking Card (لما يبقى في بيانات) ──
function BookingCard({ item, ar }) {
  const statusColor = {
    completed: 'bg-green-100 text-green-700',
    pending:   'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-600',
  };
  const statusLabel = {
    completed: { en: 'Completed', ar: 'مكتمل' },
    pending:   { en: 'Pending',   ar: 'معلق' },
    cancelled: { en: 'Cancelled', ar: 'ملغي' },
  };
  const status = item.status || 'pending';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="sm:w-40 h-36 sm:h-auto bg-gray-100 flex-shrink-0 overflow-hidden">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              </svg>
            </div>
          )}
        </div>
        {/* Info */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-sm">{item.name || '—'}</h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor[status] || statusColor.pending}`}>
                {ar ? statusLabel[status]?.ar : statusLabel[status]?.en}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{item.location || item.city || '—'}</p>
            {item.checkIn && (
              <p className="text-xs text-gray-500">
                {ar ? 'من' : 'From'} <span className="font-medium text-gray-700">{item.checkIn}</span>
                {item.checkOut && <> {ar ? 'إلى' : 'to'} <span className="font-medium text-gray-700">{item.checkOut}</span></>}
              </p>
            )}
          </div>
          {item.price && (
            <p className="text-sm font-bold text-rose-500 mt-2">
              {item.price} <span className="text-xs font-normal text-gray-400">/ {ar ? 'أسبوع' : 'week'}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const { language } = useLanguage();
  const ar = language === 'ar';

  // TODO: لما تبعتلي بنية الـ API غير دي لـ useState([]) وفك التعليق على fetchBookings
  const [items] = useState([]);

  // const fetchBookings = async () => {
  //   const res = await fetch('/api/data?collection=bookings');
  //   const data = await res.json();
  //   const userId = session?.user?.id;
  //   const filtered = userId ? data.filter(d => d.userId === userId) : data;
  //   setItems(Array.isArray(filtered) ? filtered : []);
  // };
  // useEffect(() => { fetchBookings(); }, []);

  return (
    <div className="min-h-screen bg-gray-50" dir={ar ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-3">
          <Link href="/" className="text-rose-500 hover:text-rose-600 transition-colors font-medium">{ar ? 'الرئيسية' : 'Home'}</Link>
          <span className="text-gray-400">/</span>
          <Link href="/profile" className="text-rose-500 hover:text-rose-600 transition-colors font-medium">{ar ? 'الملف الشخصي' : 'Profile'}</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 font-medium">{ar ? 'الحجوزات' : 'Booking'}</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">{ar ? 'الحجوزات' : 'Booking'}</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">

          {/* Empty */}
          {items.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4">
              <EmptyIllustration />
              <p className="text-gray-500 text-sm mt-4 mb-6">
                {ar ? 'لا توجد حجوزات متاحة' : 'No booking available'}
              </p>
              <Link
                href="/"
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-full transition-colors"
              >
                {ar ? 'استكشف العقارات' : 'Explore properties'}
              </Link>
            </div>
          )}

          {/* Items */}
          {items.length > 0 && (
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500 mb-2">
                {items.length} {ar ? 'حجز' : items.length === 1 ? 'booking' : 'bookings'}
              </p>
              {items.map(item => (
                <BookingCard key={item._id} item={item} ar={ar} />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}