// path: app/components/PropertyFilters.jsx
// حقول الفلاتر المشتركة بين /properties وسكشن الهوم.
// الأساسي: الكلية، المنطقة، الجنس، عدد الغرف، التأثيث، السعر.
// زرار "فلاتر أخرى" بيفتح: الدور، عدد السراير، شامل مياه/كهربا/غاز، وترتيب النتايج بالسعر.
// لو اتحددت منطقة: فلتر الكلية بيتلغي وبنعرض كليات المنطقة بدله.
'use client';

import { useState } from 'react';
import {
  COLLEGES,
  AREAS,
  GENDER_OPTIONS,
  FURNISHED_OPTIONS,
  UTILITIES_OPTIONS,
  BEDROOM_FILTER_OPTIONS,
  FLOOR_FILTER_OPTIONS,
  BEDS_FILTER_OPTIONS,
  SORT_OPTIONS,
  collegesInArea,
} from '@/lib/taxonomy';
import { EXTRA_FILTER_KEYS } from '@/lib/property-filters';

const selectCls =
  'px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-brand disabled:opacity-50 disabled:cursor-not-allowed';

const TEXT = {
  ar: {
    lblCollege: 'اختار الكلية القريبة',
    lblArea: 'اختار المنطقة',
    lblGender: 'السكن لمين؟',
    lblBedrooms: 'عدد الغرف',
    lblFurnished: 'التأثيث',
    lblMin: 'أقل سعر شهريًا (ج.م)',
    lblMax: 'أعلى سعر شهريًا (ج.م)',
    lblFloor: 'الدور',
    lblBeds: 'عدد السراير في الشقة',
    lblUtilities: 'المرافق (مياه وكهرباء وغاز)',
    lblSort: 'ترتيب النتائج بالسعر',
    allColleges: 'كل الكليات القريبة',
    collegeDisabled: 'الكلية متاحة بدون اختيار منطقة',
    allAreas: 'كل مناطق أسوان',
    allGenders: 'ذكور وإناث',
    allBedrooms: 'أي عدد غرف',
    allFurnished: 'مفروشة وغير مفروشة',
    minPrice: 'أقل سعر',
    maxPrice: 'أعلى سعر',
    more: 'فلاتر أخرى',
    less: 'إخفاء الفلاتر الأخرى',
    allFloors: 'أي دور',
    allBeds: 'أي عدد سراير',
    allUtilities: 'شامل وغير شامل',
    sortLabel: 'ترتيب النتائج',
    areaColleges: 'الكليات في المنطقة دي:',
    areaNoColleges: 'مفيش كليات جامعية في المنطقة دي.',
    collegeCancelled: 'فلتر الكلية بيتلغي لما تختار منطقة.',
  },
  en: {
    lblCollege: 'Choose a nearby college',
    lblArea: 'Choose an area',
    lblGender: 'Housing for',
    lblBedrooms: 'Number of bedrooms',
    lblFurnished: 'Furnishing',
    lblMin: 'Min monthly price (EGP)',
    lblMax: 'Max monthly price (EGP)',
    lblFloor: 'Floor',
    lblBeds: 'Number of beds in the apartment',
    lblUtilities: 'Utilities (water, electricity, gas)',
    lblSort: 'Sort by price',
    allColleges: 'All nearby colleges',
    collegeDisabled: 'College is available when no area is selected',
    allAreas: 'All Aswan areas',
    allGenders: 'Male & female',
    allBedrooms: 'Any bedrooms',
    allFurnished: 'Furnished & unfurnished',
    minPrice: 'Min price',
    maxPrice: 'Max price',
    more: 'More filters',
    less: 'Hide more filters',
    allFloors: 'Any floor',
    allBeds: 'Any number of beds',
    allUtilities: 'Utilities included or not',
    sortLabel: 'Sort results',
    areaColleges: 'Colleges in this area:',
    areaNoColleges: 'No university colleges in this area.',
    collegeCancelled: 'The college filter is cancelled when an area is selected.',
  },
};

/**
 * @param {object} props
 * @param {object} props.filters   حالة الفلاتر (lib/property-filters.js)
 * @param {(updater: (f: object) => object) => void} props.setFilters  setState بتاعة الفلاتر
 * @param {boolean} props.ar
 * @param {React.ReactNode} [props.actions]  أزرار (بحث/مسح) بتتحط في آخر الصف
 */
