// path: app/profile/settings/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';

const inputCls =
  'w-full px-3 py-2.5 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-brand';
const labelCls = 'block text-xs font-semibold text-gray-600 mb-1.5';

function Notice({ notice }) {
  if (!notice) return null;
  const ok = notice.type === 'ok';
  return (
    <div className={`px-3 py-2 rounded text-xs border ${ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
      {notice.text}
    </div>
  );
}

export default function SettingsPage() {
  const { status, update } = useSession();
  const { language } = useLanguage();
  const ar = language === 'ar';

  const [account, setAccount] = useState(null);
  const [loadError, setLoadError] = useState(false);

  const [names, setNames] = useState({ firstName: '', lastName: '' });
  const [nameNotice, setNameNotice] = useState(null);
  const [savingName, setSavingName] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwNotice, setPwNotice] = useState(null);
  const [savingPw, setSavingPw] = useState(false);

  const [delPw, setDelPw] = useState('');
  const [delNotice, setDelNotice] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    (async () => {
      try {
        const res = await fetch('/api/account', { cache: 'no-store' });
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        setAccount(data);
        setNames({ firstName: data.firstName, lastName: data.lastName });
      } catch {
        setLoadError(true);
      }
    })();
  }, [status]);

  const saveName = async (e) => {
    e.preventDefault();
    setNameNotice(null);
    if (!names.firstName.trim() || !names.lastName.trim()) {
      setNameNotice({ type: 'err', text: ar ? 'الاسم الأول والأخير مطلوبين' : 'First and last name are required' });
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(names),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await update(); // يحدّث الاسم في الجلسة (النافبار)
      setNameNotice({ type: 'ok', text: ar ? 'تم حفظ الاسم' : 'Name saved' });
    } catch (err) {
      setNameNotice({ type: 'err', text: err.message || (ar ? 'حدث خطأ' : 'Something went wrong') });
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwNotice(null);
    if (pw.newPassword !== pw.confirm) {
      setPwNotice({ type: 'err', text: ar ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match' });
      return;
    }
    if (pw.newPassword.length < 8 || !/[A-Z]/.test(pw.newPassword) || !/[0-9]/.test(pw.newPassword)) {
      setPwNotice({
        type: 'err',
        text: ar ? 'كلمة المرور لازم تكون 8 حروف على الأقل، وتحتوي على حرف كبير ورقم' : 'Password must be 8+ characters with an uppercase letter and a number',
      });
      return;
    }
    setSavingPw(true);
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pw.currentPassword, newPassword: pw.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwNotice({ type: 'ok', text: ar ? 'تم تغيير كلمة المرور، سجّل دخول تاني' : 'Password changed, please sign in again' });
      setTimeout(() => signOut({ callbackUrl: '/signin' }), 1200);
    } catch (err) {
      setPwNotice({ type: 'err', text: err.message || (ar ? 'حدث خطأ' : 'Something went wrong') });
    } finally {
      setSavingPw(false);
    }
  };

  const deleteAccount = async (e) => {
    e.preventDefault();
    setDelNotice(null);
    if (!confirm(ar ? 'متأكد؟ هيتحذف حسابك وكل سكناتك نهائيًا.' : 'Are you sure? Your account and all your listings will be permanently deleted.')) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: delPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      setDelNotice({ type: 'err', text: err.message || (ar ? 'حدث خطأ' : 'Something went wrong') });
      setDeleting(false);
    }
  };

  const roleLabel = { student: ar ? 'طالب' : 'Student', owner: ar ? 'مالك سكن' : 'Property owner', admin: ar ? 'مسؤول' : 'Admin' };

  return (
    <div className="bg-gray-50 min-h-screen pb-16" dir={ar ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <nav className="flex items-center gap-1.5 text-sm mb-3">
          <Link href="/profile" className="text-gray-500 hover:text-brand-dark">{ar ? 'الملف الشخصي' : 'Profile'}</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium">{ar ? 'إعدادات الحساب' : 'Account Settings'}</span>
        </nav>
        <h1 className="text-2xl font-bold text-navy mb-5">{ar ? 'إعدادات الحساب' : 'Account Settings'}</h1>

        {loadError && <p className="text-sm text-red-600 mb-4">{ar ? 'تعذر تحميل بيانات الحساب' : 'Could not load account data'}</p>}

        {/* بيانات الحساب */}
        <form onSubmit={saveName} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5 space-y-4">
          <h2 className="font-bold text-navy">{ar ? 'البيانات الشخصية' : 'Personal information'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{ar ? 'الاسم الأول' : 'First name'}</label>
              <input className={inputCls} maxLength={50} value={names.firstName} onChange={(e) => setNames({ ...names, firstName: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>{ar ? 'الاسم الأخير' : 'Last name'}</label>
              <input className={inputCls} maxLength={50} value={names.lastName} onChange={(e) => setNames({ ...names, lastName: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>{ar ? 'البريد / الهاتف' : 'Email / Phone'}</label>
              <input className={`${inputCls} opacity-70`} value={account?.email || account?.phone || ''} disabled readOnly dir="ltr" />
            </div>
            <div>
              <label className={labelCls}>{ar ? 'نوع الحساب' : 'Account type'}</label>
              <input className={`${inputCls} opacity-70`} value={account ? roleLabel[account.role] : ''} disabled readOnly />
            </div>
          </div>
          <Notice notice={nameNotice} />
          <button disabled={savingName} className="px-6 py-2.5 bg-brand text-white text-sm font-semibold rounded hover:bg-brand-dark disabled:opacity-60 transition-all">
            {savingName ? (ar ? 'جارٍ الحفظ...' : 'Saving...') : (ar ? 'حفظ' : 'Save')}
          </button>
        </form>

        {/* تغيير كلمة المرور */}
        <form onSubmit={savePassword} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5 space-y-4">
          <h2 className="font-bold text-navy">{ar ? 'تغيير كلمة المرور' : 'Change password'}</h2>
          <div>
            <label className={labelCls}>{ar ? 'كلمة المرور الحالية' : 'Current password'}</label>
            <input type="password" autoComplete="current-password" className={inputCls} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{ar ? 'كلمة المرور الجديدة' : 'New password'}</label>
              <input type="password" autoComplete="new-password" className={inputCls} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>{ar ? 'تأكيد كلمة المرور' : 'Confirm password'}</label>
              <input type="password" autoComplete="new-password" className={inputCls} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
            </div>
          </div>
          <Notice notice={pwNotice} />
          <button disabled={savingPw} className="px-6 py-2.5 bg-brand text-white text-sm font-semibold rounded hover:bg-brand-dark disabled:opacity-60 transition-all">
            {savingPw ? (ar ? 'جارٍ الحفظ...' : 'Saving...') : (ar ? 'تغيير كلمة المرور' : 'Change password')}
          </button>
        </form>

        {/* حذف الحساب */}
        <form onSubmit={deleteAccount} className="bg-white rounded-xl border border-red-100 shadow-sm p-5 space-y-3">
          <h2 className="font-bold text-red-600">{ar ? 'حذف الحساب' : 'Delete account'}</h2>
          <p className="text-sm text-gray-500">
            {ar ? 'هيتحذف حسابك وكل السكنات اللي ضفتها والمفضلة نهائيًا. اكتب كلمة المرور للتأكيد.' : 'This permanently deletes your account, your listings and your shortlist. Enter your password to confirm.'}
          </p>
          <input type="password" autoComplete="current-password" className={inputCls} value={delPw} onChange={(e) => setDelPw(e.target.value)} placeholder={ar ? 'كلمة المرور' : 'Password'} />
          <Notice notice={delNotice} />
          <button disabled={deleting || !delPw} className="px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700 disabled:opacity-60 transition-all">
            {deleting ? (ar ? 'جارٍ الحذف...' : 'Deleting...') : (ar ? 'حذف حسابي نهائيًا' : 'Delete my account')}
          </button>
        </form>
      </div>
    </div>
  );
}
