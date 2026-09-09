'use client';

import { useLanguage } from '@/contexts/LanguageContext';

/* ═══════════════════════════════════════════════
   STATIC FOOTER DATA (كانت جايه من /api/data?collection=footer)
═══════════════════════════════════════════════ */
const FOOTER_DATA = {
  newsletter: {
    ar: {
      title: 'اشترك في نشرتنا البريدية',
      subtitle: 'احصل على أحدث العروض والأخبار مباشرة في بريدك',
      placeholder: 'بريدك الإلكتروني...',
      buttonText: 'اشترك'
    },
    en: {
      title: 'Subscribe to our newsletter',
      subtitle: 'Get the latest offers and news directly to your inbox',
      placeholder: 'Your email address...',
      buttonText: 'Subscribe'
    }
  },
  brand: {
    logo: '',
    ar: {
      name: 'سكني',
      description: 'المنصة الأولى لإيجاد السكن الطلابي المثالي بالقرب من جامعتك بأفضل الأسعار.'
    },
    en: {
      name: 'Sakani',
      description: 'The leading platform for finding the perfect student accommodation near your university at the best prices.'
    },
    socialLinks: [
      {
        platform: 'facebook',
        url: 'https://facebook.com/sakani'
      },
      {
        platform: 'instagram',
        url: 'https://instagram.com/sakani'
      },
      {
        platform: 'twitter',
        url: 'https://twitter.com/sakani'
      },
      {
        platform: 'whatsapp',
        url: 'https://wa.me/201000000000'
      },
      {
        platform: 'youtube',
        url: 'https://youtube.com/@sakani'
      }
    ]
  },
  linkGroups: [
    {
      ar: {
        title: 'الموقع'
      },
      en: {
        title: 'Site'
      },
      links: [
        {
          url: '/',
          ar: {
            label: 'الرئيسية'
          },
          en: {
            label: 'Home'
          }
        },
        {
          url: '/properties',
          ar: {
            label: 'العقارات'
          },
          en: {
            label: 'Properties'
          }
        },
        {
          url: '/help/how-it-works',
          ar: {
            label: 'كيف يعمل'
          },
          en: {
            label: 'How It Works'
          },
          badge: 'NEW'
        },
        {
          url: '/help/blog',
          ar: {
            label: 'المدونة'
          },
          en: {
            label: 'Blog'
          }
        }
      ]
    },
    {
      ar: {
        title: 'الدعم'
      },
      en: {
        title: 'Support'
      },
      links: [
        {
          url: '/help',
          ar: {
            label: 'مركز المساعدة'
          },
          en: {
            label: 'Help Center'
          }
        },
        {
          url: '/submit-request',
          ar: {
            label: 'إرسال طلب'
          },
          en: {
            label: 'Submit Request'
          }
        },
        {
          url: '/refer',
          ar: {
            label: 'أحل صديقاً'
          },
          en: {
            label: 'Refer a Friend'
          }
        }
      ]
    },
    {
      ar: {
        title: 'قانوني'
      },
      en: {
        title: 'Legal'
      },
      links: [
        {
          url: '/privacy',
          ar: {
            label: 'سياسة الخصوصية'
          },
          en: {
            label: 'Privacy Policy'
          }
        },
        {
          url: '/terms',
          ar: {
            label: 'الشروط والأحكام'
          },
          en: {
            label: 'Terms & Conditions'
          }
        },
        {
          url: '/cookies',
          ar: {
            label: 'سياسة الكوكيز'
          },
          en: {
            label: 'Cookie Policy'
          }
        }
      ]
    }
  ],
  contactInfo: [
    {
      type: 'phone',
      ar: {
        label: 'الهاتف',
        value: '+20 100 000 0000'
      },
      en: {
        label: 'Phone',
        value: '+20 100 000 0000'
      }
    },
    {
      type: 'email',
      ar: {
        label: 'البريد الإلكتروني',
        value: 'support@sakani.com'
      },
      en: {
        label: 'Email',
        value: 'support@sakani.com'
      }
    },
    {
      type: 'location',
      ar: {
        label: 'الموقع',
        value: 'القاهرة، مصر'
      },
      en: {
        label: 'Location',
        value: 'Cairo, Egypt'
      }
    }
  ],
  bottomBar: {
    ar: {
      copyright: '© {year} سكني. جميع الحقوق محفوظة.'
    },
    en: {
      copyright: '© {year} Sakani. All rights reserved.'
    },
    legalLinks: [
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
        url: '/sitemap',
        ar: {
          label: 'خريطة الموقع'
        },
        en: {
          label: 'Sitemap'
        }
      }
    ]
  }
};

