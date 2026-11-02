// path: app/components/BookingRequest.jsx
// فورم "اطلب حجز" في صفحة تفاصيل السكن. الأدمن بيتابع الطلبات من لوحة الإدارة.
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-brand';

export default function BookingRequest({ propertyId, ar }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ phone: session?.user?.phone || '', moveInDate: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  if (status === 'loading') return null;

  if (!session) {
    const back = typeof window !== 'undefined' ? window.location.pathname : '/properties';
    return (
      <Link
        href={`/signin?callbackUrl=${encodeURIComponent(back)}`}
        className="flex items-center justify-center w-full py-3 mb-3 bg-brand hover:bg-brand-dark text-white font-semibold rounded-lg transition-colors"
      >
        {ar ? 'سجّل دخول لطلب الحجز' : 'Sign in to request a booking'}
      </Link>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setNotice(null);
    setBusy(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, ...form, moveInDate: form.moveInDate || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Error');
      setNotice({ type: 'ok', text: ar ? 'تم إرسال طلب الحجز. هنتواصل معاك قريب. تابعه من الملف الشخصي.' : 'Booking request sent. We will contact you soon. Track it from your profile.' });
      setOpen(false);
    } catch (err) {
      setNotice({ type: 'err', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-3">
      {notice && (
        <p className={`text-sm mb-2 px-3 py-2 rounded ${notice.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {notice.text}{' '}
          {notice.type === 'ok' && <Link href="/profile/booking" className="underline font-semibold">{ar ? 'طلباتي' : 'My bookings'}</Link>}
        </p>
      )}
      {!open ? (
        <button onClick={() => setOpen(true)} className="w-full py-3 bg-brand hover:bg-brand-dark text-white font-semibold rounded-lg transition-colors">
          {ar ? 'اطلب حجز' : 'Request booking'}
        </button>
      ) : (
        <form onSubmit={submit} className="space-y-2">
          <input className={inputCls} dir="ltr" inputMode="tel" required placeholder={ar ? 'رقم الواتساب' : 'WhatsApp number'} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className={inputCls} type="date" min={new Date().toISOString().slice(0, 10)} value={form.moveInDate} onChange={(e) => setForm({ ...form, moveInDate: e.target.value })} aria-label={ar ? 'تاريخ السكن' : 'Move-in date'} />
          <textarea className={inputCls} rows={3} maxLength={500} placeholder={ar ? 'ملاحظات (اختياري)' : 'Notes (optional)'} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <div className="flex gap-2">
            <button disabled={busy} className="flex-1 py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-lg disabled:opacity-60">
              {busy ? (ar ? 'جارٍ الإرسال...' : 'Sending...') : (ar ? 'إرسال الطلب' : 'Send request')}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-lg">
              {ar ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
