// path: lib/property-filters.js
// حالة الفلاتر المشتركة بين صفحة /properties وسكشن الهوم: القيم الابتدائية + التحويل من/إلى الـ query string.
// قواعد الفلتر:
//  - الحرم الجامعي والنوع اتشالوا.
//  - لو فيه منطقة، فلتر الكلية بيتلغي (المنطقة هي اللي بتحدد النتايج).

export const INITIAL_FILTERS = {
  q: '',
  area: '',
  college: '',
  gender: '',
  bedrooms: '',
  furnished: '',
  minPrice: '',
  maxPrice: '',
  // فلاتر تفصيلية (بتظهر بزرار "فلاتر أخرى")
  floor: '',
  beds: '',
  utilities: '',
  sort: '',
};

// الفلاتر اللي جوه "فلاتر أخرى"
export const EXTRA_FILTER_KEYS = ['floor', 'beds', 'utilities', 'sort'];

// الفلاتر اللي بتتبعت للـ API (q بتتفلتر في الواجهة)
const API_KEYS = ['area', 'college', 'gender', 'bedrooms', 'furnished', 'minPrice', 'maxPrice', 'floor', 'beds', 'utilities', 'sort'];

/** URLSearchParams للـ API / الرابط. بتتجاهل الكلية لو فيه منطقة. */
export function filtersToParams(filters, { includeQ = false } = {}) {
  const params = new URLSearchParams();
  const keys = includeQ ? ['q', ...API_KEYS] : API_KEYS;
  for (const k of keys) {
    if (!filters[k]) continue;
    if (k === 'college' && filters.area) continue;
    params.set(k, filters[k]);
  }
  return params;
}

/** حالة الفلاتر من searchParams بتاعة الرابط. */
export function filtersFromSearchParams(sp) {
  const f = { ...INITIAL_FILTERS };
  for (const k of Object.keys(INITIAL_FILTERS)) f[k] = sp.get(k) || '';
  if (f.area) f.college = '';
  return f;
}
