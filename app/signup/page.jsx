// path: app/signup/page.jsx
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { safeCallbackUrl } from '@/lib/safe-redirect';
import AuthBrandPanel from '@/app/components/AuthBrandPanel';

// ملحوظة: globals.css فيه قاعدة عامة على كل input (عرض 400px وpadding كبير)، فبنستخدم ! عشان نتغلب عليها
const inputCls = 'block !w-full !max-w-full !px-3 !py-2.5 text-sm border !border-gray-300 !bg-gray-50 text-navy placeholder-gray-400 focus:outline-none focus:!border-brand focus:!bg-white transition-all rounded';

function SignUpForm() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    contactType: 'email', // 'email' | 'phone'
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError(ar ? 'الاسم الأول والأخير مطلوبين' : 'First and last name are required');
      return;
    }
    const contactValue = form.contactType === 'email' ? form.email.trim() : form.phone.trim();
    if (!contactValue) {
      setError(ar ? 'لازم تدخل بريد إلكتروني أو رقم هاتف' : 'Enter an email or phone number');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(ar ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          password: form.password,
          ...(form.contactType === 'email' ? { email: contactValue.toLowerCase() } : { phone: contactValue }),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || (ar ? 'حدث خطأ أثناء إنشاء الحساب' : 'Something went wrong'));
        setLoading(false);
        return;
      }

      // سجل دخول تلقائي بعد التسجيل
      const result = await signIn('credentials', {
        redirect: false,
        identifier: contactValue,
        password: form.password,
      });

      if (result?.error) {
        router.push('/signin');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError(ar ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred, try again');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir={ar ? 'rtl' : 'ltr'}>
      <AuthBrandPanel ar={ar} />

      {/* ── الفورم ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-white overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          <Link href="/" className="lg:hidden block text-center text-2xl font-black text-brand mb-6">
            {ar ? 'بيتك' : 'betak'}
          </Link>

          <h1 className="text-2xl font-bold text-navy mb-1">
            {ar ? 'إنشاء حساب جديد' : 'Create an account'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {ar ? 'اعمل حساب وابدأ رحلتك مع بيتك.' : 'Sign up and start your journey with betak.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* الاسم */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {ar ? 'الاسم الأول' : 'First Name'}
                </label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={update('firstName')}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {ar ? 'الاسم الأخير' : 'Last Name'}
                </label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={update('lastName')}
                  className={inputCls}
                />
              </div>
            </div>

            {/* نوع التواصل: إيميل / تليفون */}
            <div>
              <div className="flex items-center gap-4 mb-1.5">
                <label className="block text-xs font-semibold text-gray-600">
                  {ar ? 'وسيلة التواصل' : 'Contact method'}
                </label>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, contactType: 'email' })}
                    className={`px-2.5 py-1 rounded border ${form.contactType === 'email' ? 'bg-brand text-white border-brand' : 'border-gray-300 text-gray-600'}`}
                  >
                    {ar ? 'إيميل' : 'Email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, contactType: 'phone' })}
                    className={`px-2.5 py-1 rounded border ${form.contactType === 'phone' ? 'bg-brand text-white border-brand' : 'border-gray-300 text-gray-600'}`}
                  >
                    {ar ? 'هاتف' : 'Phone'}
                  </button>
                </div>
              </div>
              {form.contactType === 'email' ? (
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="example@mail.com"
                  className={inputCls}
                />
              ) : (
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="010xxxxxxxx"
                  className={inputCls}
                />
              )}
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {ar ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={update('password')}
                  placeholder={ar ? 'اكتب أي كلمة مرور' : 'Choose a password'}
                  className={`${inputCls} !pe-14`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 end-2.5 flex items-center text-gray-400 hover:text-gray-700"
                >
                  {showPw ? (ar ? 'إخفاء' : 'Hide') : (ar ? 'عرض' : 'Show')}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {ar ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </label>
              <input
                type={showPw ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
                className={inputCls}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand text-white text-sm font-semibold hover:bg-brand-dark hover:text-white disabled:opacity-60 disabled:cursor-not-allowed transition-all rounded"
            >
              {loading ? (ar ? 'جارٍ الإنشاء...' : 'Creating...') : (ar ? 'إنشاء حساب' : 'Sign Up')}
            </button>

            <p className="text-center text-xs text-gray-500">
              {ar ? 'عندك حساب بالفعل؟' : 'Already have an account?'}{' '}
              <Link href="/signin" className="font-semibold text-navy underline underline-offset-2">
                {ar ? 'تسجيل الدخول' : 'Sign In'}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}