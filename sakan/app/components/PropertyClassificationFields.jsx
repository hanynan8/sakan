// path: app/components/PropertyClassificationFields.jsx
// حقول التصنيف المشتركة بين فورم المالك وفورم الأدمن، وهي نفس الحقول بنفس القيم اللي في فلاتر /properties:
// النوع، التأثيث، الحرم الجامعي، الكلية، منطقة أسوان.
// الحرم والكلية مربوطين ببعض: اختيار حرم بيحصر الكليات فيه، واختيار كلية بيحدد الحرم بتاعها تلقائيًا.
'use client';

import { CAMPUSES, COLLEGES, AREAS, PROPERTY_TYPE_OPTIONS, FURNISHED_OPTIONS, collegesByCampus, getCollegeById } from '@/lib/taxonomy';

/**
 * @param {object} props
 * @param {{type:string, furnished:boolean, campus:string, college:string, area:string}} props.form
 * @param {(patch: object) => void} props.onChange  بيتبعتله الحقول اللي اتغيّرت بس
 * @param {boolean} props.ar
 * @param {string} props.inputCls
 * @param {string} props.labelCls
 * @param {boolean} [props.wideArea]  المنطقة تاخد عرض الصف كله
 */
export default function PropertyClassificationFields({ form, onChange, ar, inputCls, labelCls, wideArea = false }) {
  const availableColleges = form.campus ? collegesByCampus(form.campus) : COLLEGES;

  const changeCampus = (campus) => {
    const keepCollege = form.college && (!campus || getCollegeById(form.college)?.campus === campus);
    onChange({ campus, college: keepCollege ? form.college : '' });
  };

  const changeCollege = (college) => {
    const c = getCollegeById(college);
    onChange({ college, campus: c ? c.campus : form.campus });
  };

  return (
    <>
      <div>
        <label className={labelCls}>{ar ? 'النوع' : 'Type'}</label>
        <select className={inputCls} value={form.type} onChange={(e) => onChange({ type: e.target.value })}>
          {PROPERTY_TYPE_OPTIONS.map((t) => <option key={t.id} value={t.id}>{ar ? t.ar : t.en}</option>)}
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
        <label className={labelCls}>{ar ? 'الحرم الجامعي القريب (اختياري)' : 'Nearby campus (optional)'}</label>
        <select className={inputCls} value={form.campus} onChange={(e) => changeCampus(e.target.value)}>
          <option value="">{ar ? '— بدون —' : '— None —'}</option>
          {CAMPUSES.map((c) => <option key={c.id} value={c.id}>{ar ? c.ar : c.en}</option>)}
        </select>
      </div>

      <div>
        <label className={labelCls}>{ar ? 'أقرب كلية (اختياري)' : 'Nearest college (optional)'}</label>
        <select className={inputCls} value={form.college} onChange={(e) => changeCollege(e.target.value)}>
          <option value="">{ar ? '— بدون —' : '— None —'}</option>
          {availableColleges.map((c) => <option key={c.id} value={c.id}>{ar ? c.ar : c.en}</option>)}
        </select>
      </div>

      <div className={wideArea ? 'sm:col-span-2' : ''}>
        <label className={labelCls}>{ar ? 'منطقة أسوان' : 'Aswan area'}</label>
        <select className={inputCls} value={form.area} onChange={(e) => onChange({ area: e.target.value })} required>
          <option value="">{ar ? 'اختر منطقة' : 'Select an area'}</option>
          {AREAS.map((a) => <option key={a.id} value={a.id}>{ar ? a.ar : a.en}</option>)}
        </select>
      </div>
    </>
  );
}
