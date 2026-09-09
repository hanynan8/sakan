// path: app/properties/page.jsx
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { CAMPUSES, COLLEGES, AREAS, collegesByCampus } from '@/lib/taxonomy';

const TYPES = [
  { id: 'apartment', ar: 'شقة', en: 'Apartment' },
  { id: 'room', ar: 'غرفة', en: 'Room' },
  { id: 'shared-room', ar: 'غرفة مشتركة', en: 'Shared room' },
  { id: 'studio', ar: 'استوديو', en: 'Studio' },
];

function PropertiesContent() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    area: searchParams.get('area') || '',
    campus: searchParams.get('campus') || '',
    college: searchParams.get('college') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

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
      // فلترة نصية بسيطة على العنوان/العنوان الفرعي (client-side, مفيش عمود نصي كامل في الـ API)
      if (filters.q.trim()) {
        const q = filters.q.trim().toLowerCase();
        list = list.filter(
          (p) => p.title?.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q)
        );
      }
      setProperties(list);
    } catch (err) {
      setError(ar ? 'حصل خطأ أثناء تحميل السكنات' : 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, [filters, ar]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const applyFilters = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`/properties?${params.toString()}`);
  };

  const resetFilters = () => {
    setFilters({ q: '', area: '', campus: '', college: '', type: '', minPrice: '', maxPrice: '' });
    router.push('/properties');
  };

  const availableColleges = filters.campus ? collegesByCampus(filters.campus) : COLLEGES;

  return (
    <div className="bg-gray-50 min-h-screen pb-16" dir={ar ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-black text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-black">{ar ? 'دور على سكنك في أسوان' : 'Find your housing in Aswan'}</h1>
          <p className="text-gray-300 mt-1 text-sm">
            {ar ? 'فلتر حسب الكلية أو الحرم الجامعي أو منطقة المدينة.' : 'Filter by college, campus, or city area.'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* فلاتر */}
        <form onSubmit={applyFilters} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder={ar ? 'ابحث بالاسم أو العنوان...' : 'Search by title or address...'}
            className="col-span-1 sm:col-span-2 lg:col-span-4 px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
          />

          <select
            value={filters.campus}
            onChange={(e) => setFilters({ ...filters, campus: e.target.value, college: '' })}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
          >
            <option value="">{ar ? 'كل الحرم الجامعي' : 'All campuses'}</option>
            {CAMPUSES.map((c) => (
              <option key={c.id} value={c.id}>{ar ? c.ar : c.en}</option>
            ))}
          </select>

          <select
            value={filters.college}
            onChange={(e) => setFilters({ ...filters, college: e.target.value })}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
          >
            <option value="">{ar ? 'كل الكليات' : 'All colleges'}</option>
            {availableColleges.map((c) => (
              <option key={c.id} value={c.id}>{ar ? c.ar : c.en}</option>
            ))}
          </select>

          <select
            value={filters.area}
            onChange={(e) => setFilters({ ...filters, area: e.target.value })}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
          >
            <option value="">{ar ? 'كل مناطق أسوان' : 'All Aswan areas'}</option>
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>{ar ? a.ar : a.en}</option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
          >
            <option value="">{ar ? 'كل الأنواع' : 'All types'}</option>
            {TYPES.map((t) => (
              <option key={t.id} value={t.id}>{ar ? t.ar : t.en}</option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            placeholder={ar ? 'أقل سعر' : 'Min price'}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
          />

          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            placeholder={ar ? 'أعلى سعر' : 'Max price'}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
          />

          <div className="flex gap-2 col-span-1 sm:col-span-2 lg:col-span-2">
            <button type="submit" className="flex-1 py-2.5 bg-black text-white text-sm font-semibold rounded hover:bg-gray-800 transition-all">
              {ar ? 'بحث' : 'Search'}
            </button>
            <button type="button" onClick={resetFilters} className="px-4 py-2.5 border border-gray-300 text-sm font-medium rounded text-gray-600 hover:border-gray-500 transition-all">
              {ar ? 'مسح' : 'Clear'}
            </button>
          </div>
        </form>

        {/* النتائج */}
        <div className="mt-6">
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
              <p className="text-lg font-semibold mb-1">{ar ? 'مفيش سكنات مطابقة' : 'No matching properties'}</p>
              <p className="text-sm">{ar ? 'جرب تغيّر الفلاتر' : 'Try adjusting your filters'}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-3">
                {ar ? `${properties.length} سكن متاح` : `${properties.length} properties found`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {properties.map((p) => (
                  <PropertyCard key={p._id} property={p} ar={ar} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PropertyCard({ property, ar }) {
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
        <span className="absolute top-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
          {property.price} {ar ? 'ج.م/شهر' : 'EGP/mo'}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 truncate">{property.title}</h3>
        <p className="text-sm text-gray-500 mt-1 truncate">
          {ar ? area?.ar : area?.en}
          {college ? ` · ${ar ? college.ar : college.en}` : ''}
        </p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span>{property.bedrooms} {ar ? 'غرف' : 'beds'}</span>
          <span>·</span>
          <span>{property.capacity} {ar ? 'سعة' : 'capacity'}</span>
        </div>
      </div>
    </Link>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={null}>
      <PropertiesContent />
    </Suspense>
  );
}