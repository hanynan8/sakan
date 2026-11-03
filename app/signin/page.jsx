// path: app/signin/page.jsx
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

function SignInForm() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));

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
      <AuthBrandPanel ar={ar} />

      {/* ── الفورم ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-white overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          <Link href="/" className="lg:hidden block text-center text-2xl font-black text-brand mb-6">
            {ar ? 'سكني' : 'Sakani'}
          </Link>

          <h1 className="text-2xl font-bold text-navy mb-1">
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
                className={inputCls}
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
              {loading ? (ar ? 'جارٍ الدخول...' : 'Signing in...') : (ar ? 'تسجيل الدخول' : 'Sign In')}
            </button>

            <p className="text-center text-xs text-gray-500">
              {ar ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
              <Link href="/signup" className="font-semibold text-navy underline underline-offset-2">
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