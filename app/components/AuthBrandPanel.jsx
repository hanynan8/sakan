// path: app/components/AuthBrandPanel.jsx
// لوحة البراندنج اللي جنب فورم تسجيل الدخول / إنشاء الحساب (مشتركة بين الصفحتين).
// نفس خلفية الهيرو في الهوم: صورة + طبقة غامقة، والكلام في نص الصورة.
import Link from 'next/link';

// نفس صورة الهيرو في الهوم (HeroPropertiesSection)
const HERO_IMAGE =
  'https://res.cloudinary.com/di6ctjhjp/image/upload/v1793633683/ChatGPT_Image_Nov_2_2026_05_33_56_PM_xvkhc9.png';

export default function AuthBrandPanel({ ar }) {
  return (
    <div className="hidden lg:flex lg:w-1/2 text-white flex-col p-12 relative overflow-hidden bg-brand">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={HERO_IMAGE} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      <div className="relative z-10">
        <Link href="/" className="text-3xl font-black tracking-tight text-white hover:text-white">
          {ar ? 'سكني' : 'Sakani'}
        </Link>
      </div>

      {/* الكلام في نص الصورة (أفقي ورأسي) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <span className="block w-14 h-1 rounded-full bg-white/80 mb-6" aria-hidden="true" />
        <h2 className="text-4xl xl:text-5xl font-black leading-[1.35] mb-5 drop-shadow-md">
          {ar ? 'اختر سكنك في أسوان بكل سهولة.' : 'Choose your home in Aswan with ease.'}
        </h2>
        <p className="text-lg leading-relaxed text-white/90 font-medium drop-shadow">
          {ar
            ? 'طالب بتدور على سكن، ولا مالك عندك عقار؟ سكني ليك.'
            : 'A student looking for housing, or an owner listing a place? Sakani is for you.'}
        </p>
      </div>

      <div className="relative z-10 text-sm text-white/80 text-center">
        {ar ? '© سكني — منصة السكن الطلابي في أسوان' : '© Sakani — Student housing platform in Aswan'}
      </div>
    </div>
  );
}