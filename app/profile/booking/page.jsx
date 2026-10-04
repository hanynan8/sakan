'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

function EmptyIllustration() {
  return (
    <svg viewBox="0 0 220 180" className="w-56 h-44 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="48" r="14" fill="#9BE0F9" opacity="0.7" />
      <path d="M80 38 Q83 35 86 38" stroke="#555" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M88 34 Q91 31 94 34" stroke="#555" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <rect x="65" y="95" width="90" height="60" rx="2" fill="#CDEEFB"/>
      <polygon points="55,97 110,55 165,97" fill="#0077B6"/>
      <rect x="130" y="60" width="10" height="22" fill="#00ADEF"/>
      <circle cx="135" cy="55" r="4" fill="#9BE0F9" opacity="0.5"/>
      <circle cx="138" cy="48" r="3" fill="#9BE0F9" opacity="0.3"/>
      <circle cx="110" cy="82" r="9" fill="white" stroke="#0077B6" strokeWidth="2"/>
      <line x1="110" y1="73" x2="110" y2="91" stroke="#0077B6" strokeWidth="1.5"/>
      <line x1="101" y1="82" x2="119" y2="82" stroke="#0077B6" strokeWidth="1.5"/>
      <rect x="96" y="120" width="28" height="35" rx="14" fill="#00ADEF"/>
      <circle cx="121" cy="137" r="2" fill="white"/>
      <rect x="70" y="105" width="20" height="16" rx="2" fill="white" stroke="#ddd" strokeWidth="1"/>
      <line x1="80" y1="105" x2="80" y2="121" stroke="#ddd" strokeWidth="1"/>
      <line x1="70" y1="113" x2="90" y2="113" stroke="#ddd" strokeWidth="1"/>
      <rect x="130" y="105" width="20" height="16" rx="2" fill="white" stroke="#ddd" strokeWidth="1"/>
      <line x1="140" y1="105" x2="140" y2="121" stroke="#ddd" strokeWidth="1"/>
      <line x1="130" y1="113" x2="150" y2="113" stroke="#ddd" strokeWidth="1"/>
      <rect x="148" y="130" width="7" height="25" rx="1" fill="#00ADEF" opacity="0.7"/>
      <rect x="142" y="145" width="22" height="10" rx="3" fill="#00ADEF"/>
      <rect x="145" y="140" width="16" height="8" rx="2" fill="#7FD6F6"/>
      <circle cx="147" cy="156" r="3" fill="#333"/>
      <circle cx="161" cy="156" r="3" fill="#333"/>
      <line x1="52" y1="155" x2="58" y2="110" stroke="#1B8F65" strokeWidth="2.5"/>
      <path d="M58 110 Q45 100 35 108" stroke="#22C58B" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M58 110 Q50 95 55 85" stroke="#22C58B" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M58 110 Q68 98 72 103" stroke="#22C58B" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <line x1="170" y1="155" x2="166" y2="112" stroke="#1B8F65" strokeWidth="2.5"/>
      <path d="M166 112 Q178 102 188 110" stroke="#22C58B" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M166 112 Q172 97 168 87" stroke="#22C58B" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M166 112 Q155 100 152 105" stroke="#22C58B" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <rect x="40" y="155" width="140" height="4" rx="2" fill="#e8e8e8"/>
    </svg>
  );
}

// ── Booking Card ──
const statusColor = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-600',
};
const statusLabel = {
  confirmed: { en: 'Confirmed', ar: 'مؤكد' },
  pending: { en: 'Pending', ar: 'قيد المراجعة' },
  cancelled: { en: 'Cancelled', ar: 'ملغي' },
};

function BookingCard({ item, ar, onCancel }) {
  const status = item.status || 'pending';
  const p = item.property;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-40 h-36 sm:h-auto bg-gray-100 flex-shrink-0 overflow-hidden">
          {p?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
          ) : null}
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between gap-2">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              {p ? (
                <Link href={`/properties/${p._id}`} className="font-semibold text-navy text-sm hover:underline">{p.title}</Link>
              ) : (
                <span className="font-semibold text-gray-400 text-sm">{ar ? 'السكن لم يعد متاحًا' : 'Listing no longer available'}</span>
              )}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor[status]}`}>
                {ar ? statusLabel[status].ar : statusLabel[status].en}
              </span>
            </div>
            {item.moveInDate && (
              <p className="text-xs text-gray-500">
                {ar ? 'تاريخ السكن:' : 'Move-in:'} <span className="font-medium text-gray-700">{new Date(item.moveInDate).toLocaleDateString()}</span>
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center justify-between">
            {p ? <p className="text-sm font-bold text-navy">{p.price} <span className="text-xs font-normal text-gray-400">{ar ? 'ج.م / شهر' : 'EGP / month'}</span></p> : <span />}
            {status === 'pending' && (
              <button onClick={() => onCancel(item._id)} className="px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-600 rounded hover:bg-red-50">
                {ar ? 'إلغاء الطلب' : 'Cancel'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/bookings', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      setItems(await res.json());
      setError('');
    } catch {
      setError(ar ? 'تعذر تحميل الطلبات' : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [ar]);
  useEffect(() => { load(); }, [load]);

  const cancel = async (id) => {
    if (!confirm(ar ? 'إلغاء طلب الحجز؟' : 'Cancel this booking request?')) return;
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    if (res.ok) load();
    else alert((await res.json().catch(() => ({}))).message || 'Error');
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={ar ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <nav className="flex items-center gap-1.5 text-sm mb-3">
          <Link href="/" className="text-brand-dark hover:text-navy transition-colors font-medium">{ar ? 'الرئيسية' : 'Home'}</Link>
          <span className="text-gray-400">/</span>
          <Link href="/profile" className="text-brand-dark hover:text-navy transition-colors font-medium">{ar ? 'الملف الشخصي' : 'Profile'}</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 font-medium">{ar ? 'الحجوزات' : 'Booking'}</span>
        </nav>

        <h1 className="text-2xl font-bold text-navy mb-6">{ar ? 'الحجوزات' : 'Booking'}</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
          {loading && <p className="text-sm text-gray-400 py-16 text-center">{ar ? 'جارٍ التحميل...' : 'Loading...'}</p>}
          {!loading && error && <p className="text-sm text-red-600 py-16 text-center">{error}</p>}

          {!loading && !error && items.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4">
              <EmptyIllustration />
              <p className="text-gray-500 text-sm mt-4 mb-6">{ar ? 'لا توجد حجوزات متاحة' : 'No booking available'}</p>
              <Link href="/properties" className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-full transition-colors">
                {ar ? 'استكشف العقارات' : 'Explore properties'}
              </Link>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="p-6 space-y-4">
              {items.map((item) => <BookingCard key={item._id} item={item} ar={ar} onCancel={cancel} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
