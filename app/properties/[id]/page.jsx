// path: app/properties/[id]/page.jsx
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { AREAS, COLLEGES, CAMPUSES } from '@/lib/taxonomy';

// رقم واتساب سكني الموحّد لكل الاستفسارات (مفيش أي بيانات عن المالك بتتعرض)
const WHATSAPP_NUMBER = '201213819102';

const TYPE_LABELS = {
  apartment: { ar: 'شقة', en: 'Apartment' },
  room: { ar: 'غرفة', en: 'Room' },
  'shared-room': { ar: 'غرفة مشتركة', en: 'Shared room' },
  studio: { ar: 'استوديو', en: 'Studio' },
};

export default function PropertyDetailsPage({ params }) {
  const { id } = use(params);
  const { language } = useLanguage();
  const ar = language === 'ar';

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/properties/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Not found');
        if (!cancelled) setProperty(data);
      } catch {
        if (!cancelled) setError(ar ? 'السكن غير موجود' : 'Property not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, ar]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-80 bg-gray-100 rounded-xl mb-6" />
        <div className="h-6 w-1/2 bg-gray-100 rounded mb-3" />
        <div className="h-4 w-1/3 bg-gray-100 rounded" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-lg font-semibold text-gray-700 mb-2">{error || (ar ? 'السكن غير موجود' : 'Property not found')}</p>
        <Link href="/properties" className="text-black underline text-sm">{ar ? 'رجوع لكل السكنات' : 'Back to all properties'}</Link>
      </div>
    );
  }

  const area = AREAS.find((a) => a.id === property.area);
  const college = COLLEGES.find((c) => c.id === property.college);
  const campus = CAMPUSES.find((c) => c.id === property.campus);
  const typeLabel = TYPE_LABELS[property.type] || TYPE_LABELS.apartment;
  const images = property.images?.length ? property.images : [];

  const waMessage = encodeURIComponent(
    ar
      ? `أهلاً، أنا مهتم بالسكن "${property.title}" (${typeof window !== 'undefined' ? window.location.href : ''})`
      : `Hi, I'm interested in the property "${property.title}" (${typeof window !== 'undefined' ? window.location.href : ''})`
  );
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

  return (
    <div className="bg-gray-50 min-h-screen pb-16" dir={ar ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-4">
          <Link href="/" className="text-gray-500 hover:text-black">{ar ? 'الرئيسية' : 'Home'}</Link>
          <span className="text-gray-300">/</span>
          <Link href="/properties" className="text-gray-500 hover:text-black">{ar ? 'السكنات' : 'Properties'}</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium truncate">{property.title}</span>
        </nav>

        {/* Gallery */}
        <div className="rounded-xl overflow-hidden bg-gray-100 h-64 sm:h-96 mb-2 flex items-center justify-center">
          {images.length ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images[activeImage]} alt={property.title} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${activeImage === i ? 'border-black' : 'border-transparent'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
          {/* التفاصيل */}
          <div className="lg:col-span-2">
            <span className="inline-block bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded mb-2">
              {ar ? typeLabel.ar : typeLabel.en}
            </span>
            <h1 className="text-2xl font-black text-gray-900">{property.title}</h1>
            <p className="text-gray-500 mt-1">
              {property.address ? `${property.address} · ` : ''}
              {ar ? area?.ar : area?.en}
            </p>

            <div className="flex flex-wrap gap-4 mt-5 py-4 border-y border-gray-200">
              <Stat label={ar ? 'السعر شهريًا' : 'Monthly price'} value={`${property.price} ${ar ? 'ج.م' : 'EGP'}`} />
              <Stat label={ar ? 'الغرف' : 'Bedrooms'} value={property.bedrooms} />
              <Stat label={ar ? 'السعة' : 'Capacity'} value={property.capacity} />
              {college && <Stat label={ar ? 'أقرب كلية' : 'Nearest college'} value={ar ? college.ar : college.en} />}
              {campus && <Stat label={ar ? 'الحرم الجامعي' : 'Campus'} value={ar ? campus.ar : campus.en} />}
            </div>

            {property.description && (
              <div className="mt-5">
                <h2 className="font-bold text-gray-900 mb-2">{ar ? 'الوصف' : 'Description'}</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>
            )}

            {property.amenities?.length > 0 && (
              <div className="mt-5">
                <h2 className="font-bold text-gray-900 mb-2">{ar ? 'المميزات' : 'Amenities'}</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* بوكس التواصل — واتساب فقط، بدون أي بيانات عن المالك */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-20">
              <p className="text-2xl font-black text-gray-900">
                {property.price} <span className="text-sm font-medium text-gray-500">{ar ? 'ج.م / شهر' : 'EGP / month'}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                {ar ? 'للاستفسار أو الحجز، تواصل معنا مباشرة على واتساب.' : 'For inquiries or booking, contact us directly on WhatsApp.'}
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 22h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26C2.167 6.658 6.601 2.223 12.053 2.223c2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994C21.93 17.566 17.497 22 12.05 22" />
                </svg>
                {ar ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
              </a>
              <p className="text-xs text-gray-400 mt-3 text-center">
                {ar ? 'بياناتك آمنة، مفيش أي بيانات عن المالك بتتعرض هنا.' : "Your data is safe — no owner information is shown here."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-bold text-gray-900">{value}</p>
    </div>
  );
}