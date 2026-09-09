'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

// ── Empty State Illustration (SVG house like the screenshot) ──
function EmptyIllustration() {
  return (
    <svg viewBox="0 0 220 180" className="w-56 h-44 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sun */}
      <circle cx="60" cy="48" r="14" fill="#F9A8C9" opacity="0.7" />
      {/* Birds */}
      <path d="M80 38 Q83 35 86 38" stroke="#555" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M88 34 Q91 31 94 34" stroke="#555" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      {/* House body */}
      <rect x="65" y="95" width="90" height="60" rx="2" fill="#F3D0D7"/>
      {/* Roof */}
      <polygon points="55,97 110,55 165,97" fill="#B03060"/>
      {/* Chimney */}
      <rect x="130" y="60" width="10" height="22" fill="#C94070"/>
      {/* Chimney smoke */}
      <circle cx="135" cy="55" r="4" fill="#F9A8C9" opacity="0.5"/>
      <circle cx="138" cy="48" r="3" fill="#F9A8C9" opacity="0.3"/>
      {/* Window round roof */}
      <circle cx="110" cy="82" r="9" fill="white" stroke="#B03060" strokeWidth="2"/>
      <line x1="110" y1="73" x2="110" y2="91" stroke="#B03060" strokeWidth="1.5"/>
      <line x1="101" y1="82" x2="119" y2="82" stroke="#B03060" strokeWidth="1.5"/>
      {/* Door */}
      <rect x="96" y="120" width="28" height="35" rx="14" fill="#C94070"/>
      <circle cx="121" cy="137" r="2" fill="white"/>
      {/* Windows left */}
      <rect x="70" y="105" width="20" height="16" rx="2" fill="white" stroke="#ddd" strokeWidth="1"/>
      <line x1="80" y1="105" x2="80" y2="121" stroke="#ddd" strokeWidth="1"/>
      <line x1="70" y1="113" x2="90" y2="113" stroke="#ddd" strokeWidth="1"/>
      {/* Windows right */}
      <rect x="130" y="105" width="20" height="16" rx="2" fill="white" stroke="#ddd" strokeWidth="1"/>
      <line x1="140" y1="105" x2="140" y2="121" stroke="#ddd" strokeWidth="1"/>
      <line x1="130" y1="113" x2="150" y2="113" stroke="#ddd" strokeWidth="1"/>
      {/* Garage */}
      <rect x="148" y="130" width="7" height="25" rx="1" fill="#e74c7c" opacity="0.7"/>
      {/* Car */}
      <rect x="142" y="145" width="22" height="10" rx="3" fill="#e74c7c"/>
      <rect x="145" y="140" width="16" height="8" rx="2" fill="#f08090"/>
      <circle cx="147" cy="156" r="3" fill="#333"/>
      <circle cx="161" cy="156" r="3" fill="#333"/>
      {/* Palm left */}
      <line x1="52" y1="155" x2="58" y2="110" stroke="#2d5a27" strokeWidth="2.5"/>
      <path d="M58 110 Q45 100 35 108" stroke="#3a7a32" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M58 110 Q50 95 55 85" stroke="#3a7a32" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M58 110 Q68 98 72 103" stroke="#3a7a32" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Palm right */}
      <line x1="170" y1="155" x2="166" y2="112" stroke="#2d5a27" strokeWidth="2.5"/>
      <path d="M166 112 Q178 102 188 110" stroke="#3a7a32" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M166 112 Q172 97 168 87" stroke="#3a7a32" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M166 112 Q155 100 152 105" stroke="#3a7a32" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Ground */}
      <rect x="40" y="155" width="140" height="4" rx="2" fill="#e8e8e8"/>
    </svg>
  );
}

// ── Property Card ──
function PropertyCard({ item, onRemove, ar }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      {/* Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
          </div>
        )}
        {/* Remove button */}
        <button
          onClick={() => onRemove(item._id)}
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
          </svg>
        </button>
      </div>
      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-0.5 truncate">{item.name || '—'}</h3>
        <p className="text-xs text-gray-500 mb-2 truncate">{item.location || item.city || '—'}</p>
        {item.price && (
          <p className="text-sm font-bold text-rose-500">
            {item.price} <span className="text-xs font-normal text-gray-400">/ {ar ? 'أسبوع' : 'week'}</span>
          </p>
        )}
        <Link
          href={item.href || `/properties/${item._id}`}
          className="mt-3 block text-center text-xs font-semibold text-rose-500 border border-rose-200 rounded-lg py-1.5 hover:bg-rose-50 transition-colors"
        >
          {ar ? 'عرض العقار' : 'View Property'}
        </Link>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function ShortlistPage() {
  const { data: session, status } = useSession();
  const { language } = useLanguage();
  const ar = language === 'ar';

  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false); // false → empty state يظهر فوراً
  const [error, setError]     = useState('');

  // TODO: لما تبعتلي بنية الـ API فك التعليق ده
  // useEffect(() => {
  //   if (status === 'loading') return;
  //   fetchShortlist();
  // }, [status]);

  // const fetchShortlist = async () => {
  //   setLoading(true);
  //   setError('');
  //   try {
  //     const res = await fetch('/api/data?collection=love');
  //     if (!res.ok) throw new Error('fetch failed');
  //     const data = await res.json();
  //     const userId = session?.user?.id;
  //     const filtered = userId
  //       ? data.filter(d => d.userId === userId || d.user === userId)
  //       : data;
  //     setItems(Array.isArray(filtered) ? filtered : []);
  //   } catch (err) {
  //     setError(ar ? 'حدث خطأ في تحميل البيانات' : 'Failed to load shortlist');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleRemove = async (id) => {
    // TODO: لما تكمل الـ API ممكن تعمل DELETE هنا
    setItems(prev => prev.filter(i => i._id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={ar ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-3">
          <Link href="/" className="text-rose-500 hover:text-rose-600 transition-colors font-medium">{ar ? 'الرئيسية' : 'Home'}</Link>
          <span className="text-gray-400">/</span>
          <Link href="/profile" className="text-rose-500 hover:text-rose-600 transition-colors font-medium">{ar ? 'الملف الشخصي' : 'Profile'}</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 font-medium">{ar ? 'المفضلة' : 'Shortlist'}</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">{ar ? 'المفضلة' : 'Shortlist'}</h1>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">

          {/* Loading */}
          {loading && (
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
              {[1,2,3].map(i => (
                <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
                  <div className="h-44 bg-gray-100 animate-pulse"/>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4"/>
                    <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2"/>
                    <div className="h-4 bg-gray-100 animate-pulse rounded w-1/3"/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && items.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4">
              <EmptyIllustration />
              <p className="text-gray-500 text-sm mt-4 mb-6">
                {ar ? 'لا توجد عقارات في المفضلة' : 'No property shortlisted'}
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
          {!loading && !error && items.length > 0 && (
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-5">
                {items.length} {ar ? 'عقار' : items.length === 1 ? 'property' : 'properties'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map(item => (
                  <PropertyCard key={item._id} item={item} onRemove={handleRemove} ar={ar} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}