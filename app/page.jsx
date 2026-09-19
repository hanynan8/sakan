'use client';

import HomeSections from './components/HomeSections';
import HeroPropertiesSection from './components/HeroPropertiesSection';

/* ═══════════════════════════════════════════════
   الهوم بقت مبنية على مبدأ "عملي أهم من شكلي": مفيش صورة
   خلفية كبيرة، الزائر يلاقي مربع البحث والفلاتر والنتائج
   على طول قدامه في نفس السكشن (HeroPropertiesSection)، وتحتها
   باقي سكاشن الهوم العادية (الكليات، المناطق، الخ) في
   components/HomeSections.jsx.
═══════════════════════════════════════════════ */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero + بحث + نتائج السكنات - سكشن واحد عملي بدل الهيرو الزخرفي القديم */}
      <HeroPropertiesSection />

      <HomeSections />
    </div>
  );
}