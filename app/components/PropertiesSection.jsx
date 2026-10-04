// path: app/components/PropertiesSection.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { CAMPUSES, COLLEGES, AREAS, collegesByCampus } from '@/lib/taxonomy';

/* ═══════════════════════════════════════════════
   نفس محتوى صفحة /properties (الفلاتر + الكروت) لكن
   كسكشن جاهز للتضمين جوه صفحة الهوم تحت الهيرو سكشن.
   الفرق الوحيد: مفيش مزامنة مع الـ URL (searchParams/router)
   عشان يفضل الفلتر جوه نفس صفحة الهوم من غير ما ينقل المستخدم.
═══════════════════════════════════════════════ */

const TYPES = [
  { id: 'apartment', ar: 'شقة', en: 'Apartment' },
  { id: 'room', ar: 'غرفة', en: 'Room' },
  { id: 'shared-room', ar: 'غرفة مشتركة', en: 'Shared room' },
  { id: 'studio', ar: 'استوديو', en: 'Studio' },
];

const TEXT = {
  ar: {
    title: 'دور على سكنك في أسوان',
    subtitle: 'فلتر حسب الكلية أو الحرم الجامعي أو منطقة المدينة.',
    searchPlaceholder: 'ابحث بالاسم أو العنوان...',
    allCampuses: 'كل الحرم الجامعي',
    allColleges: 'كل الكليات',
    allAreas: 'كل مناطق أسوان',
    allTypes: 'كل الأنواع',
    minPrice: 'أقل سعر',
    maxPrice: 'أعلى سعر',
    search: 'بحث',
    clear: 'مسح',
    loadError: 'حصل خطأ أثناء تحميل السكنات',
    noResultsTitle: 'مفيش سكنات مطابقة',
    noResultsSubtitle: 'جرب تغيّر الفلاتر',
    resultsCount: (n) => `${n} سكن متاح`,
    viewAll: 'عرض كل السكنات',
    bedrooms: 'غرف',
    capacity: 'سعة',
    perMonth: 'ج.م/شهر',
  },
  en: {
    title: 'Find your housing in Aswan',
    subtitle: 'Filter by college, campus, or city area.',
    searchPlaceholder: 'Search by title or address...',
    allCampuses: 'All campuses',
    allColleges: 'All colleges',
    allAreas: 'All Aswan areas',
    allTypes: 'All types',
    minPrice: 'Min price',
    maxPrice: 'Max price',
    search: 'Search',
    clear: 'Clear',
    loadError: 'Failed to load properties',
    noResultsTitle: 'No matching properties',
    noResultsSubtitle: 'Try adjusting your filters',
    resultsCount: (n) => `${n} properties found`,
    viewAll: 'View all properties',
    bedrooms: 'beds',
    capacity: 'capacity',
    perMonth: 'EGP/mo',
  },
};

const INITIAL_FILTERS = {
  q: '',
  area: '',
  campus: '',
  college: '',
  type: '',
  minPrice: '',
  maxPrice: '',
};

export default function PropertiesSection() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const t = TEXT[ar ? 'ar' : 'en'];

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.area) params.set('area', filters.area);
      if (filters.campus) params.set('campus', filters.campus);
      if (filters.college) params.set('college', filters.college);
      if (filters.type) params.set('type', filters.type);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);

      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');

      let list = Array.isArray(data) ? data : [];
      if (filters.q.trim()) {
        const q = filters.q.trim().toLowerCase();
        list = list.filter(
          (p) => p.title?.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q)
        );
      }
      setProperties(list);
    } catch (err) {
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }, [filters, t.loadError]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const applyFilters = (e) => {
    e?.preventDefault();
    fetchProperties();
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const availableColleges = filters.campus ? collegesByCampus(filters.campus) : COLLEGES;

  return (
    <section className="bg-gray-50 py-16" dir={ar ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-navy mb-3">{t.title}</h2>
          <p className="text-lg text-gray-600 font-medium">{t.subtitle}</p>
        </div>

        {/* فلاتر */}
        <form
          onSubmit={applyFilters}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <input
            type="text"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder={t.searchPlaceholder}
            className="col-span-1 sm:col-span-2 lg:col-span-4 px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-brand"
          />

          <select
            value={filters.campus}
            onChange={(e) => setFilters({ ...filters, campus: e.target.value, college: '' })}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-brand"
          >
            <option value="">{t.allCampuses}</option>
            {CAMPUSES.map((c) => (
              <option key={c.id} value={c.id}>{ar ? c.ar : c.en}</option>
            ))}
          </select>

          <select
            value={filters.college}
            onChange={(e) => setFilters({ ...filters, college: e.target.value })}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-brand"
          >
            <option value="">{t.allColleges}</option>
            {availableColleges.map((c) => (
              <option key={c.id} value={c.id}>{ar ? c.ar : c.en}</option>
            ))}
          </select>

          <select
            value={filters.area}
            onChange={(e) => setFilters({ ...filters, area: e.target.value })}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-brand"
          >
            <option value="">{t.allAreas}</option>
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>{ar ? a.ar : a.en}</option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-brand"
          >
            <option value="">{t.allTypes}</option>
            {TYPES.map((ty) => (
              <option key={ty.id} value={ty.id}>{ar ? ty.ar : ty.en}</option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            placeholder={t.minPrice}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-brand"
          />

          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            placeholder={t.maxPrice}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-brand"
          />

          <div className="flex gap-2 col-span-1 sm:col-span-2 lg:col-span-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-brand text-white text-sm font-semibold rounded hover:bg-brand-dark hover:text-white transition-all"
            >
              {t.search}
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2.5 border border-gray-300 text-sm font-medium rounded text-gray-600 hover:border-gray-500 transition-all"
            >
              {t.clear}
            </button>
          </div>
        </form>

        {/* النتائج */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 h-64 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <p className="text-center text-red-600 py-10 text-sm">{error}</p>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-semibold mb-1">{t.noResultsTitle}</p>
              <p className="text-sm">{t.noResultsSubtitle}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-3">{t.resultsCount(properties.length)}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {properties.slice(0, 6).map((p) => (
                  <PropertyCard key={p._id} property={p} ar={ar} t={t} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/properties"
            className="inline-block px-10 py-3 bg-brand text-white font-bold hover:bg-brand-dark hover:text-white transition-all rounded-lg"
          >
            {t.viewAll}
          </Link>
        </div>
      </div>
    </section>
  );
}

function PropertyCard({ property, ar, t }) {
  const area = AREAS.find((a) => a.id === property.area);
  const college = COLLEGES.find((c) => c.id === property.college);
  const cover = property.images?.[0];

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
        <span className="absolute top-2 right-2 bg-navy text-white text-xs font-bold px-2 py-1 rounded">
          {property.price} {t.perMonth}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-navy truncate">{property.title}</h3>
        <p className="text-sm text-gray-500 mt-1 truncate">
          {ar ? area?.ar : area?.en}
          {college ? ` · ${ar ? college.ar : college.en}` : ''}
        </p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span>{property.bedrooms} {t.bedrooms}</span>
          <span>·</span>
          <span>{property.capacity} {t.capacity}</span>
        </div>
      </div>
    </Link>
  );
}