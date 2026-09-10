'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

/* ═══════════════════════════════════════════════
   STATIC DATA (كانت جايه من /api/data?collection=Home)
═══════════════════════════════════════════════ */
const HOME_DATA = {
  hero: {
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
  },
  trendingColleges: {
    ar: {
      sectionTitle: 'الكليات الأكثر طلباً',
      sectionSubtitle: 'اكتشف أفضل السكنات بالقرب من كليتك في جامعة أسوان',
      viewAllText: 'عرض جميع الكليات'
    },
    en: {
      sectionTitle: 'Most Requested Colleges',
      sectionSubtitle: 'Discover the best accommodations near your college at Aswan University',
      viewAllText: 'View All Colleges'
    },
    // مبنية على كليات جامعة أسوان الحقيقية (lib/taxonomy.js) بدل جامعات القاهرة
    colleges: [
      {
        id: 'medicine',
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=900',
        availableProperties: 180,
        averagePrice: { min: 2200, currency: 'EGP' },
        popularAreas: ['أسوان الجديدة', 'كسر الحجر', 'الكرور'],
        ar: { name: 'كلية الطب البشري', location: 'أسوان الجديدة، جامعة أسوان', description: 'من أكثر الكليات إقبالاً، وسط أسوان الجديدة' },
        en: { name: 'Faculty of Medicine', location: 'New Aswan, Aswan University', description: 'One of the most in-demand colleges, in New Aswan' }
      },
      {
        id: 'engineering',
        image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=900',
        availableProperties: 240,
        averagePrice: { min: 1800, currency: 'EGP' },
        popularAreas: ['أبو الريش', 'أبو الريش قبلي', 'أبو الريش بحري'],
        ar: { name: 'كلية الهندسة', location: 'أبو الريش، جامعة أسوان', description: 'كلية كبيرة بحرم مستقل في منطقة أبو الريش' },
        en: { name: 'Faculty of Engineering', location: 'Abu El-Rish, Aswan University', description: 'A large college with its own campus in Abu El-Rish' }
      },
      {
        id: 'commerce',
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=900',
        availableProperties: 260,
        averagePrice: { min: 1600, currency: 'EGP' },
        popularAreas: ['أسوان الجديدة', 'الشيخ هارون', 'الناصرية'],
        ar: { name: 'كلية التجارة', location: 'أسوان الجديدة، جامعة أسوان', description: 'من أكبر الكليات من حيث عدد الطلاب' },
        en: { name: 'Faculty of Commerce', location: 'New Aswan, Aswan University', description: 'One of the largest colleges by student numbers' }
      },
      {
        id: 'dentistry',
        image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=900',
        availableProperties: 110,
        averagePrice: { min: 2400, currency: 'EGP' },
        popularAreas: ['أسوان الجديدة', 'كسر الحجر', 'السد العالي'],
        ar: { name: 'كلية طب الفم والأسنان', location: 'أسوان الجديدة، جامعة أسوان', description: 'كلية طبية حديثة ضمن تجمع أسوان الجديدة' },
        en: { name: 'Faculty of Dentistry', location: 'New Aswan, Aswan University', description: 'A modern medical college within the New Aswan complex' }
      },
      {
        id: 'science',
        image: 'https://images.unsplash.com/photo-1567168539593-59673ba2a740?q=80&w=900',
        availableProperties: 300,
        averagePrice: { min: 1500, currency: 'EGP' },
        popularAreas: ['صحاري', 'طريق المطار', 'السيل'],
        ar: { name: 'كلية العلوم', location: 'صحاري - طريق المطار، جامعة أسوان', description: 'كلية رئيسية في تجمع صحاري بطريق المطار' },
        en: { name: 'Faculty of Science', location: 'Sahari - Airport Road, Aswan University', description: 'A key college in the Sahari - Airport Road campus' }
      },
      {
        id: 'arts',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=900',
        availableProperties: 190,
        averagePrice: { min: 1400, currency: 'EGP' },
        popularAreas: ['أسوان الجديدة', 'الشيخ هارون', 'خور عواضة'],
        ar: { name: 'كلية الآداب', location: 'أسوان الجديدة، جامعة أسوان', description: 'من الكليات الكبيرة بأعداد طلاب كثيفة' },
        en: { name: 'Faculty of Arts', location: 'New Aswan, Aswan University', description: 'One of the larger colleges with high student numbers' }
      },
      {
        id: 'law',
        image: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?q=80&w=900',
        availableProperties: 150,
        averagePrice: { min: 1500, currency: 'EGP' },
        popularAreas: ['أسوان الجديدة', 'الناصرية', 'الكرور'],
        ar: { name: 'كلية الحقوق', location: 'أسوان الجديدة، جامعة أسوان', description: 'مقرها ضمن تجمع أسوان الجديدة' },
        en: { name: 'Faculty of Law', location: 'New Aswan, Aswan University', description: 'Located within the New Aswan complex' }
      },
      {
        id: 'education',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=900',
        availableProperties: 210,
        averagePrice: { min: 1300, currency: 'EGP' },
        popularAreas: ['النفق', 'السيل غرب', 'الناصرية'],
        ar: { name: 'كلية التربية', location: 'النفق، جامعة أسوان', description: 'كلية رئيسية في تجمع النفق' },
        en: { name: 'Faculty of Education', location: 'El-Naga (Tunnel), Aswan University', description: 'A key college in the El-Naga campus' }
      }
    ]
  },
  // كان "عقارات مميزة" - بقى سكشن لأشهر مناطق مدينة أسوان (lib/taxonomy.js)
  topAreas: {
    ar: {
      sectionTitle: 'أشهر مناطق أسوان',
      sectionSubtitle: 'اكتشف أشهر مناطق مدينة أسوان لسكن الطلاب',
      viewAllText: 'عرض جميع المناطق'
    },
    en: {
      sectionTitle: 'Most Popular Areas in Aswan',
      sectionSubtitle: 'Discover the most popular areas in Aswan for student housing',
      viewAllText: 'View All Areas'
    },
    areas: [
      {
        id: 'wost-elbalad',
        image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=900',
        propertiesCount: 210,
        averagePrice: 1800,
        ar: { name: 'وسط البلد', description: 'قلب مدينة أسوان النابض، قريب من كل الخدمات والمواصلات' },
        en: { name: 'Wast El-Balad (Downtown)', description: "The vibrant heart of Aswan, close to all services and transport" }
      },
      {
        id: 'corniche',
        image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=900',
        propertiesCount: 150,
        averagePrice: 2600,
        ar: { name: 'كورنيش النيل', description: 'إطلالة ساحرة على النيل مع أماكن سكن هادئة ومميزة' },
        en: { name: 'Nile Corniche', description: 'A stunning Nile view with quiet, distinguished housing' }
      },
      {
        id: 'sail',
        image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=900',
        propertiesCount: 320,
        averagePrice: 1400,
        ar: { name: 'السيل', description: 'من أكبر المناطق السكنية وأكثرها إقبالاً من الطلاب' },
        en: { name: 'El-Sail', description: 'One of the largest residential areas, popular with students' }
      },
      {
        id: 'sadaqa',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=900',
        propertiesCount: 260,
        averagePrice: 1500,
        ar: { name: 'الصداقة', description: 'منطقة سكنية هادئة بأسعار مناسبة لميزانية الطلاب' },
        en: { name: 'El-Sadaka', description: 'A quiet residential area with student-friendly prices' }
      },
      {
        id: 'mahatta',
        image: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=900',
        propertiesCount: 140,
        averagePrice: 1700,
        ar: { name: 'المحطة', description: 'قريبة من محطة القطار ووسط المدينة ووسائل المواصلات' },
        en: { name: 'El-Mahatta (Station)', description: 'Close to the train station, downtown, and transport links' }
      },
      {
        id: 'new-aswan',
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=900',
        propertiesCount: 300,
        averagePrice: 2000,
        ar: { name: 'أسوان الجديدة', description: 'أقرب المناطق لكليات الطب والتجارة والحقوق والآداب' },
        en: { name: 'New Aswan', description: 'The closest area to the Medicine, Commerce, Law and Arts colleges' }
      },
      {
        id: 'abu-elrish',
        image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=900',
        propertiesCount: 180,
        averagePrice: 1600,
        ar: { name: 'أبو الريش', description: 'قريبة جداً من كلية الهندسة وحرمها المستقل' },
        en: { name: 'Abu El-Rish', description: 'Very close to the Faculty of Engineering campus' }
      },
      {
        id: 'sahari',
        image: 'https://images.unsplash.com/photo-1567168539593-59673ba2a740?q=80&w=900',
        propertiesCount: 200,
        averagePrice: 1300,
        ar: { name: 'صحاري - طريق المطار', description: 'تجمع كليات العلوم والزراعة والطب البيطري وغيرها' },
        en: { name: 'Sahari - Airport Road', description: 'Home to the Science, Agriculture, Veterinary Medicine colleges and more' }
      }
    ]
  },
  testimonials: {
    ar: {
      sectionTitle: 'ماذا يقول طلابنا؟',
      sectionSubtitle: 'آراء حقيقية من طلاب وجدوا سكنهم المثالي معنا'
    },
    en: {
      sectionTitle: 'What Our Students Say',
      sectionSubtitle: 'Real reviews from students who found their perfect home with us'
    },
    reviews: [
      {
        id: 'rev1',
        avatar: 'https://i.pravatar.cc/100?img=1',
        ar: {
          name: 'أحمد محمد',
          university: 'جامعة القاهرة',
          review: 'وجدت سكن ممتاز في أقل من أسبوع! المنصة سهلة الاستخدام والدعم كان رائع.',
          rating: 5
        },
        en: {
          name: 'Ahmed Mohamed',
          university: 'Cairo University',
          review: 'Found an excellent accommodation in less than a week! The platform is easy to use and the support was great.',
          rating: 5
        }
      },
      {
        id: 'rev2',
        avatar: 'https://i.pravatar.cc/100?img=5',
        ar: {
          name: 'سارة علي',
          university: 'الجامعة الأمريكية',
          review: 'أفضل منصة لإيجاد السكن الطلابي. الأسعار معقولة والعقارات موثقة ومضمونة.',
          rating: 5
        },
        en: {
          name: 'Sara Ali',
          university: 'American University',
          review: 'Best platform for finding student housing. Prices are reasonable and properties are verified and guaranteed.',
          rating: 5
        }
      },
      {
        id: 'rev3',
        avatar: 'https://i.pravatar.cc/100?img=8',
        ar: {
          name: 'محمد حسن',
          university: 'جامعة عين شمس',
          review: 'تجربة رائعة من البداية للنهاية. وفرت عليّ وقتاً وجهداً كبيراً في إيجاد السكن المناسب.',
          rating: 4
        },
        en: {
          name: 'Mohamed Hassan',
          university: 'Ain Shams University',
          review: 'Wonderful experience from start to finish. Saved me a lot of time and effort in finding the right accommodation.',
          rating: 4
        }
      },
      {
        id: 'rev4',
        avatar: 'https://i.pravatar.cc/100?img=12',
        ar: {
          name: 'نور إبراهيم',
          university: 'جامعة المنصورة',
          review: 'سكن نظيف وآمن بسعر مناسب. شكراً لفريق سكني على المساعدة!',
          rating: 5
        },
        en: {
          name: 'Nour Ibrahim',
          university: 'Mansoura University',
          review: 'Clean and safe accommodation at a reasonable price. Thank you Sakani team for your help!',
          rating: 5
        }
      }
    ]
  },
  howItWorks: {
    ar: {
      sectionTitle: 'كيف يعمل سكني؟',
      sectionSubtitle: '3 خطوات بسيطة للعثور على سكنك المثالي'
    },
    en: {
      sectionTitle: 'How Sakani Works',
      sectionSubtitle: '3 simple steps to find your perfect home'
    },
    steps: [
      {
        id: 'step1',
        stepNumber: '1',
        ar: {
          title: 'ابحث',
          description: 'استخدم محرك البحث للعثور على السكن المناسب بالقرب من جامعتك'
        },
        en: {
          title: 'Search',
          description: 'Use our search engine to find suitable accommodation near your university'
        }
      },
      {
        id: 'step2',
        stepNumber: '2',
        ar: {
          title: 'قارن واختار',
          description: 'قارن بين الخيارات المتاحة من حيث السعر والموقع والمميزات'
        },
        en: {
          title: 'Compare & Choose',
          description: 'Compare available options by price, location, and features'
        }
      },
      {
        id: 'step3',
        stepNumber: '3',
        ar: {
          title: 'احجز بأمان',
          description: 'احجز وحدتك السكنية بأمان عبر منصتنا الموثوقة'
        },
        en: {
          title: 'Book Safely',
          description: 'Book your accommodation safely through our trusted platform'
        }
      }
    ]
  },
  callToAction: {
    ar: {
      title: 'هل أنت مستعد للانطلاق؟',
      subtitle: 'انضم إلى آلاف الطلاب الذين وجدوا سكنهم المثالي معنا',
      description: 'سواء كنت طالباً تبحث عن سكن أو مالك عقار تريد تأجيره، سكني هنا لمساعدتك.',
      studentCTA: 'ابحث عن سكن',
      ownerCTA: 'أضف عقارك'
    },
    en: {
      title: 'Ready to Get Started?',
      subtitle: 'Join thousands of students who found their perfect home with us',
      description: "Whether you're a student looking for accommodation or a property owner wanting to rent, Sakani is here to help.",
      studentCTA: 'Find Accommodation',
      ownerCTA: 'List Your Property'
    }
  }
};

