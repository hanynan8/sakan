// path: app/properties/page.jsx
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import PropertyCard from '@/app/components/PropertyCard';
import PropertyFilters from '@/app/components/PropertyFilters';
import { INITIAL_FILTERS, filtersToParams, filtersFromSearchParams } from '@/lib/property-filters';

function PropertiesContent() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState(() => filtersFromSearchParams(searchParams));

  // لما التاب في النافبار يتغير (نفس الصفحة بس الـ query مختلف) نزامن الفلتر مع الرابط
  const furnishedParam = searchParams.get('furnished') || '';
  useEffect(() => {
    setFilters((f) => (f.furnished === furnishedParam ? f : { ...f, furnished: furnishedParam }));
  }, [furnishedParam]);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/properties?${filtersToParams(filters).toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');

      let list = Array.isArray(data) ? data : [];
      // فلترة نصية بسيطة على العنوان/العنوان الفرعي (client-side)
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
    const qs = filtersToParams(filters, { includeQ: true }).toString();
    router.push(qs ? `/properties?${qs}` : '/properties');
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    router.push('/properties');
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16" dir={ar ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-brand text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-black">{ar ? 'دور على سكنك في أسوان' : 'Find your housing in Aswan'}</h1>
          <p className="text-white/90 mt-1 text-sm">
            {ar ? 'فلتر حسب الكلية القريبة أو منطقة المدينة.' : 'Filter by nearby college or city area.'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* فلاتر */}
        <form onSubmit={applyFilters} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 space-y-2.5">
          <input
            type="text"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder={ar ? 'ابحث بالاسم أو العنوان...' : 'Search by title or address...'}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-brand"
          />

          <PropertyFilters
            filters={filters}
            setFilters={setFilters}
            ar={ar}
            actions={
              <>
                <button type="submit" className="flex-1 sm:flex-none sm:px-10 py-2.5 bg-brand text-white text-sm font-semibold rounded hover:bg-brand-dark hover:text-white transition-all">
                  {ar ? 'بحث' : 'Search'}
                </button>
                <button type="button" onClick={resetFilters} className="px-4 py-2.5 border border-gray-300 text-sm font-medium rounded text-gray-600 hover:border-gray-500 transition-all">
                  {ar ? 'مسح' : 'Clear'}
                </button>
              </>
            }
          />
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

export default function PropertiesPage() {
  return (
    <Suspense fallback={null}>
      <PropertiesContent />
    </Suspense>
  );
}