export default function PropertyFilters({ filters, setFilters, ar, actions = null }) {
  const t = TEXT[ar ? 'ar' : 'en'];
  const activeExtra = EXTRA_FILTER_KEYS.filter((k) => filters[k]).length;
  const [open, setOpen] = useState(activeExtra > 0);

  const set = (patch) => setFilters((f) => ({ ...f, ...patch }));
  // اختيار منطقة بيلغي الكلية
  const changeArea = (area) => set(area ? { area, college: '' } : { area: '' });

  const areaColleges = filters.area ? collegesInArea(filters.area) : [];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 items-end">
        <Field label={t.lblCollege}>
          <select
            value={filters.area ? '' : filters.college}
            onChange={(e) => set({ college: e.target.value })}
            disabled={!!filters.area}
            title={filters.area ? t.collegeDisabled : undefined}
            className={selectCls}
          >
            <option value="">{t.allColleges}</option>
            {COLLEGES.map((c) => (
              <option key={c.id} value={c.id}>{ar ? c.ar : c.en}</option>
            ))}
          </select>
        </Field>

        <Field label={t.lblArea}>
          <select value={filters.area} onChange={(e) => changeArea(e.target.value)} className={selectCls}>
            <option value="">{t.allAreas}</option>
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>{ar ? a.ar : a.en}</option>
            ))}
          </select>
        </Field>

        <Field label={t.lblGender}>
          <select value={filters.gender} onChange={(e) => set({ gender: e.target.value })} className={selectCls}>
            <option value="">{t.allGenders}</option>
            {GENDER_OPTIONS.filter((g) => g.id !== 'any').map((g) => (
              <option key={g.id} value={g.id}>{ar ? g.ar : g.en}</option>
            ))}
          </select>
        </Field>

        <Field label={t.lblBedrooms}>
          <select value={filters.bedrooms} onChange={(e) => set({ bedrooms: e.target.value })} className={selectCls}>
            <option value="">{t.allBedrooms}</option>
            {BEDROOM_FILTER_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{ar ? o.ar : o.en}</option>
            ))}
          </select>
        </Field>

        <Field label={t.lblFurnished}>
          <select value={filters.furnished} onChange={(e) => set({ furnished: e.target.value })} className={selectCls}>
            <option value="">{t.allFurnished}</option>
            {FURNISHED_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{ar ? o.ar : o.en}</option>
            ))}
          </select>
        </Field>

        <Field label={t.lblMin}>
          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) => set({ minPrice: e.target.value })}
            placeholder={t.minPrice}
            className={selectCls}
          />
        </Field>
        <Field label={t.lblMax}>
          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => set({ maxPrice: e.target.value })}
            placeholder={t.maxPrice}
            className={selectCls}
          />
        </Field>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="px-3 py-2.5 text-sm font-medium border border-gray-300 rounded text-gray-700 hover:border-brand hover:text-brand-dark transition-all flex items-center justify-center gap-1.5"
        >
          {open ? t.less : t.more}
          {!open && activeExtra > 0 && (
            <span className="bg-brand text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">{activeExtra}</span>
          )}
        </button>
      </div>

      {/* لو فيه منطقة: الكلية اتلغت ونعرض كليات المنطقة */}
      {filters.area && (
        <p className="mt-2.5 text-xs text-gray-500">
          {areaColleges.length > 0 ? (
            <>
              <span className="font-semibold">{t.areaColleges}</span>{' '}
              {areaColleges.map((c) => (ar ? c.ar : c.en)).join(' · ')}
            </>
          ) : (
            t.areaNoColleges
          )}{' '}
          <span className="text-gray-400">{t.collegeCancelled}</span>
        </p>
      )}

      {/* فلاتر أخرى */}
      {open && (
        <div className="mt-2.5 pt-2.5 border-t border-gray-100 grid grid-cols-2 lg:grid-cols-4 gap-2.5 items-end">
          <Field label={t.lblFloor}>
            <select value={filters.floor} onChange={(e) => set({ floor: e.target.value })} className={selectCls}>
              <option value="">{t.allFloors}</option>
              {FLOOR_FILTER_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{ar ? o.ar : o.en}</option>
              ))}
            </select>
          </Field>

          <Field label={t.lblBeds}>
            <select value={filters.beds} onChange={(e) => set({ beds: e.target.value })} className={selectCls}>
              <option value="">{t.allBeds}</option>
              {BEDS_FILTER_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{ar ? o.ar : o.en}</option>
              ))}
            </select>
          </Field>

          <Field label={t.lblUtilities}>
            <select value={filters.utilities} onChange={(e) => set({ utilities: e.target.value })} className={selectCls}>
              <option value="">{t.allUtilities}</option>
              {UTILITIES_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{ar ? o.ar : o.en}</option>
              ))}
            </select>
          </Field>

          <Field label={t.lblSort}>
            <select value={filters.sort} onChange={(e) => set({ sort: e.target.value })} className={selectCls}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id === 'newest' ? '' : o.id}>{ar ? o.ar : o.en}</option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {actions && <div className="mt-2.5 flex gap-2">{actions}</div>}
    </div>
  );
}

// عنوان صغير فوق كل فلتر بيوضّح المطلوب اختياره
function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 min-w-0">
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      {children}
    </label>
  );
}
