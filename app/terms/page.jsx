// path: app/terms/page.jsx
'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const SECTIONS = [
  {
    ar: { h: 'طبيعة المنصة', p: 'سكني منصة تعرض سكنًا طلابيًا في أسوان وتربط الطلاب بالسكنات المتاحة. يمكن للطالب إرسال طلب حجز عبر الموقع، وتتواصل معه المنصة لتأكيده. المنصة لا تتولى أي مدفوعات، ويتم الاتفاق النهائي والدفع بين الطالب والمالك خارج المنصة. إعلانات المالكين تخضع للمراجعة قبل نشرها.' },
    en: { h: 'About the platform', p: 'Sakani lists student housing in Aswan and connects students with available properties. Students can submit a booking request through the site and the platform contacts them to confirm it. The platform does not process any payments; final arrangements and payment are made between the student and the owner outside the site. Owner listings are reviewed before publication.' },
  },
  {
    ar: { h: 'الحسابات', p: 'أنت مسؤول عن صحة بياناتك وسرية كلمة مرورك وعن كل نشاط يتم من حسابك. يجب ألا تقل كلمة المرور عن 8 حروف وتحتوي على حرف كبير ورقم.' },
    en: { h: 'Accounts', p: 'You are responsible for the accuracy of your information, the confidentiality of your password and all activity under your account.' },
  },
  {
    ar: { h: 'المحتوى المعروض', p: 'يلتزم المالك بأن بيانات السكن وصوره وأسعاره صحيحة وأنه يملك حق عرضها. يحق للإدارة إخفاء أو حذف أي إعلان مخالف أو مضلل.' },
    en: { h: 'Listings', p: 'Owners must ensure that listing details, photos and prices are accurate and that they have the right to publish them. We may hide or remove any misleading or inappropriate listing.' },
  },
  {
    ar: { h: 'الاستخدام المقبول', p: 'يُمنع إساءة استخدام المنصة أو محاولة اختراقها أو إرسال محتوى مسيء أو إعلانات مزيفة.' },
    en: { h: 'Acceptable use', p: 'Misuse of the platform, attempts to compromise it, abusive content and fake listings are prohibited.' },
  },
  {
    ar: { h: 'إخلاء المسؤولية', p: 'ننصح دائمًا بمعاينة السكن شخصيًا قبل الاتفاق النهائي. المنصة غير مسؤولة عن أي اتفاق يتم بين الطالب والمالك.' },
    en: { h: 'Disclaimer', p: 'We always recommend visiting a property in person before any final agreement. The platform is not responsible for agreements made between students and owners.' },
  },
];

export default function TermsPage() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  return (
    <div className="bg-gray-50 min-h-screen pb-16" dir={ar ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto px-4 pt-8">
        <nav className="flex items-center gap-1.5 text-sm mb-4">
          <Link href="/" className="text-gray-500 hover:text-brand-dark">{ar ? 'الرئيسية' : 'Home'}</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium">{ar ? 'الشروط والأحكام' : 'Terms & Conditions'}</span>
        </nav>
        <h1 className="text-3xl font-black text-navy mb-6">{ar ? 'الشروط والأحكام' : 'Terms & Conditions'}</h1>
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
