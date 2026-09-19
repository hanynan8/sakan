'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import HomeSections from './components/HomeSections';

/* ═══════════════════════════════════════════════
   بيانات الهيرو سكشن بس - باقي السكاشن (الكليات، المناطق،
   آراء الطلاب، إزاي بيشتغل الموقع، والـ CTA) بقت في
   components/HomeSections.jsx عشان تتعاد استخدامها في صفحة
   السكنات كمان.
═══════════════════════════════════════════════ */
const HERO_DATA = {
  backgroundImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069',
  ar: {
      mainHeading: 'ابحث عن سكنك المثالي\nبالقرب من جامعتك',
      subHeading: 'آلاف الوحدات السكنية المُتحقق منها في أفضل المناطق',
      searchPlaceholder: 'ابحث بالجامعة، المنطقة، أو نوع السكن...',
      ctaButton: 'ابحث الآن',
      popularSearchesLabel: 'عمليات بحث شائعة:',
      popularSearches: [
        'القاهرة الجديدة',
        'مدينة نصر',
        'المهندسين',
        'الدقي',
        '6 أكتوبر'
      ]
    },
    en: {
      mainHeading: 'Find Your Perfect Home\nNear Your University',
      subHeading: 'Thousands of verified accommodations in the best areas',
      searchPlaceholder: 'Search by university, area, or accommodation type...',
      ctaButton: 'Search Now',
      popularSearchesLabel: 'Popular searches:',
      popularSearches: [
        'New Cairo',
        'Nasr City',
        'Mohandessin',
        'Dokki',
        '6th October'
      ]
    }
};

export default function HomePage() {
  const { language } = useLanguage();
  const t = (section) => language === 'ar' ? section?.ar : section?.en;

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section className="relative bg-white py-20 lg:py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_DATA?.backgroundImage || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069"}
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`mb-12 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
              {t(HERO_DATA)?.mainHeading}
            </h2>
            <p className="text-xl md:text-2xl text-white mb-10 font-medium drop-shadow-lg">
              {t(HERO_DATA)?.subHeading}
            </p>

            {/* Search Bar */}
            <div className={`max-w-3xl mb-8 ${language === 'ar' ? 'ml-auto' : 'mr-auto'}`}>
              <div className={`flex gap-3 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                <input
                  type="text"
                  placeholder={t(HERO_DATA)?.searchPlaceholder}
                  className="flex-1 px-6 py-4 text-lg border-2 border-white bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white shadow-xl rounded-lg"
                />
                <button className="px-10 py-4 bg-black text-white text-lg font-bold hover:bg-gray-900 transition-all shadow-xl border-2 border-white whitespace-nowrap rounded-lg">
                  {t(HERO_DATA)?.ctaButton}
                </button>
              </div>

              {/* Popular Searches */}
              <div className={`mt-5 flex flex-wrap gap-2 items-center ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <span className="text-sm text-white font-medium drop-shadow">
                  {t(HERO_DATA)?.popularSearchesLabel || 'عمليات بحث شائعة:'}
                </span>
                {t(HERO_DATA)?.popularSearches?.map((search, index) => (
                  <button
                    key={index}
                    className="px-4 py-1.5 text-sm border-2 border-white text-white hover:bg-white hover:text-black transition-all font-medium backdrop-blur-sm rounded-md"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl pt-8 ${language === 'ar' ? 'ml-auto' : 'mr-auto'}`}>
              {t(HERO_DATA)?.stats?.map((stat, index) => (
                <div
                  key={index}
                  className={`text-center py-2 ${
                    language === 'ar'
                      ? index !== 0 ? 'border-r-2 border-white border-opacity-30' : ''
                      : index !== (t(HERO_DATA)?.stats?.length - 1) ? 'border-r-2 border-white border-opacity-30' : ''
                  }`}
                >
                  <div className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-lg">{stat.number}</div>
                  <div className="text-sm text-white font-medium drop-shadow">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HomeSections />
    </div>
  );
}