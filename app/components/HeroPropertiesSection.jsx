// path: app/components/HeroPropertiesSection.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { CAMPUSES, COLLEGES, AREAS, collegesByCampus } from '@/lib/taxonomy';

/* ═══════════════════════════════════════════════
   هيرو + فلاتر + نتائج السكنات في سكشن واحد عملي.
   الفكرة: اللي داخل الموقع يلاقي البحث قدامه على طول من غير
   سكرول ومن غير صور زخرفية - بحث كبير واضح، شيبس سريعة
   لأشهر المناطق، وفلاتر متقدمة تتفتح لو محتاجها بس.
═══════════════════════════════════════════════ */

const TYPES = [
  { id: 'apartment', ar: 'شقة', en: 'Apartment' },
  { id: 'room', ar: 'غرفة', en: 'Room' },
  { id: 'shared-room', ar: 'غرفة مشتركة', en: 'Shared room' },
  { id: 'studio', ar: 'استوديو', en: 'Studio' },
];

// أشهر مناطق أسوان للشيبس السريعة (subset مختصر عشان الصف يفضل مريح)
const QUICK_AREAS = ['new-aswan', 'sail', 'wost-elbalad', 'abu-elrish', 'corniche', 'sadaqa'];

// أشهر كليات جامعة أسوان للشيبس السريعة
const QUICK_COLLEGES = ['medicine', 'engineering', 'commerce', 'science', 'arts', 'law'];

const TEXT = {
  ar: {
    heading: 'دور على سكنك في أسوان',
    subheading: 'ابحث، فلتر، واحجز سكن قريب من كليتك في ثواني',
    searchPlaceholder: 'ابحث بالاسم، العنوان، أو المنطقة...',
    search: 'بحث',
    quickAreasLabel: 'مناطق شائعة:',
    quickCollegesLabel: 'كليات شائعة:',
    allCampuses: 'كل الحرم الجامعي',
    allColleges: 'كل الكليات',
    allAreas: 'كل مناطق أسوان',
    allTypes: 'كل الأنواع',
    minPrice: 'أقل سعر',
    maxPrice: 'أعلى سعر',
    apply: 'تطبيق الفلاتر',
    clear: 'مسح الكل',
    loadError: 'حصل خطأ أثناء تحميل السكنات',
    noResultsTitle: 'مفيش سكنات مطابقة',
    noResultsSubtitle: 'جرب تغيّر الفلاتر أو امسحها وابدأ تاني',
    resultsCount: (n) => `${n} سكن متاح`,
    viewAll: 'عرض كل السكنات',
    bedrooms: 'غرف',
    capacity: 'سعة',
    perMonth: 'ج.م/شهر',
  },
  en: {
    heading: 'Find your housing in Aswan',
    subheading: 'Search, filter, and book housing near your college in seconds',
    searchPlaceholder: 'Search by title, address, or area...',
    search: 'Search',
    quickAreasLabel: 'Popular areas:',
    quickCollegesLabel: 'Popular colleges:',
    allCampuses: 'All campuses',
    allColleges: 'All colleges',
    allAreas: 'All Aswan areas',
    allTypes: 'All types',
    minPrice: 'Min price',
    maxPrice: 'Max price',
    apply: 'Apply filters',
    clear: 'Clear all',
    loadError: 'Failed to load properties',
    noResultsTitle: 'No matching properties',
    noResultsSubtitle: 'Try adjusting your filters or clear them and start over',
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

  const toggleQuickArea = (areaId) => {
    setFilters((f) => ({ ...f, area: f.area === areaId ? '' : areaId }));
  };

  const toggleQuickCollege = (collegeId) => {
    setFilters((f) => ({ ...f, college: f.college === collegeId ? '' : collegeId }));
  };

  const availableColleges = filters.campus ? collegesByCampus(filters.campus) : COLLEGES;

  return (
    <section className="bg-black" dir={ar ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        {/* عنوان مختصر - من غير صور زخرفية */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{t.heading}</h1>
          <p className="text-base md:text-lg text-gray-300 font-medium">{t.subheading}</p>
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
                className={`w-full py-3.5 text-base border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:border-black transition-all ${ar ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'}`}
              />
            </div>
            <button
              type="submit"
              className="px-6 sm:px-8 py-3.5 bg-black text-white text-base font-bold rounded-lg hover:bg-gray-800 transition-all whitespace-nowrap"
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
              const active = filters.college === collegeId;
              return (
                <button
                  key={collegeId}
                  type="button"
                  onClick={() => toggleQuickCollege(collegeId)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full border transition-all ${
                    active
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-black hover:text-black'
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
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-black hover:text-black'
                  }`}
                >
                  {ar ? area.ar : area.en}
                </button>
              );
            })}
          </div>

          {/* فلاتر متقدمة - ظاهرة دايماً */}
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              <select
                value={filters.campus}
                onChange={(e) => setFilters({ ...filters, campus: e.target.value, college: '' })}
                className="px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
              >
                <option value="">{t.allCampuses}</option>
                {CAMPUSES.map((c) => (
                  <option key={c.id} value={c.id}>{ar ? c.ar : c.en}</option>
                ))}
              </select>

              <select
                value={filters.college}
                onChange={(e) => setFilters({ ...filters, college: e.target.value })}
                className="px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
              >
                <option value="">{t.allColleges}</option>
                {availableColleges.map((c) => (
                  <option key={c.id} value={c.id}>{ar ? c.ar : c.en}</option>
                ))}
              </select>

              <select
                value={filters.area}
                onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                className="px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
              >
                <option value="">{t.allAreas}</option>
                {AREAS.map((a) => (
                  <option key={a.id} value={a.id}>{ar ? a.ar : a.en}</option>
                ))}
              </select>

              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
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
                className="px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
              />
              <input
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                placeholder={t.maxPrice}
                className="px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
              />

              <div className="col-span-2 flex gap-2">
                <button type="submit" className="flex-1 py-2.5 bg-black text-white text-sm font-semibold rounded hover:bg-gray-800 transition-all">
                  {t.apply}
                </button>
                <button type="button" onClick={resetFilters} className="px-4 py-2.5 border border-gray-300 text-sm font-medium rounded text-gray-600 hover:border-gray-500 transition-all">
                  {t.clear}
                </button>
              </div>
          </div>
        </form>
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
                  <PropertyCard key={p._id} property={p} ar={ar} t={t} />
                ))}
              </div>
              <div className="text-center mt-10">
                <Link
                  href="/properties"
                  className="inline-block px-10 py-3 bg-black text-white font-bold hover:bg-gray-800 transition-all rounded-lg"
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
        <span className="absolute top-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
          {property.price} {t.perMonth}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 truncate">{property.title}</h3>
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