export default function Footer() {
  const data = FOOTER_DATA;
  const { language } = useLanguage();

  const t = (section) => language === 'ar' ? section?.ar : section?.en;

  return (
    <footer className={`bg-gray-800 text-white font-sans ${language === 'ar' ? 'rtl' : 'ltr'}`}>

      {/* Top Newsletter Strip */}
      <div className="border-b border-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className={`flex flex-col md:flex-row items-center justify-between gap-4 ${language === 'ar' ? 'md:flex-row-reverse' : ''}`}>
            <div className={language === 'ar' ? 'text-right' : 'text-left'}>
              <h4 className="text-lg font-black text-white mb-0.5">
                {t(data.newsletter)?.title}
              </h4>
              <p className="text-gray-400 text-xs">
                {t(data.newsletter)?.subtitle}
              </p>
            </div>
            <div className={`flex gap-2 w-full md:w-auto ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              <input
                type="email"
                placeholder={t(data.newsletter)?.placeholder}
                className="flex-1 md:w-64 px-4 py-2.5 bg-gray-700 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 border border-gray-600"
              />
              <button className="px-6 py-2.5 bg-white text-gray-900 font-bold text-sm hover:bg-gray-200 transition-all whitespace-nowrap">
                {t(data.newsletter)?.buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 ${language === 'ar' ? 'text-right' : 'text-left'}`}>

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className={`flex items-center gap-2 mb-3 ${language === 'ar' ? 'flex-row-reverse justify-end' : ''}`}>
              {/* {data.brand?.logo && (
                <img src={data.brand.logo} alt="Logo" className="h-7 w-auto" />
              )} */}
              <span className="text-lg font-black text-white tracking-tight">
                {t(data.brand)?.name}
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-4 max-w-xs">
              {t(data.brand)?.description}
            </p>

            {/* Social Icons */}
            <div className={`flex gap-2 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
              {data.brand?.socialLinks?.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.platform}
                  className="w-8 h-8 border border-gray-600 flex items-center justify-center text-gray-400 hover:border-gray-300 hover:text-white transition-all"
                >
                  {social.platform === 'facebook' && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  )}
                  {social.platform === 'instagram' && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                    </svg>
                  )}
                  {social.platform === 'twitter' && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )}
                  {social.platform === 'whatsapp' && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  )}
                  {social.platform === 'youtube' && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {data.linkGroups?.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h5 className="text-gray-200 font-bold text-xs uppercase tracking-widest mb-4 pb-2 border-b border-gray-600">
                {t(group)?.title}
              </h5>
              <ul className="space-y-2.5">
                {group.links?.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.url}
                      className="text-gray-400 hover:text-white text-xs font-medium transition-colors flex items-center gap-2"
                    >
                      {language === 'ar' ? (
                        <>
                          <span>{t(link)?.label}</span>
                          {link.badge && (
                            <span className="text-xs bg-gray-600 text-white px-1.5 py-0.5 font-bold">
                              {link.badge}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          {link.badge && (
                            <span className="text-xs bg-gray-600 text-white px-1.5 py-0.5 font-bold">
                              {link.badge}
                            </span>
                          )}
                          <span>{t(link)?.label}</span>
                        </>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>
      </div>

      {/* Contact Bar */}
      <div className="border-t border-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {data.contactInfo?.map((item, index) => (
              <div key={index} className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 border border-gray-600 flex items-center justify-center flex-shrink-0">
                  {item.type === 'phone' && (
                    <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  )}
                  {item.type === 'email' && (
                    <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  {item.type === 'location' && (
                    <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {t(item)?.label}
                  </div>
                  <div className="text-gray-200 text-xs font-bold">
                    {t(item)?.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-600 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className={`flex flex-col md:flex-row items-center justify-between gap-3 ${language === 'ar' ? 'md:flex-row-reverse' : ''}`}>
            <p className="text-gray-500 text-xs">
              {t(data.bottomBar)?.copyright?.replace('{year}', new Date().getFullYear())}
            </p>
            <div className={`flex flex-wrap gap-5 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              {data.bottomBar?.legalLinks?.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
                >
                  {t(link)?.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}