export default function HomePage() {
  const data = HOME_DATA;
  const { language, toggleLanguage, isRTL } = useLanguage();
  const [collegeSlideIndex, setCollegeSlideIndex] = useState(0);
  const [areaSlideIndex, setAreaSlideIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const sliderRef = useState(null);

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

  // Refs to measure real rendered widths (translateX % is relative to the
  // track's OWN width, not the visible container, so we need real pixels)
  const collegeTrackRef = useRef(null);
  const areaTrackRef = useRef(null);
  const [collegeMetrics, setCollegeMetrics] = useState({ trackWidth: 0, containerWidth: 0 });
  const [areaMetrics, setAreaMetrics] = useState({ trackWidth: 0, containerWidth: 0 });

  useEffect(() => {
    const measure = () => {
      if (collegeTrackRef.current?.parentElement) {
        const track = collegeTrackRef.current;
        setCollegeMetrics({ trackWidth: track.scrollWidth, containerWidth: track.parentElement.clientWidth });
      }
      if (areaTrackRef.current?.parentElement) {
        const track = areaTrackRef.current;
        setAreaMetrics({ trackWidth: track.scrollWidth, containerWidth: track.parentElement.clientWidth });
      }
    };
    measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [slidesPerView, language]);

  const collegesCount = data?.trendingColleges?.colleges?.length || 0;
  const collegeCardStep = collegesCount > 0 ? collegeMetrics.trackWidth / collegesCount : 0;
  const collegeMaxScrollPx = Math.max(0, collegeMetrics.trackWidth - collegeMetrics.containerWidth);
  const collegeMaxIndex = collegeCardStep > 0 ? Math.ceil(collegeMaxScrollPx / collegeCardStep) : 0;
  const collegeTranslatePx = Math.min(collegeSlideIndex * collegeCardStep, collegeMaxScrollPx);

  const areasCount = data?.topAreas?.areas?.length || 0;
  const areaCardStep = areasCount > 0 ? areaMetrics.trackWidth / areasCount : 0;
  const areaMaxScrollPx = Math.max(0, areaMetrics.trackWidth - areaMetrics.containerWidth);
  const areaMaxIndex = areaCardStep > 0 ? Math.ceil(areaMaxScrollPx / areaCardStep) : 0;
  const areaTranslatePx = Math.min(areaSlideIndex * areaCardStep, areaMaxScrollPx);

  const nextCollegeSlide = () => {
    setCollegeSlideIndex((prev) => Math.min(prev + 1, collegeMaxIndex));
  };

  const prevCollegeSlide = () => {
    setCollegeSlideIndex((prev) => Math.max(prev - 1, 0));
  };

  // Area Slider Navigation
  const nextAreaSlide = () => {
    setAreaSlideIndex((prev) => Math.min(prev + 1, areaMaxIndex));
  };

  const prevAreaSlide = () => {
    setAreaSlideIndex((prev) => Math.max(prev - 1, 0));
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
      if (isLeftSwipe) prevCollegeSlide();
      if (isRightSwipe) nextCollegeSlide();
    } else {
      if (isLeftSwipe) nextCollegeSlide();
      if (isRightSwipe) prevCollegeSlide();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Touch handlers for Area Slider
  const handleAreaTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleAreaTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleAreaTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (language === 'ar') {
      if (isLeftSwipe) prevAreaSlide();
      if (isRightSwipe) nextAreaSlide();
    } else {
      if (isLeftSwipe) nextAreaSlide();
      if (isRightSwipe) prevAreaSlide();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

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
                ref={collegeTrackRef}
                className="flex transition-transform duration-500 ease-out gap-4 md:gap-5 lg:gap-6 xl:gap-8 px-1 md:px-2"
                style={{
                  transform: `translateX(${language === 'ar'
                    ? collegeTranslatePx
                    : -collegeTranslatePx}px)`
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
                    <Link
                      href={`/properties?college=${college.id}`}
                      className="group cursor-pointer border-2 border-gray-300 hover:border-black transition-all duration-300 h-full rounded-xl overflow-hidden block"
                    >
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
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows - Hidden on Mobile */}
            <button
              onClick={prevCollegeSlide}
              disabled={collegeSlideIndex <= 0}
              className="hidden md:flex absolute -left-6 xl:-left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-black text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black transition-all items-center justify-center shadow-xl z-10 rounded-xl"
              aria-label="Previous colleges"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={language === 'en' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
              </svg>
            </button>
            <button
              onClick={nextCollegeSlide}
              disabled={collegeSlideIndex >= collegeMaxIndex}
              className="hidden md:flex absolute -right-6 xl:-right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-black text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black transition-all items-center justify-center shadow-xl z-10 rounded-xl"
              aria-label="Next colleges"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={language === 'en' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
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
            <Link
              href="/properties"
              className="inline-block px-10 py-3 border-2 border-black text-black font-bold hover:bg-black hover:text-white transition-all rounded-lg"
            >
              {t(data.trendingColleges)?.viewAllText}
            </Link>
          </div>
        </div>
      </section>

      {/* Top Aswan Areas Section - Responsive Slider (كانت "عقارات مميزة") */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black text-black mb-4">
              {t(data.topAreas)?.sectionTitle}
            </h3>
            <p className="text-lg text-gray-600 font-medium">
              {t(data.topAreas)?.sectionSubtitle}
            </p>
          </div>

          <div className="relative">
            {/* Slider Container */}
            <div 
              className="overflow-hidden touch-pan-y -mx-1 md:-mx-2"
              onTouchStart={handleAreaTouchStart}
              onTouchMove={handleAreaTouchMove}
              onTouchEnd={handleAreaTouchEnd}
            >
              <div 
                ref={areaTrackRef}
                className="flex transition-transform duration-500 ease-out gap-4 md:gap-5 lg:gap-6 xl:gap-8 px-1 md:px-2"
                style={{
                  transform: `translateX(${language === 'ar'
                    ? areaTranslatePx
                    : -areaTranslatePx}px)`
                }}
              >
                {data.topAreas?.areas?.map((area) => (
                  <div
                    key={area.id}
                    className="flex-shrink-0"
                    style={{
                      width: `calc(${100 / slidesPerView}% - ${
                        slidesPerView >= 3 ? '2rem' : 
                        slidesPerView >= 2 ? '1.25rem' : 
                        '1rem'
                      })`
                    }}
                  >
                    <Link
                      href={`/properties?area=${area.id}`}
                      className="group cursor-pointer border-2 border-gray-300 hover:border-black transition-all duration-300 h-full rounded-xl overflow-hidden block"
                    >
                      <div className="relative h-48 md:h-56 lg:h-64 bg-gray-100">
                        <img
                          src={area.image}
                          alt={t(area)?.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 md:p-6 bg-white">
                        <h4 className="text-lg md:text-xl font-bold text-black mb-2 line-clamp-1">
                          {t(area)?.name}
                        </h4>
                        <p className="text-xs md:text-sm text-gray-500 mb-4 line-clamp-2">{t(area)?.description}</p>

                        <div className="flex justify-between items-center pt-3 md:pt-4 border-t-2 border-gray-200">
                          <div>
                            <span className="text-xl md:text-2xl font-black text-black">
                              {area.propertiesCount}
                            </span>
                            <span className="text-xs md:text-sm text-gray-600 mr-1 md:mr-2 font-medium">
                              {language === 'ar' ? 'سكن متاح' : 'listings'}
                            </span>
                          </div>
                          <div className="text-left">
                            <div className="text-xs text-gray-600 font-medium">{language === 'ar' ? 'من' : 'From'}</div>
                            <div className="text-sm md:text-lg font-bold text-black">
                              {area.averagePrice} {language === 'ar' ? 'ج.م' : 'EGP'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows - Hidden on Mobile */}
            <button
              onClick={prevAreaSlide}
              disabled={areaSlideIndex <= 0}
              className="hidden md:flex absolute -left-6 xl:-left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-black text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black transition-all items-center justify-center shadow-xl z-10 rounded-xl"
              aria-label="Previous areas"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={language === 'en' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
              </svg>
            </button>
            <button
              onClick={nextAreaSlide}
              disabled={areaSlideIndex >= areaMaxIndex}
              className="hidden md:flex absolute -right-6 xl:-right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-black text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black transition-all items-center justify-center shadow-xl z-10 rounded-xl"
              aria-label="Next areas"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={language === 'en' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
              </svg>
            </button>

            {/* Slide Indicators - Mobile Only */}
            <div className="flex md:hidden justify-center gap-2 mt-6">
              {data.topAreas?.areas?.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setAreaSlideIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === areaSlideIndex
                      ? 'bg-black w-8'
                      : 'bg-gray-300 w-2'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/properties"
              className="inline-block px-10 py-3 bg-black text-white font-bold hover:bg-gray-800 transition-all rounded-lg"
            >
              {t(data.topAreas)?.viewAllText}
            </Link>
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