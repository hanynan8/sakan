// path: app/privacy/page.jsx
'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const SECTIONS = [
  {
    ar: { h: 'البيانات التي نجمعها', p: 'نجمع الاسم، والبريد الإلكتروني أو رقم الهاتف، وكلمة المرور (مخزّنة مشفّرة ولا يمكن قراءتها)، بالإضافة إلى رقم الهاتف ورسالة طلب الحجز عند إرسال طلب حجز (يراها فريق المنصة فقط)، وبيانات السكنات التي يضيفها المالكون وطلبات الدعم التي ترسلها.' },
    en: { h: 'Information we collect', p: 'We collect your name, email or phone number, and your password (stored hashed and never readable), along with the phone number and message you provide in a booking request (visible to platform staff only), property listings added by owners and support requests you submit.' },
  },
  {
    ar: { h: 'كيف نستخدم بياناتك', p: 'نستخدم بياناتك لتشغيل حسابك، وعرض السكنات، والرد على استفساراتك. لا نبيع بياناتك لأي طرف ثالث.' },
    en: { h: 'How we use your data', p: 'We use your data to run your account, display listings and respond to your inquiries. We do not sell your data to third parties.' },
  },
  {
    ar: { h: 'بيانات المالكين', p: 'لا تُعرض بيانات المالك للعامة. يتم التواصل بخصوص أي سكن عبر واتساب المنصة فقط.' },
    en: { h: 'Owner information', p: 'Owner details are never shown publicly. All communication about a listing goes through the platform’s WhatsApp number.' },
  },
  {
    ar: { h: 'ملفات تعريف الارتباط', p: 'نستخدم ملفات تعريف ارتباط ضرورية فقط لتسجيل الدخول وحفظ الجلسة، ونحفظ تفضيل اللغة في متصفحك.' },
    en: { h: 'Cookies', p: 'We only use essential cookies to keep you signed in, and we store your language preference in your browser.' },
  },
  {
    ar: { h: 'حقوقك', p: 'يمكنك تعديل اسمك وتغيير كلمة المرور وحذف حسابك نهائيًا (مع كل سكناتك ومفضلتك وطلبات حجزك) من صفحة إعدادات الحساب في أي وقت.' },
    en: { h: 'Your rights', p: 'You can edit your name, change your password, and permanently delete your account (with your listings and shortlist) from Account Settings at any time.' },
  },
  {
    ar: { h: 'التواصل', p: 'لأي استفسار بخصوص الخصوصية، تواصل معنا من صفحة المساعدة.' },
    en: { h: 'Contact', p: 'For any privacy-related question, reach us through the Help page.' },
  },
];

export default function PrivacyPage() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  return (
    <div className="bg-gray-50 min-h-screen pb-16" dir={ar ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto px-4 pt-8">
        <nav className="flex items-center gap-1.5 text-sm mb-4">
          <Link href="/" className="text-gray-500 hover:text-brand-dark">{ar ? 'الرئيسية' : 'Home'}</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium">{ar ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
        </nav>
        <h1 className="text-3xl font-black text-navy mb-6">{ar ? 'سياسة الخصوصية' : 'Privacy Policy'}</h1>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          {SECTIONS.map((s, i) => (
            <section key={i}>
              <h2 className="font-bold text-navy mb-1.5">{(ar ? s.ar : s.en).h}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{(ar ? s.ar : s.en).p}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
