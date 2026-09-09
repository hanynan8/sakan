// path: app/signin/page.jsx
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';

function SignInForm() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/profile';

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        identifier: form.identifier,
        password: form.password,
      });
      if (!result || result.error) {
        setError(ar ? 'البريد/الرقم أو كلمة المرور غير صحيحة' : 'Incorrect email/phone or password');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError(ar ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred, try again');
    } finally {
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
            {ar ? 'سكنك الجامعي في أسوان، بضغطة واحدة.' : 'Your student housing in Aswan, one click away.'}
          </h2>
          <p className="text-gray-300 text-lg">
            {ar
              ? 'ابحث عن سكن قريب من كليتك أو منطقتك في ثواني.'
              : 'Find housing close to your college or area in seconds.'}
          </p>
        </div>
        <div className="relative z-10 text-sm text-gray-400">
          {ar ? '© سكني — منصة السكن الطلابي في أسوان' : '© Sakani — Student housing platform in Aswan'}
        </div>
      </div>

      {/* ── الفورم ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden block text-center text-2xl font-black mb-8">
            {ar ? 'سكني' : 'Sakani'}
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {ar ? 'تسجيل الدخول' : 'Sign In'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {ar ? 'أهلاً بيك تاني! دخل بياناتك عشان تكمل.' : 'Welcome back! Enter your details to continue.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {ar ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email or Phone Number'}
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                placeholder={ar ? 'example@mail.com أو 010xxxxxxxx' : 'example@mail.com or 010xxxxxxxx'}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-gray-50 text-black placeholder-gray-400 focus:outline-none focus:border-gray-800 focus:bg-white transition-all rounded"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {ar ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={ar ? 'أدخل كلمة المرور' : 'Enter your password'}
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
              {loading ? (ar ? 'جارٍ الدخول...' : 'Signing in...') : (ar ? 'تسجيل الدخول' : 'Sign In')}
            </button>

            <p className="text-center text-xs text-gray-500">
              {ar ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
              <Link href="/signup" className="font-semibold text-black underline underline-offset-2">
                {ar ? 'إنشاء حساب' : 'Sign Up'}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}