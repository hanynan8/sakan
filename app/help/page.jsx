'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/* ═══════════════════════════════════════════════
   STATIC DATA (كانت جايه من /api/data?collection=help)
═══════════════════════════════════════════════ */
const HELP_DATA = {
  navbar: {
    brand: {
      logo: '',
      ar: {
        name: 'سكني'
      },
      en: {
        name: 'Sakani'
      }
    },
    ar: {
      helpLabel: 'مركز المساعدة'
    },
    en: {
      helpLabel: 'Help Center'
    },
    links: [
      {
        url: '/help/request',
        ar: {
          label: 'إرسال طلب'
        },
        en: {
          label: 'Submit a Request'
        }
      },
      {
        url: '/',
        ar: {
          label: 'العودة للموقع'
        },
        en: {
          label: 'Back to Site'
        }
      }
    ]
  },
  hero: {
    bgColor: '#e8445a',
    ar: {
      heading: 'مرحباً، كيف يمكننا مساعدتك؟',
      searchPlaceholder: 'ابحث عن مقالات المساعدة...'
    },
    en: {
      heading: 'Hello, how can we help you?',
      searchPlaceholder: 'Search for help articles...'
    }
  },
  categories: [
    {
      id: 'cat1',
      icon: 'info',
      url: '/help/getting-started',
      ar: {
        title: 'البدء مع سكني',
        description: 'تعلم كيفية إنشاء حسابك والبحث عن السكن المناسب خطوة بخطوة.'
      },
      en: {
        title: 'Getting Started',
        description: 'Learn how to create your account and find suitable accommodation step by step.'
      }
    },
    {
      id: 'cat2',
      icon: 'booking',
      url: '/help/bookings',
      ar: {
        title: 'الحجوزات',
        description: 'كل ما يتعلق بعملية الحجز، التأكيد، والتواصل مع أصحاب العقارات.'
      },
      en: {
        title: 'Bookings',
        description: 'Everything related to the booking process, confirmation, and communication with property owners.'
      }
    },
    {
      id: 'cat3',
      icon: 'offers',
      url: '/help/offers',
      ar: {
        title: 'العروض والخصومات',
        description: 'اكتشف أحدث العروض والكوبونات والخصومات المتاحة على المنصة.'
      },
      en: {
        title: 'Offers & Discounts',
        description: 'Discover the latest offers, coupons and discounts available on the platform.'
      }
    },
    {
      id: 'cat4',
      icon: 'cancel',
      url: '/help/cancellations',
      ar: {
        title: 'الإلغاء والاسترداد',
        description: 'فهم سياسة الإلغاء وكيفية استرداد المبالغ المدفوعة.'
      },
      en: {
        title: 'Cancellations & Refunds',
        description: 'Understand the cancellation policy and how to get refunds.'
      }
    },
    {
      id: 'cat5',
      icon: 'contact',
      url: '/help/contact',
      ar: {
        title: 'التواصل مع الدعم',
        description: 'تواصل مع فريق الدعم عبر الدردشة المباشرة، البريد الإلكتروني، أو الهاتف.'
      },
      en: {
        title: 'Contact Support',
        description: 'Contact the support team via live chat, email, or phone.'
      }
    },
    {
      id: 'cat6',
      icon: 'checklist',
      url: '/help/account',
      ar: {
        title: 'إدارة الحساب',
        description: 'إدارة معلوماتك الشخصية، كلمة المرور، وإعدادات الحساب.'
      },
      en: {
        title: 'Account Management',
        description: 'Manage your personal information, password, and account settings.'
      }
    }
  ],
  promotedArticles: [
    {
      url: '/help/how-to-book',
      ar: {
        title: 'كيفية إتمام عملية الحجز بنجاح'
      },
      en: {
        title: 'How to complete a booking successfully'
      }
    },
    {
      url: '/help/payment-methods',
      ar: {
        title: 'طرق الدفع المتاحة على سكني'
      },
      en: {
        title: 'Available payment methods on Sakani'
      }
    },
    {
      url: '/help/verified-properties',
      ar: {
        title: 'ما معنى العقار الموثق؟'
      },
      en: {
        title: 'What does a verified property mean?'
      }
    },
    {
      url: '/help/referral-program',
      ar: {
        title: 'برنامج الإحالة وكيفية الاستفادة منه'
      },
      en: {
        title: 'Referral program and how to benefit from it'
      }
    },
    {
      url: '/help/student-discounts',
      ar: {
        title: 'خصومات الطلاب المتاحة'
      },
      en: {
        title: 'Available student discounts'
      }
    },
    {
      url: '/help/safety-tips',
      ar: {
        title: 'نصائح الأمان عند الحجز'
      },
      en: {
        title: 'Safety tips when booking'
      }
    }
  ],
  footer: {
    brand: {
      logo: '',
      ar: {
        name: 'سكني'
      },
      en: {
        name: 'Sakani'
      }
    },
    ar: {
      copyright: '© {year} سكني. جميع الحقوق محفوظة.'
    },
    en: {
      copyright: '© {year} Sakani. All rights reserved.'
    },
    links: [
      {
        url: '/privacy',
        ar: {
          label: 'الخصوصية'
        },
        en: {
          label: 'Privacy'
        }
      },
      {
        url: '/terms',
        ar: {
          label: 'الشروط'
        },
        en: {
          label: 'Terms'
        }
      },
      {
        url: '/',
        ar: {
          label: 'الرئيسية'
        },
        en: {
          label: 'Home'
        }
      }
    ]
  }
};

