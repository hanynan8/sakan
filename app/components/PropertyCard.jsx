// path: app/components/PropertyCard.jsx
// كارت السكن المشترك بين /properties وسكشن الهوم.
'use client';

import Link from 'next/link';
import FavoriteButton from '@/app/components/FavoriteButton';
import { AREAS, COLLEGES, GENDER_OPTIONS, propertyCollegeIds } from '@/lib/taxonomy';

export default function PropertyCard({ property, ar }) {
  const area = AREAS.find((a) => a.id === property.area);
  const colleges = propertyCollegeIds(property)
    .map((id) => COLLEGES.find((c) => c.id === id))
    .filter(Boolean);
  const cover = property.images?.[0];
  const gender = GENDER_OPTIONS.find((g) => g.id === (property.gender || 'any'));

  const collegeLabel = colleges.length
    ? `${ar ? colleges[0].ar : colleges[0].en}${colleges.length > 1 ? ` +${colleges.length - 1}` : ''}`
    : '';

  return (
    <Link
      href={`/properties/${property._id}`}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
    >
      <div className="h-40 bg-gray-100 relative overflow-hidden">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </div>
        )}
        <span className="absolute top-2 right-2 bg-slate text-white text-xs font-bold px-2 py-1 rounded">
          {property.price} {ar ? 'ج.م/شهر' : 'EGP/mo'}
        </span>
        <FavoriteButton propertyId={property._id} className="absolute top-2 left-2" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-navy truncate">{property.title}</h3>
        <p className="text-sm text-gray-500 mt-1 truncate">
          {ar ? area?.ar : area?.en}
          {collegeLabel ? ` · ${collegeLabel}` : ''}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs text-gray-400">
          <span>{property.bedrooms} {ar ? 'غرف' : 'rooms'}</span>
          {property.beds ? (
            <>
              <span>·</span>
              <span>{property.beds} {ar ? 'سراير' : 'beds'}</span>
            </>
          ) : null}
          {gender && gender.id !== 'any' ? (
            <>
              <span>·</span>
              <span>{ar ? gender.ar : gender.en}</span>
            </>
          ) : null}
          {property.utilitiesIncluded ? (
            <>
              <span>·</span>
              <span>{ar ? 'شامل المرافق' : 'Utilities incl.'}</span>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
