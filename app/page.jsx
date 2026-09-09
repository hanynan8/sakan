'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language, toggleLanguage, isRTL } = useLanguage();
  const [collegeSlideIndex, setCollegeSlideIndex] = useState(0);
  const [propertySlideIndex, setPropertySlideIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const sliderRef = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Get slides per view based on screen size (with more partial cards visible)
  const getSlidesPerView = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth >= 1536) return 4.3; // 2xl screens - 4 full + more of 5th visible
    if (window.innerWidth >= 1280) return 3.8; // xl screens - 3 full + more of 4th visible
    if (window.innerWidth >= 1024) return 3.3; // lg screens - 3 full + third of 4th
    if (window.innerWidth >= 768) return 2.3; // md screens - 2 full + third of 3rd
    return 1.3; // mobile - 1 full + third of 2nd (more visible)
  };

  const [slidesPerView, setSlidesPerView] = useState(getSlidesPerView());

  useEffect(() => {
    const handleResize = () => {
      setSlidesPerView(getSlidesPerView());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextCollegeSlide = () => {
    if (!data?.trendingColleges?.colleges) return;
    const maxIndex = Math.max(0, data.trendingColleges.colleges.length - slidesPerView);
    setCollegeSlideIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevCollegeSlide = () => {
    if (!data?.trendingColleges?.colleges) return;
    const maxIndex = Math.max(0, data.trendingColleges.colleges.length - slidesPerView);
    setCollegeSlideIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Property Slider Navigation
  const nextPropertySlide = () => {
    if (!data?.featuredProperties?.properties) return;
    const maxIndex = Math.max(0, data.featuredProperties.properties.length - slidesPerView);
    setPropertySlideIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevPropertySlide = () => {
    if (!data?.featuredProperties?.properties) return;
    const maxIndex = Math.max(0, data.featuredProperties.properties.length - slidesPerView);
    setPropertySlideIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Touch handlers for College Slider
  const handleCollegeTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleCollegeTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleCollegeTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (language === 'ar') {
      if (isLeftSwipe) {
        prevCollegeSlide();
      }
      if (isRightSwipe) {
        nextCollegeSlide();
      }
    } else {
      if (isLeftSwipe) {
        nextCollegeSlide();
      }
      if (isRightSwipe) {
        prevCollegeSlide();
      }
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Touch handlers for Property Slider
  const handlePropertyTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handlePropertyTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handlePropertyTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (language === 'ar') {
      if (isLeftSwipe) {
        prevPropertySlide();
      }
      if (isRightSwipe) {
        nextPropertySlide();
      }
    } else {
      if (isLeftSwipe) {
        nextPropertySlide();
      }
      if (isRightSwipe) {
        prevPropertySlide();
      }
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data?collection=Home');
      const result = await response.json();
      setData(result[0]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-black text-xl">لا توجد بيانات</p>
      </div>
    );
  }

  const t = (section) => language === 'ar' ? section?.ar : section?.en;

  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* Hero Section */}
      <section className="relative bg-white py-20 lg:py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={data.hero?.backgroundImage || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069"}
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`mb-12 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
              {t(data.hero)?.mainHeading}
            </h2>
            <p className="text-xl md:text-2xl text-white mb-10 font-medium drop-shadow-lg">
              {t(data.hero)?.subHeading}
            </p>

            {/* Search Bar */}
            <div className={`max-w-3xl mb-8 ${language === 'ar' ? 'ml-auto' : 'mr-auto'}`}>
              <div className={`flex gap-3 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                <input
                  type="text"
                  placeholder={t(data.hero)?.searchPlaceholder}
                  className="flex-1 px-6 py-4 text-lg border-2 border-white bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white shadow-xl rounded-lg"
                />
                <button className="px-10 py-4 bg-black text-white text-lg font-bold hover:bg-gray-900 transition-all shadow-xl border-2 border-white whitespace-nowrap rounded-lg">
                  {t(data.hero)?.ctaButton}
                </button>
              </div>

              {/* Popular Searches */}
              <div className={`mt-5 flex flex-wrap gap-2 items-center ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <span className="text-sm text-white font-medium drop-shadow">
                  {t(data.hero)?.popularSearchesLabel || 'عمليات بحث شائعة:'}
                </span>
                {t(data.hero)?.popularSearches?.map((search, index) => (
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
              {t(data.hero)?.stats?.map((stat, index) => (
                <div
                  key={index}
                  className={`text-center py-2 ${
                    language === 'ar'
                      ? index !== 0 ? 'border-r-2 border-white border-opacity-30' : ''
                      : index !== (t(data.hero)?.stats?.length - 1) ? 'border-r-2 border-white border-opacity-30' : ''
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

      {/* Trending Colleges Section - Responsive Slider */}
      <section className="bg-white py-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black text-black mb-4">
              {t(data.trendingColleges)?.sectionTitle}
            </h3>
            <p className="text-lg text-gray-600 font-medium">
              {t(data.trendingColleges)?.sectionSubtitle}
            </p>
          </div>

          <div className="relative">
            {/* Slider Container */}
            <div 
              className="overflow-hidden touch-pan-y -mx-1 md:-mx-2"
              onTouchStart={handleCollegeTouchStart}
              onTouchMove={handleCollegeTouchMove}
              onTouchEnd={handleCollegeTouchEnd}
            >
              <div 
                className="flex transition-transform duration-500 ease-out gap-4 md:gap-5 lg:gap-6 xl:gap-8 px-1 md:px-2"
                style={{
                  transform: `translateX(${language === 'ar' 
                    ? collegeSlideIndex * (100 / slidesPerView) 
                    : -collegeSlideIndex * (100 / slidesPerView)}%)`
                }}
              >
                {data.trendingColleges?.colleges?.map((college) => (
                  <div
                    key={college.id}
                    className="flex-shrink-0"
                    style={{
                      width: `calc(${100 / slidesPerView}% - ${
                        slidesPerView >= 3 ? '2rem' : 
                        slidesPerView >= 2 ? '1.25rem' : 
                        '1rem'
                      })`
                    }}
                  >
                    <div className="group cursor-pointer border-2 border-gray-300 hover:border-black transition-all duration-300 h-full rounded-xl overflow-hidden">
                      <div className="relative h-48 md:h-56 lg:h-64 bg-gray-100">
                        <img
                          src={college.image}
                          alt={t(college)?.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 md:p-6 bg-white">
                        <h4 className="text-lg md:text-xl font-bold text-black mb-2 line-clamp-1">
                          {t(college)?.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2 font-medium line-clamp-1">{t(college)?.location}</p>
                        <p className="text-xs md:text-sm text-gray-500 mb-4 line-clamp-2">{t(college)?.description}</p>
                        
                        <div className="flex justify-between items-center pt-3 md:pt-4 border-t-2 border-gray-200">
                          <div>
                            <span className="text-xl md:text-2xl font-black text-black">
                              {college.availableProperties}
                            </span>
                            <span className="text-xs md:text-sm text-gray-600 mr-1 md:mr-2 font-medium">سكن متاح</span>
                          </div>
                          <div className="text-left">
                            <div className="text-xs text-gray-600 font-medium">من</div>
                            <div className="text-sm md:text-lg font-bold text-black">
                              {college.averagePrice.min} {college.averagePrice.currency}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 md:mt-4 flex flex-wrap gap-1.5 md:gap-2">
                          {college.popularAreas?.slice(0, 3).map((area, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 md:px-3 py-1 bg-gray-100 text-gray-700 font-medium rounded-md"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows - Hidden on Mobile */}
            <button
              onClick={prevCollegeSlide}
              className="hidden md:flex absolute -left-6 xl:-left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-black text-white hover:bg-gray-800 transition-all items-center justify-center shadow-xl z-10 rounded-xl"
              aria-label="Previous colleges"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextCollegeSlide}
              className="hidden md:flex absolute -right-6 xl:-right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-black text-white hover:bg-gray-800 transition-all items-center justify-center shadow-xl z-10 rounded-xl"
              aria-label="Next colleges"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Slide Indicators - Mobile Only */}
            <div className="flex md:hidden justify-center gap-2 mt-6">
              {data.trendingColleges?.colleges?.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCollegeSlideIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === collegeSlideIndex
                      ? 'bg-black w-8'
                      : 'bg-gray-300 w-2'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="px-10 py-3 border-2 border-black text-black font-bold hover:bg-black hover:text-white transition-all rounded-lg">
              {t(data.trendingColleges)?.viewAllText}
            </button>
          </div>
        </div>
      </section>

      {/* Featured Properties Section - Responsive Slider */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black text-black mb-4">
              {t(data.featuredProperties)?.sectionTitle}
            </h3>
            <p className="text-lg text-gray-600 font-medium">
              {t(data.featuredProperties)?.sectionSubtitle}
            </p>
          </div>

          <div className="relative">
            {/* Slider Container */}
            <div 
              className="overflow-hidden touch-pan-y -mx-1 md:-mx-2"
              onTouchStart={handlePropertyTouchStart}
              onTouchMove={handlePropertyTouchMove}
              onTouchEnd={handlePropertyTouchEnd}
            >
              <div 
                className="flex transition-transform duration-500 ease-out gap-4 md:gap-5 lg:gap-6 xl:gap-8 px-1 md:px-2"
                style={{
                  transform: `translateX(${language === 'ar' 
                    ? propertySlideIndex * (100 / slidesPerView) 
                    : -propertySlideIndex * (100 / slidesPerView)}%)`
                }}
              >
                {data.featuredProperties?.properties?.map((property) => (
                  <div
                    key={property.id}
                    className="flex-shrink-0"
                    style={{
                      width: `calc(${100 / slidesPerView}% - ${
                        slidesPerView >= 3 ? '2rem' : 
                        slidesPerView >= 2 ? '1.25rem' : 
                        '1rem'
                      })`
                    }}
                  >
                    <div className="group bg-white border-2 border-gray-300 hover:border-black transition-all duration-300 cursor-pointer h-full rounded-xl overflow-hidden">
                      <div className="relative h-48 md:h-56 lg:h-64 bg-gray-100">
                        <img
                          src={property.images[0]}
                          alt={t(property)?.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {property.verified && (
                          <div className="absolute top-3 right-3 bg-black text-white text-xs px-3 py-1.5 font-bold rounded-md">
                            ✓ موثق
                          </div>
                        )}
                      </div>

                      <div className="p-4 md:p-5 bg-white">
                        <h5 className="font-bold text-black mb-2 line-clamp-2 leading-tight">
                          {t(property)?.name}
                        </h5>
                        <p className="text-sm text-gray-600 mb-3 font-medium line-clamp-1">{t(property)?.location}</p>

                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-xl md:text-2xl font-black text-black">
                            {property.price.amount}
                          </span>
                          <span className="text-xs md:text-sm text-gray-600 font-medium">
                            {property.price.currency}/{property.price.period}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-3 pb-3 border-b-2 border-gray-200">
                          <div className="flex items-center gap-1">
                            <span className="text-base md:text-lg text-black">★</span>
                            <span className="font-bold text-black text-sm md:text-base">{property.rating}</span>
                            <span className="text-xs text-gray-500 font-medium">({property.reviewsCount})</span>
                          </div>
                          <div className="text-xs text-gray-600 font-medium line-clamp-1">
                            {property.distance}
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs mb-3">
                          <div className="text-gray-700 font-medium line-clamp-1">
                            <span className="font-bold text-black">النوع:</span> {property.propertyType}
                          </div>
                          <div className="text-gray-700 font-medium line-clamp-1">
                            <span className="font-bold text-black">الغرفة:</span> {property.roomType}
                          </div>
                          <div className="text-gray-700 font-medium line-clamp-1">
                            <span className="font-bold text-black">السعة:</span> {property.capacity} أشخاص
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 md:gap-1.5">
                          {property.features?.slice(0, 3).map((feature, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 font-medium rounded-md"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows - Hidden on Mobile */}
            <button
              onClick={prevPropertySlide}
              className="hidden md:flex absolute -left-6 xl:-left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-black text-white hover:bg-gray-800 transition-all items-center justify-center shadow-xl z-10 rounded-xl"
              aria-label="Previous properties"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={language === 'en' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
              </svg>
            </button>
            <button
              onClick={nextPropertySlide}
              className="hidden md:flex absolute -right-6 xl:-right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-black text-white hover:bg-gray-800 transition-all items-center justify-center shadow-xl z-10 rounded-xl"
              aria-label="Next properties"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={language === 'en' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
              </svg>
            </button>

            {/* Slide Indicators - Mobile Only */}
            <div className="flex md:hidden justify-center gap-2 mt-6">
              {data.featuredProperties?.properties?.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setPropertySlideIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === propertySlideIndex
                      ? 'bg-black w-8'
                      : 'bg-gray-300 w-2'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="px-10 py-3 bg-black text-white font-bold hover:bg-gray-800 transition-all rounded-lg">
              {t(data.featuredProperties)?.viewAllText}
            </button>
          </div>
        </div>
      </section>

      {/* Popular Areas Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black text-black mb-4">
              {t(data.popularAreas)?.sectionTitle}
            </h3>
            <p className="text-lg text-gray-600 font-medium">
              {t(data.popularAreas)?.sectionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.popularAreas?.areas?.map((area) => (
              <div
                key={area.id}
                className="group relative h-80 overflow-hidden cursor-pointer border-2 border-gray-300 hover:border-black transition-all duration-300 rounded-xl"
              >
                <img
                  src={area.image}
                  alt={t(area)?.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h4 className="text-2xl font-black mb-2">{t(area)?.name}</h4>
                  <p className="text-sm mb-3 text-gray-200 font-medium">{t(area)?.description}</p>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>{area.propertiesCount} سكن</span>
                    <span>من {area.averagePrice} EGP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black text-black mb-4">
              {t(data.testimonials)?.sectionTitle}
            </h3>
            <p className="text-lg text-gray-600 font-medium">
              {t(data.testimonials)?.sectionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.testimonials?.reviews?.map((review) => (
              <div
                key={review.id}
                className="bg-white p-6 border-2 border-gray-300 hover:border-black hover:shadow-lg transition-all duration-300 rounded-xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={review.avatar}
                    alt={t(review)?.name}
                    className="w-14 h-14 rounded-full border-2 border-black object-cover"
                  />
                  <div>
                    <div className="font-bold text-black">{t(review)?.name}</div>
                    <div className="text-xs text-gray-600 font-medium">{t(review)?.university}</div>
                  </div>
                </div>

                <div className="flex gap-0.5 mb-3">
                  {[...Array(t(review)?.rating)].map((_, i) => (
                    <span key={i} className="text-black text-lg">★</span>
                  ))}
                </div>

                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  "{t(review)?.review}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black text-black mb-4">
              {t(data.howItWorks)?.sectionTitle}
            </h3>
            <p className="text-lg text-gray-600 font-medium">
              {t(data.howItWorks)?.sectionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {data.howItWorks?.steps?.map((step, index) => (
              <div key={step.id} className="text-center relative">
                {index < data.howItWorks.steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 right-0 w-full h-0.5 bg-gray-300 -z-10"></div>
                )}
                <div className="w-20 h-20 mx-auto mb-6 bg-black text-white flex items-center justify-center text-4xl font-black shadow-lg rounded-xl">
                  {step.stepNumber}
                </div>
                <h4 className="text-xl font-bold text-black mb-3">
                  {t(step)?.title}
                </h4>
                <p className="text-gray-600 leading-relaxed font-medium">
                  {t(step)?.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      {/* <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black text-black mb-4">
              {t(data.whyChooseUs)?.sectionTitle}
            </h3>
            <p className="text-lg text-gray-600 font-medium">
              {t(data.whyChooseUs)?.sectionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.whyChooseUs?.features?.map((feature) => (
              <div
                key={feature.id}
                className="text-center p-6 border-2 border-gray-300 hover:border-black hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-black text-white flex items-center justify-center text-3xl font-bold">
                  ✦
                </div>
                <h4 className="text-xl font-bold text-black mb-3">
                  {t(feature)?.title}
                </h4>
                <p className="text-gray-600 leading-relaxed font-medium">
                  {t(feature)?.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Call to Action Section */}
      <section className="bg-white py-20 border-t-2 border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-black text-black mb-4">
            {t(data.callToAction)?.title}
          </h3>
          <p className="text-lg text-gray-600 mb-6 font-medium">
            {t(data.callToAction)?.subtitle}
          </p>
          <p className="text-gray-700 mb-10 font-medium">
            {t(data.callToAction)?.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-10 py-4 bg-black text-white text-lg font-bold hover:bg-gray-800 transition-all rounded-lg">
              {t(data.callToAction)?.studentCTA}
            </button>
            <button className="px-10 py-4 border-2 border-black text-black text-lg font-bold hover:bg-black hover:text-white transition-all rounded-lg">
              {t(data.callToAction)?.ownerCTA}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}