export default function HelpCenterPage() {
  const data = HELP_DATA;
  const { language, toggleLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = (section) => (language === 'ar' ? section?.ar : section?.en);

  const filteredCategories = data?.categories?.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t(cat)?.title?.toLowerCase().includes(q) ||
      t(cat)?.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`min-h-screen bg-white font-sans flex flex-col ${language === 'ar' ? 'rtl' : 'ltr'}`}>

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <nav className={`bg-white sticky top-0 z-50 transition-shadow duration-200 ${scrolled ? 'shadow-sm' : 'border-b border-gray-200'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Logo + Title */}
            <a href="/" className="flex items-center gap-2 flex-shrink-0">
              {data.navbar?.brand?.logo ? (
                <img src={data.navbar.brand.logo} alt={t(data.navbar?.brand)?.name} className="h-7 w-auto" />
              ) : (
                <span className="text-xl font-black text-black tracking-tight">
                  {t(data.navbar?.brand)?.name}
                </span>
              )}
              <span className="text-gray-300 text-xl font-light mx-0.5">|</span>
              <span className="text-sm font-semibold text-gray-600 tracking-tight">
                {t(data.navbar)?.helpLabel}
              </span>
            </a>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-0.5">
              {data.navbar?.links?.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-black transition-colors rounded"
                >
                  {t(link)?.label}
                </a>
              ))}

              {/* Language toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2.5 py-1.5 ml-2 text-sm font-medium text-gray-600 hover:text-black border border-gray-200 hover:border-gray-400 transition-all rounded"
              >
                {language === 'ar' ? 'English' : 'عربي'}
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:text-black"
            >
              {mobileMenuOpen ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {data.navbar?.links?.map((link, i) => (
              <a key={i} href={link.url} className="block py-2 text-sm font-medium text-gray-700 hover:text-black">
                {t(link)?.label}
              </a>
            ))}
            <button onClick={toggleLanguage} className="pt-2 text-sm font-medium text-gray-600">
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════
          HERO — red banner with search
      ══════════════════════════════════════ */}
      <section
        className="relative py-14 md:py-20 overflow-hidden"
        style={{ backgroundColor: data.hero?.bgColor || '#e8445a' }}
      >
        {/* dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.4) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
            {t(data.hero)?.heading}
          </h1>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(data.hero)?.searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 text-sm text-gray-800 bg-white border-0 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-400"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CATEGORIES GRID
      ══════════════════════════════════════ */}
      <section className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {filteredCategories?.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories?.map((cat) => (
              <a
                key={cat.id}
                href={cat.url || '#'}
                className="group block p-6 border border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-md transition-all duration-200 bg-white"
              >
                {/* Icon */}
                <div className="mb-4 text-gray-500 group-hover:text-gray-800 transition-colors">
                  {cat.icon === 'info' && (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  )}
                  {cat.icon === 'booking' && (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  )}
                  {cat.icon === 'offers' && (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
                    </svg>
                  )}
                  {cat.icon === 'cancel' && (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {cat.icon === 'contact' && (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                    </svg>
                  )}
                  {cat.icon === 'checklist' && (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  )}
                  {/* fallback icon */}
                  {!['info','booking','offers','cancel','contact','checklist'].includes(cat.icon) && (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  )}
                </div>

                <h3 className="text-sm font-bold text-gray-900 mb-1.5 group-hover:text-black transition-colors">
                  {t(cat)?.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                  {t(cat)?.description}
                </p>
              </a>
            ))}
          </div>
        )}

        {/* Promoted Articles */}
        {data.promotedArticles && data.promotedArticles.length > 0 && (
          <div className="mt-14">
            <h2 className="text-base font-bold text-gray-800 mb-4">
              {language === 'ar' ? 'مقالات مميزة' : 'Promoted articles'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {data.promotedArticles.map((article, i) => (
                <a
                  key={i}
                  href={article.url || '#'}
                  className="py-2 text-sm text-gray-600 hover:text-black border-b border-gray-100 hover:border-gray-300 transition-colors flex items-center gap-2 group"
                >
                  <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  {t(article)?.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className={`flex flex-col md:flex-row items-center justify-between gap-4 ${language === 'ar' ? 'md:flex-row-reverse' : ''}`}>

            {/* Brand */}
            <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              {data.footer?.brand?.logo ? (
                <img src={data.footer.brand.logo} alt="" className="h-6 w-auto" />
              ) : (
                <span className="text-base font-black text-black tracking-tight">
                  {t(data.footer?.brand)?.name}
                </span>
              )}
              <span className="text-xs text-gray-400">{t(data.footer)?.copyright?.replace('{year}', new Date().getFullYear())}</span>
            </div>

            {/* Footer Links */}
            <div className={`flex flex-wrap items-center gap-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              {data.footer?.links?.map((link, i) => (
                <a key={i} href={link.url} className="text-xs text-gray-500 hover:text-black transition-colors">
                  {t(link)?.label}
                </a>
              ))}
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
}