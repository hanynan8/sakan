// path: app/components/PropertyCard.jsx
// كارت السكن المشترك بين /properties وسكشن الهوم (والهيرو).
// بيعرض أهم البيانات من برا من غير ما تدخل الصفحة: السعر، التأثيث، الجنس، الغرف، السراير، الدور،
// السعة، المرافق، المنطقة والعنوان، الكليات القريبة، وأول مميزات.
'use client';

import Link from 'next/link';
import FavoriteButton from '@/app/components/FavoriteButton';
import { AREAS, COLLEGES, GENDER_OPTIONS, propertyCollegeIds } from '@/lib/taxonomy';

// صورة افتراضية للسكنات اللي مالهاش صور
const DEFAULT_IMAGE = '/default-property.svg';

export default function PropertyCard({ property, ar }) {
  const area = AREAS.find((a) => a.id === property.area);
  const colleges = propertyCollegeIds(property)
    .map((id) => COLLEGES.find((c) => c.id === id))
    .filter(Boolean);
  const cover = property.images?.[0] || DEFAULT_IMAGE;
  const gender = GENDER_OPTIONS.find((g) => g.id === (property.gender || 'any'));
  const hasFloor = property.floor !== null && property.floor !== undefined;
  const amenities = (property.amenities || []).slice(0, 3);
  const extraAmenities = Math.max(0, (property.amenities || []).length - amenities.length);

  const collegeLabel = colleges.length
    ? `${ar ? colleges[0].ar : colleges[0].en}${colleges.length > 1 ? ` +${colleges.length - 1}` : ''}`
    : '';

  // أرقام/خصائص أساسية في شبكة ثابتة
  const facts = [
    { k: 'rooms', icon: '🚪', text: `${property.bedrooms} ${ar ? (property.bedrooms === 1 ? 'غرفة' : 'غرف') : property.bedrooms === 1 ? 'room' : 'rooms'}` },
    property.beds ? { k: 'beds', icon: '🛏️', text: `${property.beds} ${ar ? 'سراير' : property.beds === 1 ? 'bed' : 'beds'}` } : null,
    hasFloor ? { k: 'floor', icon: '🏢', text: property.floor === 0 ? (ar ? 'الدور الأرضي' : 'Ground floor') : ar ? `الدور ${property.floor}` : `Floor ${property.floor}` } : null,
    property.capacity ? { k: 'cap', icon: '👥', text: `${property.capacity} ${ar ? (property.capacity === 1 ? 'فرد' : 'أفراد') : property.capacity === 1 ? 'person' : 'people'}` } : null,
  ].filter(Boolean);

  return (
    <Link
      href={`/properties/${property._id}`}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
    >
      <div className="h-44 bg-gray-100 relative overflow-hidden flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={property.title}
          onError={(e) => {
            if (!e.currentTarget.src.endsWith(DEFAULT_IMAGE)) e.currentTarget.src = DEFAULT_IMAGE;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-2 right-2 bg-slate text-white text-xs font-bold px-2 py-1 rounded">
          {property.price} {ar ? 'ج.م/شهر' : 'EGP/mo'}
        </span>
        <FavoriteButton propertyId={property._id} className="absolute top-2 left-2" />
        <div className="absolute bottom-2 right-2 left-2 flex flex-wrap gap-1.5">
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${property.furnished ? 'bg-green-600 text-white' : 'bg-white/90 text-gray-700'}`}>
            {property.furnished ? (ar ? 'مفروشة' : 'Furnished') : ar ? 'غير مفروشة' : 'Unfurnished'}
          </span>
          {gender && gender.id !== 'any' && (
            <span className="bg-white/90 text-gray-700 text-xs font-bold px-2 py-0.5 rounded">{ar ? gender.ar : gender.en}</span>
          )}
          {property.status === 'rented' && (
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded">{ar ? 'مؤجرة' : 'Rented'}</span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-navy truncate">{property.title}</h3>

        <p className="text-sm text-gray-500 truncate">
          📍 {ar ? area?.ar : area?.en}
          {property.address ? ` · ${property.address}` : ''}
        </p>

        {collegeLabel && (
          <p className="text-xs text-gray-500 truncate">🎓 {ar ? 'قريبة من' : 'Near'} {collegeLabel}</p>
        )}

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
          {facts.map((f) => (
            <span key={f.k} className="truncate">{f.icon} {f.text}</span>
          ))}
        </div>

        <p className={`text-xs font-medium ${property.utilitiesIncluded ? 'text-green-700' : 'text-gray-400'}`}>
          {property.utilitiesIncluded
            ? ar ? '✔ شامل مياه وكهرباء وغاز' : '✔ Water, electricity & gas included'
            : ar ? 'المرافق غير شاملة' : 'Utilities not included'}
        </p>

        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
            {amenities.map((a, i) => (
              <span key={i} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
            ))}
            {extraAmenities > 0 && <span className="text-[11px] text-gray-400 px-1 py-0.5">+{extraAmenities}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}
