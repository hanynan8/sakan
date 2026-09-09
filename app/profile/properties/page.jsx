// path: app/profile/properties/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { CAMPUSES, COLLEGES, AREAS, collegesByCampus } from '@/lib/taxonomy';

const TYPES = [
  { id: 'apartment', ar: 'شقة', en: 'Apartment' },
  { id: 'room', ar: 'غرفة', en: 'Room' },
  { id: 'shared-room', ar: 'غرفة مشتركة', en: 'Shared room' },
  { id: 'studio', ar: 'استوديو', en: 'Studio' },
];

const emptyForm = {
  title: '',
  description: '',
  price: '',
  type: 'apartment',
  bedrooms: 1,
  capacity: 1,
  campus: '',
  college: '',
  area: '',
  address: '',
  images: '', // كل صورة على سطر
  amenities: '', // مفصولة بفاصلة
};

export default function MyPropertiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language } = useLanguage();
  const ar = language === 'ar';

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const canManage = session?.user?.role === 'owner' || session?.user?.role === 'admin';

  const fetchMine = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/properties?mine=1');
      const data = await res.json();
      if (res.ok) setProperties(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && canManage) fetchMine();
    if (status === 'authenticated' && !canManage) setLoading(false);
  }, [status, canManage, fetchMine]);

  if (status === 'loading') {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">{ar ? 'جارٍ التحميل...' : 'Loading...'}</div>;
  }

  if (status === 'authenticated' && !canManage) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center" dir={ar ? 'rtl' : 'ltr'}>
        <p className="text-lg font-semibold text-gray-700 mb-2">
          {ar ? 'الصفحة دي لأصحاب السكنات بس' : 'This page is for property owners only'}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {ar ? 'لو عندك سكن عايز تعرضه، تواصل مع الدعم عشان يتحول حسابك لمالك.' : 'If you have a property to list, contact support to upgrade your account.'}
        </p>
        <Link href="/profile" className="text-black underline text-sm">{ar ? 'رجوع للملف الشخصي' : 'Back to profile'}</Link>
      </div>
    );
  }

  const availableColleges = form.campus ? collegesByCampus(form.campus) : COLLEGES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.title.trim() || !form.price || !form.area) {
      setFormError(ar ? 'العنوان والسعر والمنطقة مطلوبين' : 'Title, price and area are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          type: form.type,
          bedrooms: Number(form.bedrooms) || 1,
          capacity: Number(form.capacity) || 1,
          area: form.area,
          college: form.college || null,
          campus: form.campus || null,
          address: form.address.trim(),
          images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
          amenities: form.amenities.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || (ar ? 'حدث خطأ' : 'Something went wrong'));
        return;
      }
      setForm(emptyForm);
      setFormOpen(false);
      fetchMine();
    } catch {
      setFormError(ar ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred, try again');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (property) => {
    const newStatus = property.status === 'active' ? 'hidden' : 'active';
    const res = await fetch(`/api/properties/${property._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) fetchMine();
  };

  const deleteProperty = async (id) => {
    if (!confirm(ar ? 'متأكد إنك عايز تحذف السكن ده؟' : 'Are you sure you want to delete this property?')) return;
    const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
    if (res.ok) fetchMine();
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16" dir={ar ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <nav className="flex items-center gap-1.5 text-sm mb-3">
          <Link href="/profile" className="text-gray-500 hover:text-black">{ar ? 'الملف الشخصي' : 'Profile'}</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium">{ar ? 'سكناتي' : 'My Properties'}</span>
        </nav>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{ar ? 'سكناتي' : 'My Properties'}</h1>
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="px-4 py-2 bg-black text-white text-sm font-semibold rounded hover:bg-gray-800 transition-all"
          >
            {formOpen ? (ar ? 'إغلاق النموذج' : 'Close form') : (ar ? '+ إضافة سكن' : '+ Add Property')}
          </button>
        </div>

        {/* فورم إضافة سكن */}
        {formOpen && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{ar ? 'عنوان السكن' : 'Title'}</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={ar ? 'مثال: شقة مفروشة 3 غرف قريبة من الهندسة' : 'e.g. Furnished 3-bedroom apartment near Engineering'}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{ar ? 'السعر شهريًا (ج.م)' : 'Monthly price (EGP)'}</label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{ar ? 'النوع' : 'Type'}</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
                >
                  {TYPES.map((t) => <option key={t.id} value={t.id}>{ar ? t.ar : t.en}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{ar ? 'عدد الغرف' : 'Bedrooms'}</label>
                <input
                  type="number"
                  min="0"
                  value={form.bedrooms}
                  onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{ar ? 'السعة (عدد الأفراد)' : 'Capacity'}</label>
                <input
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{ar ? 'الحرم الجامعي القريب (اختياري)' : 'Nearby campus (optional)'}</label>
                <select
                  value={form.campus}
                  onChange={(e) => setForm({ ...form, campus: e.target.value, college: '' })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
                >
                  <option value="">{ar ? '— بدون —' : '— None —'}</option>
                  {CAMPUSES.map((c) => <option key={c.id} value={c.id}>{ar ? c.ar : c.en}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{ar ? 'أقرب كلية (اختياري)' : 'Nearest college (optional)'}</label>
                <select
                  value={form.college}
                  onChange={(e) => setForm({ ...form, college: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
                >
                  <option value="">{ar ? '— بدون —' : '— None —'}</option>
                  {availableColleges.map((c) => <option key={c.id} value={c.id}>{ar ? c.ar : c.en}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{ar ? 'منطقة أسوان' : 'Aswan area'}</label>
                <select
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
                >
                  <option value="">{ar ? 'اختر منطقة' : 'Select an area'}</option>
                  {AREAS.map((a) => <option key={a.id} value={a.id}>{ar ? a.ar : a.en}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{ar ? 'العنوان التفصيلي (اختياري)' : 'Detailed address (optional)'}</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{ar ? 'الوصف' : 'Description'}</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{ar ? 'روابط الصور (كل رابط في سطر)' : 'Image URLs (one per line)'}</label>
                <textarea
                  rows={2}
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{ar ? 'المميزات (مفصولة بفاصلة)' : 'Amenities (comma separated)'}</label>
                <input
                  type="text"
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                  placeholder={ar ? 'واي فاي، تكييف، مصعد' : 'WiFi, AC, Elevator'}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {formError && (
              <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">{formError}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-black text-white text-sm font-semibold rounded hover:bg-gray-800 disabled:opacity-60 transition-all"
            >
              {submitting ? (ar ? 'جارٍ الحفظ...' : 'Saving...') : (ar ? 'حفظ السكن' : 'Save Property')}
            </button>
          </form>
        )}

        {/* قائمة سكناتي */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-white rounded-xl border border-gray-100 animate-pulse" />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-100">
            <p className="font-semibold mb-1">{ar ? 'لسه مفيش سكنات مضافة' : 'No properties added yet'}</p>
            <p className="text-sm">{ar ? 'دوس على "إضافة سكن" عشان تبدأ' : 'Click "Add Property" to get started'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map((p) => (
              <div key={p._id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/properties/${p._id}`} className="font-semibold text-gray-900 hover:underline">{p.title}</Link>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-700' : p.status === 'hidden' ? 'bg-gray-100 text-gray-500' : 'bg-amber-100 text-amber-700'}`}>
                      {p.status === 'active' ? (ar ? 'متاح' : 'Active') : p.status === 'hidden' ? (ar ? 'مخفي' : 'Hidden') : (ar ? 'مؤجر' : 'Rented')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{p.price} {ar ? 'ج.م/شهر' : 'EGP/mo'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleStatus(p)} className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded hover:border-gray-500 transition-all">
                    {p.status === 'active' ? (ar ? 'إخفاء' : 'Hide') : (ar ? 'إظهار' : 'Show')}
                  </button>
                  <button onClick={() => deleteProperty(p._id)} className="px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-600 rounded hover:bg-red-50 transition-all">
                    {ar ? 'حذف' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}