// path: app/components/AdminPropertyEditor.jsx
// فورم تعديل كامل لأي سكن (للأدمن بس): كل الحقول + الصور + الحالة + نقل الملكية.
'use client';

import { useEffect, useState } from 'react';
import PropertyClassificationFields from '@/app/components/PropertyClassificationFields';
import ImageUploader from '@/app/components/ImageUploader';
import { propertyCollegeIds } from '@/lib/taxonomy';

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-brand';
const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';

export default function AdminPropertyEditor({ propertyId, ownerLabel, ar, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [extraImg, setExtraImg] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/properties/${propertyId}`, { cache: 'no-store' });
        const p = await res.json();
        if (!res.ok) throw new Error(p.message);
        setForm({
          title: p.title || '',
          description: p.description || '',
          price: p.price ?? '',
          gender: p.gender || 'any',
          bedrooms: p.bedrooms ?? 1,
          beds: p.beds ?? '',
          capacity: p.capacity ?? 1,
          floor: p.floor ?? '',
          furnished: !!p.furnished,
          utilitiesIncluded: !!p.utilitiesIncluded,
          area: p.area || '',
          colleges: propertyCollegeIds(p),
          address: p.address || '',
          images: p.images || [],
          amenities: (p.amenities || []).join(', '),
          status: p.status || 'active',
        });
      } catch (e) {
        setError(e.message || 'Error');
      }
    })();
  }, [propertyId]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addImageUrl = () => {
    const u = extraImg.trim();
    if (!/^https:\/\//.test(u)) return setError(ar ? 'الرابط لازم يبدأ بـ https://' : 'URL must start with https://');
    setError('');
    set('images', [...form.images, u]);
    setExtraImg('');
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        gender: form.gender,
        bedrooms: Number(form.bedrooms),
        beds: form.beds === '' ? null : Number(form.beds),
        capacity: Number(form.capacity),
        floor: form.floor === '' ? null : Number(form.floor),
        furnished: !!form.furnished,
        utilitiesIncluded: !!form.utilitiesIncluded,
        area: form.area,
        colleges: form.colleges,
        address: form.address.trim(),
        images: form.images,
        amenities: form.amenities.split(',').map((s) => s.trim()).filter(Boolean),
        status: form.status,
      };
      if (ownerContact.trim()) body.ownerContact = ownerContact.trim();
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Error');
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-2xl my-6 p-5" onClick={(e) => e.stopPropagation()} dir={ar ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy">{ar ? 'تعديل السكن' : 'Edit property'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none" aria-label="close">×</button>
        </div>

        {!form ? (
          <p className="text-sm text-gray-400 py-10 text-center">{error || (ar ? 'جارٍ التحميل...' : 'Loading...')}</p>
        ) : (
          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className={labelCls}>{ar ? 'العنوان' : 'Title'}</label>
              <input className={inputCls} value={form.title} maxLength={120} onChange={(e) => set('title', e.target.value)} required />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{ar ? 'الوصف' : 'Description'}</label>
              <textarea className={inputCls} rows={3} maxLength={3000} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>{ar ? 'السعر شهريًا (ج.م)' : 'Monthly price (EGP)'}</label>
              <input className={inputCls} type="number" min={1} max={1000000} value={form.price} onChange={(e) => set('price', e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>{ar ? 'عدد الغرف' : 'Bedrooms'}</label>
              <input className={inputCls} type="number" min={0} max={50} value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>{ar ? 'السعة' : 'Capacity'}</label>
              <input className={inputCls} type="number" min={1} max={100} value={form.capacity} onChange={(e) => set('capacity', e.target.value)} />
            </div>
            <PropertyClassificationFields
              form={form}
              onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
              ar={ar}
              inputCls={inputCls}
              labelCls={labelCls}
            />
            <div className="sm:col-span-2">
              <label className={labelCls}>{ar ? 'العنوان التفصيلي' : 'Address'}</label>
              <input className={inputCls} value={form.address} maxLength={200} onChange={(e) => set('address', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{ar ? 'المميزات (مفصولة بفاصلة)' : 'Amenities (comma separated)'}</label>
              <input className={inputCls} value={form.amenities} onChange={(e) => set('amenities', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{ar ? 'الصور' : 'Photos'}</label>
              <ImageUploader ar={ar} value={form.images} onChange={(arr) => set('images', arr)} />
              <div className="flex gap-2 mt-2">
                <input className={inputCls} dir="ltr" placeholder={ar ? 'أو ضيف رابط صورة https://...' : 'Or add an image URL https://...'} value={extraImg} onChange={(e) => setExtraImg(e.target.value)} />
                <button type="button" onClick={addImageUrl} className="px-3 text-sm font-semibold border border-gray-300 rounded hover:border-gray-500">{ar ? 'إضافة' : 'Add'}</button>
              </div>
            </div>
            <div>
              <label className={labelCls}>{ar ? 'الحالة' : 'Status'}</label>
              <select className={inputCls} value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="pending">{ar ? 'مستني موافقة' : 'Pending'}</option>
                <option value="active">{ar ? 'متاح' : 'Active'}</option>
                <option value="rented">{ar ? 'مؤجر' : 'Rented'}</option>
                <option value="hidden">{ar ? 'مخفي' : 'Hidden'}</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>{ar ? 'نقل الملكية (إيميل/تليفون المالك الجديد)' : 'Transfer owner (new owner email/phone)'}</label>
              <input className={inputCls} dir="ltr" value={ownerContact} onChange={(e) => setOwnerContact(e.target.value)} placeholder={ownerLabel || ''} />
              <p className="text-xs text-gray-400 mt-1">{ar ? 'سيبه فاضي لو مش عايز تغيّر المالك' : 'Leave empty to keep the current owner'}</p>
            </div>

            {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
            <div className="sm:col-span-2 flex gap-2 mt-1">
              <button disabled={saving} className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded disabled:opacity-60">
                {saving ? (ar ? 'جارٍ الحفظ...' : 'Saving...') : (ar ? 'حفظ التعديلات' : 'Save changes')}
              </button>
              <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded">{ar ? 'إلغاء' : 'Cancel'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
