// path: app/signup/page.jsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';

function SignUpForm() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/profile';

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    contactType: 'email', // 'email' | 'phone'
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student', // 'student' | 'owner'
    referralCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // ── هات كود الإحالة المحفوظ من النافبار (لو المستخدم دخل بلينك ?ref=) ──
  useEffect(() => {
    try {
      const savedRef = localStorage.getItem('referralCode');
      const expiry = Number(localStorage.getItem('referralExpiry') || 0);
      if (savedRef && Date.now() < expiry) {
        setForm((f) => ({ ...f, referralCode: savedRef }));
      }
    } catch {
      // localStorage غير متاح
    }
  }, []);

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
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      setError(
        ar
          ? 'كلمة المرور لازم تكون 8 حروف على الأقل، وتحتوي على حرف كبير ورقم'
          : 'Password must be 8+ characters with an uppercase letter and a number'
      );
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
          role: form.role,
          referralCode: form.referralCode.trim() || undefined,
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

      try {
        localStorage.removeItem('referralCode');
        localStorage.removeItem('referralExpiry');
      } catch {
        // ignore
      }

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
      {/* ── لوحة البراندنج ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800" />
        <div className="relative z-10">
          <Link href="/" className="text-2xl font-black tracking-tight">
            {ar ? 'سكني' : 'Sakani'}
          </Link>
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-4xl font-black leading-tight">
            {ar ? 'اختر سكنك في أسوان بكل سهولة.' : 'Choose your home in Aswan with ease.'}
          </h2>
          <p className="text-gray-300 text-lg">
            {ar
              ? 'طالب بتدور على سكن، ولا مالك عندك عقار؟ سكني ليك.'
              : 'A student looking for housing, or an owner listing a place? Sakani is for you.'}
          </p>
        </div>
        <div className="relative z-10 text-sm text-gray-400">
          {ar ? '© سكني — منصة السكن الطلابي في أسوان' : '© Sakani — Student housing platform in Aswan'}
        </div>
      </div>

      {/* ── الفورم ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-white overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          <Link href="/" className="lg:hidden block text-center text-2xl font-black mb-6">
            {ar ? 'سكني' : 'Sakani'}
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {ar ? 'إنشاء حساب جديد' : 'Create an account'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {ar ? 'اعمل حساب وابدأ رحلتك مع سكني.' : 'Sign up and start your journey with Sakani.'}
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
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-gray-50 text-black focus:outline-none focus:border-gray-800 focus:bg-white transition-all rounded"
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
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-gray-50 text-black focus:outline-none focus:border-gray-800 focus:bg-white transition-all rounded"
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
                    className={`px-2.5 py-1 rounded border ${form.contactType === 'email' ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600'}`}
                  >
                    {ar ? 'إيميل' : 'Email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, contactType: 'phone' })}
                    className={`px-2.5 py-1 rounded border ${form.contactType === 'phone' ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600'}`}
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
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-gray-50 text-black placeholder-gray-400 focus:outline-none focus:border-gray-800 focus:bg-white transition-all rounded"
                />
              ) : (
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="010xxxxxxxx"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-gray-50 text-black placeholder-gray-400 focus:outline-none focus:border-gray-800 focus:bg-white transition-all rounded"
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
                  placeholder={ar ? '8 أحرف على الأقل، حرف كبير ورقم' : 'At least 8 chars, 1 uppercase, 1 number'}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-gray-50 text-black placeholder-gray-400 focus:outline-none focus:border-gray-800 focus:bg-white transition-all rounded"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 right-2.5 flex items-center text-gray-400 hover:text-gray-700"
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
                className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-gray-50 text-black focus:outline-none focus:border-gray-800 focus:bg-white transition-all rounded"
              />
            </div>

            {/* طالب ولا مالك */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {ar ? 'أنت طالب ولا مالك سكن؟' : 'Are you a student or an owner?'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'student' })}
                  className={`px-3 py-2.5 text-sm rounded border font-medium transition-all ${form.role === 'student' ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}
                >
                  {ar ? '🎓 طالب بدور على سكن' : '🎓 Student looking for housing'}
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'owner' })}
                  className={`px-3 py-2.5 text-sm rounded border font-medium transition-all ${form.role === 'owner' ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}
                >
                  {ar ? '🏠 مالك عندي سكن أعرضه' : '🏠 Owner listing a property'}
                </button>
              </div>
            </div>

            {/* كود الإحالة (اختياري) */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {ar ? 'كود الإحالة (اختياري)' : 'Referral code (optional)'}
              </label>
              <input
                type="text"
                value={form.referralCode}
                onChange={update('referralCode')}
                placeholder={ar ? 'مثال: MOHAMEDX4F2' : 'e.g. MOHAMEDX4F2'}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-gray-50 text-black placeholder-gray-400 focus:outline-none focus:border-gray-800 focus:bg-white transition-all rounded uppercase"
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
              className="w-full py-2.5 bg-black text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all rounded"
            >
              {loading ? (ar ? 'جارٍ الإنشاء...' : 'Creating...') : (ar ? 'إنشاء حساب' : 'Sign Up')}
            </button>

            <p className="text-center text-xs text-gray-500">
              {ar ? 'عندك حساب بالفعل؟' : 'Already have an account?'}{' '}
              <Link href="/signin" className="font-semibold text-black underline underline-offset-2">
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