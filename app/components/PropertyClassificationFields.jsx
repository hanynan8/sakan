// path: app/components/PropertyClassificationFields.jsx
// حقول التصنيف المشتركة بين فورم المالك وفورم الأدمن، وهي نفس الحقول بنفس القيم اللي في فلاتر /properties:
// الجنس، التأثيث، شامل المرافق (مياه/كهربا/غاز)، الدور، عدد السراير، منطقة أسوان، والكليات القريبة (اختيار متعدد).
// أي كلية من الكليات المختارة بيتفلتر بيها يظهر السكن.
'use client';

import {
  COLLEGES,
  AREAS,
  GENDER_OPTIONS,
  FURNISHED_OPTIONS,
  UTILITIES_OPTIONS,
} from '@/lib/taxonomy';

/**
 * @param {object} props
 * @param {{gender:string, furnished:boolean, utilitiesIncluded:boolean, floor:(string|number), beds:(string|number), area:string, colleges:string[]}} props.form
 * @param {(patch: object) => void} props.onChange  بيتبعتله الحقول اللي اتغيّرت بس
 * @param {boolean} props.ar
 * @param {string} props.inputCls
 * @param {string} props.labelCls
 */
export default function PropertyClassificationFields({ form, onChange, ar, inputCls, labelCls }) {
  const selected = new Set(form.colleges || []);

  const toggleCollege = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ colleges: COLLEGES.map((c) => c.id).filter((cid) => next.has(cid)) });
  };

  return (
    <>
      <div>
        <label className={labelCls}>{ar ? 'السكن لمين؟' : 'Housing for'}</label>
        <select className={inputCls} value={form.gender} onChange={(e) => onChange({ gender: e.target.value })}>
          {GENDER_OPTIONS.map((g) => <option key={g.id} value={g.id}>{ar ? g.ar : g.en}</option>)}
        </select>
      </div>

      <div>
        <label className={labelCls}>{ar ? 'التأثيث' : 'Furnishing'}</label>
        <select
          className={inputCls}
          value={form.furnished ? 'yes' : 'no'}
          onChange={(e) => onChange({ furnished: e.target.value === 'yes' })}
        >
          {FURNISHED_OPTIONS.map((o) => <option key={o.id} value={o.id}>{ar ? o.ar : o.en}</option>)}
        </select>
      </div>

      <div>
        <label className={labelCls}>{ar ? 'المرافق (مياه وكهرباء وغاز)' : 'Utilities (water, electricity, gas)'}</label>
        <select
          className={inputCls}
          value={form.utilitiesIncluded ? 'included' : 'excluded'}
          onChange={(e) => onChange({ utilitiesIncluded: e.target.value === 'included' })}
        >
          {UTILITIES_OPTIONS.map((o) => <option key={o.id} value={o.id}>{ar ? o.ar : o.en}</option>)}
        </select>
      </div>

      <div>
        <label className={labelCls}>{ar ? 'الدور (0 = الأرضي)' : 'Floor (0 = ground)'}</label>
        <input
          className={inputCls}
          type="number"
          min={0}
          max={50}
          value={form.floor}
          onChange={(e) => onChange({ floor: e.target.value })}
        />
      </div>

      <div>
        <label className={labelCls}>{ar ? 'عدد السراير في الشقة' : 'Number of beds'}</label>
        <input
          className={inputCls}
          type="number"
          min={1}
          max={100}
          value={form.beds}
          onChange={(e) => onChange({ beds: e.target.value })}
        />
      </div>

      <div>
        <label className={labelCls}>{ar ? 'منطقة أسوان' : 'Aswan area'}</label>
        <select className={inputCls} value={form.area} onChange={(e) => onChange({ area: e.target.value })} required>
          <option value="">{ar ? 'اختر منطقة' : 'Select an area'}</option>
          {AREAS.map((a) => <option key={a.id} value={a.id}>{ar ? a.ar : a.en}</option>)}
        </select>
      </div>

      <fieldset className="sm:col-span-2">
        <legend className={labelCls}>
          {ar ? 'الكليات القريبة من السكن (اختار واحدة أو أكتر)' : 'Colleges near the property (pick one or more)'}
          {selected.size > 0 && <span className="text-gray-400 font-normal"> · {selected.size}</span>}
        </legend>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded bg-gray-50">
          {COLLEGES.map((c) => {
            const on = selected.has(c.id);
            return (
              <label
                key={c.id}
                className={`cursor-pointer select-none px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                  on ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-gray-300 hover:border-brand'
                }`}
              >
                <input type="checkbox" className="sr-only" checked={on} onChange={() => toggleCollege(c.id)} />
                {ar ? c.ar : c.en}
              </label>
            );
          })}
        </div>
      </fieldset>
    </>
  );
}
