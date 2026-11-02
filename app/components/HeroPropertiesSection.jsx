// path: app/components/HeroPropertiesSection.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import PropertyCard from '@/app/components/PropertyCard';
import PropertyFilters from '@/app/components/PropertyFilters';
import { COLLEGES, AREAS } from '@/lib/taxonomy';
import { INITIAL_FILTERS, filtersToParams } from '@/lib/property-filters';

/* ═══════════════════════════════════════════════
   هيرو + فلاتر + نتائج السكنات في سكشن واحد عملي.
   الفكرة: اللي داخل الموقع يلاقي البحث قدامه على طول من غير
   سكرول ومن غير صور زخرفية - بحث كبير واضح، شيبس سريعة
   لأشهر المناطق، وفلاتر متقدمة تتفتح لو محتاجها بس.
═══════════════════════════════════════════════ */

// صورة خلفية الهيرو
const HERO_IMAGE =
  'https://res.cloudinary.com/di6ctjhjp/image/upload/v1793633683/ChatGPT_Image_Nov_2_2026_05_33_56_PM_xvkhc9.png';

// أشهر مناطق أسوان للشيبس السريعة (subset مختصر عشان الصف يفضل مريح)
const QUICK_AREAS = ['new-aswan', 'sail', 'wost-elbalad', 'abu-elrish', 'corniche', 'sadaqa'];

// أشهر كليات جامعة أسوان للشيبس السريعة
const QUICK_COLLEGES = ['medicine', 'engineering', 'commerce', 'science', 'arts', 'law'];

const TEXT = {
  ar: {
    heading: 'دور على سكنك في أسوان',
    subheading: 'ابحث، فلتر، وتواصل مع سكن قريب من كليتك في ثواني',
    searchPlaceholder: 'ابحث بالاسم، العنوان، أو المنطقة...',
    search: 'بحث',
    quickAreasLabel: 'مناطق شائعة:',
    quickCollegesLabel: 'كليات شائعة:',
    apply: 'تطبيق الفلاتر',
    clear: 'مسح الكل',
    loadError: 'حصل خطأ أثناء تحميل السكنات',
    noResultsTitle: 'مفيش سكنات مطابقة',
    noResultsSubtitle: 'جرب تغيّر الفلاتر أو امسحها وابدأ تاني',
    resultsCount: (n) => `${n} سكن متاح`,
    viewAll: 'عرض كل السكنات',
  },
  en: {
    heading: 'Find your housing in Aswan',
    subheading: 'Search, filter, and book housing near your college in seconds',
    searchPlaceholder: 'Search by title, address, or area...',
    search: 'Search',
    quickAreasLabel: 'Popular areas:',
    quickCollegesLabel: 'Popular colleges:',
    apply: 'Apply filters',
    clear: 'Clear all',
    loadError: 'Failed to load properties',
    noResultsTitle: 'No matching properties',
    noResultsSubtitle: 'Try adjusting your filters or clear them and start over',
    resultsCount: (n) => `${n} properties found`,
    viewAll: 'View all properties',
  },
};

export default function HeroPropertiesSection() {
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

  // اختيار منطقة بيلغي الكلية
  const toggleQuickArea = (areaId) => {
    setFilters((f) => (f.area === areaId ? { ...f, area: '' } : { ...f, area: areaId, college: '' }));
  };

  const toggleQuickCollege = (collegeId) => {
    setFilters((f) => ({ ...f, college: f.college === collegeId ? '' : collegeId }));
  };

  return (
    <section className="bg-brand" dir={ar ? 'rtl' : 'ltr'}>
      {/* منطقة الهيرو: صورة خلفية + طبقة غامقة خفيفة عشان النص والبحث يفضلوا واضحين */}
      <div className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        {/* عنوان مختصر فوق صورة الهيرو */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{t.heading}</h1>
          <p className="text-base md:text-lg text-white/90 font-medium">{t.subheading}</p>
        </div>

        {/* البحث الرئيسي - أول حاجة يشوفها الزائر */}
        <form onSubmit={applyFilters} className="bg-white rounded-xl shadow-2xl p-3 sm:p-4">
          <div className={`flex gap-2 ${ar ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="relative flex-1">
              <svg className={`w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 ${ar ? 'right-3.5' : 'left-3.5'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                placeholder={t.searchPlaceholder}
                className={`w-full py-3.5 text-base border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:border-brand transition-all ${ar ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'}`}
              />
            </div>
            <button
              type="submit"
              className="px-6 sm:px-8 py-3.5 bg-brand text-white text-base font-bold rounded-lg hover:bg-brand-dark hover:text-white transition-all whitespace-nowrap"
            >
              {t.search}
            </button>
          </div>

          {/* شيبس أشهر الكليات - بحث بضغطة واحدة */}
          <div className={`mt-3 flex flex-wrap gap-2 items-center ${ar ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-500 font-semibold">{t.quickCollegesLabel}</span>
            {QUICK_COLLEGES.map((collegeId) => {
              const college = COLLEGES.find((c) => c.id === collegeId);
              if (!college) return null;
              const active = !filters.area && filters.college === collegeId;
              return (
                <button
                  key={collegeId}
                  type="button"
                  disabled={!!filters.area}
                  onClick={() => toggleQuickCollege(collegeId)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    active
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-brand hover:text-brand-dark'
                  }`}
                >
                  {ar ? college.ar : college.en}
                </button>
              );
            })}
          </div>

          {/* شيبس أشهر المناطق - بحث بضغطة واحدة */}
          <div className={`mt-2 flex flex-wrap gap-2 items-center ${ar ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-500 font-semibold">{t.quickAreasLabel}</span>
            {QUICK_AREAS.map((areaId) => {
              const area = AREAS.find((a) => a.id === areaId);
              if (!area) return null;
              const active = filters.area === areaId;
              return (
                <button
                  key={areaId}
                  type="button"
                  onClick={() => toggleQuickArea(areaId)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full border transition-all ${
                    active
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-brand hover:text-brand-dark'
                  }`}
                >
                  {ar ? area.ar : area.en}
                </button>
              );
            })}
          </div>

          {/* الفلاتر - الأساسية ظاهرة دايماً، والتفصيلية بزرار "فلاتر أخرى" */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <PropertyFilters
              filters={filters}
              setFilters={setFilters}
              ar={ar}
              actions={
                <>
                  <button type="submit" className="flex-1 py-2.5 bg-brand text-white text-sm font-semibold rounded hover:bg-brand-dark hover:text-white transition-all">
                    {t.apply}
                  </button>
                  <button type="button" onClick={resetFilters} className="px-4 py-2.5 border border-gray-300 text-sm font-medium rounded text-gray-600 hover:border-gray-500 transition-all">
                    {t.clear}
                  </button>
                </>
              }
            />
          </div>
        </form>
      </div>
      </div>

      {/* النتائج - تظهر على طول تحت البحث من غير سكرول لصور تانية */}
      <div className="bg-gray-50 rounded-t-3xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
              <div className="text-center mt-10">
                <Link
                  href={(() => {
                    const qs = filtersToParams(filters, { includeQ: true }).toString();
                    return qs ? `/properties?${qs}` : '/properties';
                  })()}
                  className="inline-block px-10 py-3 bg-brand text-white font-bold hover:bg-brand-dark hover:text-white transition-all rounded-lg"
                >
                  {t.viewAll}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}