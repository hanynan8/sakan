// path: app/components/PropertiesSection.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import PropertyCard from '@/app/components/PropertyCard';
import PropertyFilters from '@/app/components/PropertyFilters';
import { INITIAL_FILTERS, filtersToParams } from '@/lib/property-filters';

/* ═══════════════════════════════════════════════
   نفس محتوى صفحة /properties (الفلاتر + الكروت) لكن
   كسكشن جاهز للتضمين جوه صفحة الهوم تحت الهيرو سكشن.
   الفرق الوحيد: مفيش مزامنة مع الـ URL (searchParams/router)
   عشان يفضل الفلتر جوه نفس صفحة الهوم من غير ما ينقل المستخدم.
═══════════════════════════════════════════════ */

const TEXT = {
  ar: {
    title: 'دور على سكنك في أسوان',
    subtitle: 'فلتر حسب الكلية القريبة أو منطقة المدينة.',
    searchPlaceholder: 'ابحث بالاسم أو العنوان...',
    search: 'بحث',
    clear: 'مسح',
    loadError: 'حصل خطأ أثناء تحميل السكنات',
    noResultsTitle: 'مفيش سكنات مطابقة',
    noResultsSubtitle: 'جرب تغيّر الفلاتر',
    resultsCount: (n) => `${n} سكن متاح`,
    viewAll: 'عرض كل السكنات',
  },
  en: {
    title: 'Find your housing in Aswan',
    subtitle: 'Filter by nearby college or city area.',
    searchPlaceholder: 'Search by title or address...',
    search: 'Search',
    clear: 'Clear',
    loadError: 'Failed to load properties',
    noResultsTitle: 'No matching properties',
    noResultsSubtitle: 'Try adjusting your filters',
    resultsCount: (n) => `${n} properties found`,
    viewAll: 'View all properties',
  },
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
      const res = await fetch(`/api/properties?${filtersToParams(filters).toString()}`);
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
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 space-y-2.5"
        >
          <input
            type="text"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder={t.searchPlaceholder}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-brand"
          />

          <PropertyFilters
            filters={filters}
            setFilters={setFilters}
            ar={ar}
            actions={
              <>
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
              </>
            }
          />
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
                  <PropertyCard key={p._id} property={p} ar={ar} />
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
