'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HowItWorksPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('student');
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data?collection=howItWorks');
      const result = await response.json();
      setData(result[0]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const t = (section) => language === 'ar' ? section?.ar : section?.en;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#e8445a', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">لا توجد بيانات</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white font-sans ${language === 'ar' ? 'rtl' : 'ltr'}`}>

      {/* ── HERO ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <span
          className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 mb-5"
          style={{ color: '#e8445a', backgroundColor: '#fef2f2' }}
        >
          {t(data.hero)?.badge}
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-black mb-4 leading-tight">
          {t(data.hero)?.title}
        </h1>
        <p className="text-base text-gray-500 font-medium max-w-xl mx-auto mb-8">
          {t(data.hero)?.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={data.hero?.primaryCtaUrl || '/properties'}
            className="px-8 py-3 text-sm text-white font-bold hover:opacity-90 transition-all"
            style={{ backgroundColor: '#e8445a' }}
          >
            {t(data.hero)?.primaryCta}
          </a>
          <a
            href={data.hero?.secondaryCtaUrl || '/list-property'}
            className="px-8 py-3 text-sm border-2 border-black text-black font-bold hover:bg-black hover:text-white transition-all"
          >
            {t(data.hero)?.secondaryCta}
          </a>
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* ── TABS + STEPS ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Tab switcher */}
        <div className="flex justify-center mb-10">
          <div className="flex border border-gray-200 p-0.5 gap-0.5">
            {['student', 'owner'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-6 py-2 text-sm font-bold transition-all"
                style={activeTab === tab
                  ? { backgroundColor: '#e8445a', color: 'white' }
                  : { backgroundColor: 'transparent', color: '#9ca3af' }
                }
              >
                {tab === 'student' ? t(data.tabs)?.studentLabel : t(data.tabs)?.ownerLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gray-200 -z-0 mx-24" />

          {(activeTab === 'student' ? data.studentSteps : data.ownerSteps)?.map((step, index) => (
            <div key={step.id} className="text-center relative z-10">
              <div
                className="w-16 h-16 mx-auto mb-4 flex items-center justify-center text-2xl font-black text-white"
                style={{ backgroundColor: '#e8445a' }}
              >
                {step.stepNumber}
              </div>
              <h4 className="text-sm font-bold text-black mb-2">{t(step)?.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{t(step)?.description}</p>
            </div>
          ))}
        </div>

        {/* Tab CTA */}
        <div className="text-center mt-10">
          <a
            href={activeTab === 'student' ? (data.tabs?.studentCtaUrl || '/properties') : (data.tabs?.ownerCtaUrl || '/list-property')}
            className="inline-block px-8 py-2.5 text-sm border-2 font-bold transition-all"
            style={{ borderColor: '#e8445a', color: '#e8445a' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e8445a'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#e8445a'; }}
          >
            {activeTab === 'student' ? t(data.tabs)?.studentCta : t(data.tabs)?.ownerCta}
          </a>
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* ── FEATURES ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-black mb-2">{t(data.features)?.sectionTitle}</h2>
          <p className="text-sm text-gray-500 font-medium">{t(data.features)?.sectionSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.features?.items?.map((feature) => (
            <div
              key={feature.id}
              className="p-5 border-2 border-gray-200 hover:border-black transition-all duration-200"
            >
              <div
                className="w-8 h-8 mb-4 flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: '#e8445a' }}
              >
                {feature.icon === 'shield' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286z" />
                  </svg>
                )}
                {feature.icon === 'search' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
                {feature.icon === 'chat' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                )}
                {feature.icon === 'map' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                  </svg>
                )}
                {feature.icon === 'star' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                )}
                {feature.icon === 'money' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                )}
              </div>
              <h4 className="text-sm font-bold text-black mb-1">{t(feature)?.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{t(feature)?.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* ── STATS ── */}
      <section className="py-10" style={{ backgroundColor: '#e8445a' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {data.stats?.map((stat, index) => (
              <div
                key={index}
                className={`text-center ${
                  language === 'ar'
                    ? index !== 0 ? 'border-r border-white border-opacity-30' : ''
                    : index !== data.stats.length - 1 ? 'border-r border-white border-opacity-30' : ''
                }`}
              >
                <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat.number}</div>
                <div className="text-xs text-red-100 font-medium">{t(stat)?.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* ── FAQ ── */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-black mb-2">{t(data.faq)?.sectionTitle}</h2>
          <p className="text-sm text-gray-500 font-medium">{t(data.faq)?.sectionSubtitle}</p>
        </div>

        <div className="space-y-2">
          {data.faq?.items?.map((item, index) => (
            <div key={index} className="border border-gray-200 hover:border-gray-400 transition-all">
              <button
                className="w-full flex items-center justify-between px-5 py-3.5 text-left"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span className="font-bold text-black text-sm">{t(item)?.question}</span>
                <span
                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-white ml-3 transition-transform duration-200"
                  style={{
                    backgroundColor: '#e8445a',
                    transform: openFaq === index ? 'rotate(45deg)' : 'rotate(0deg)'
                  }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </button>
              {openFaq === index && (
                <div className="px-5 pb-4 border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-600 leading-relaxed">{t(item)?.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* ── CTA ── */}
      <section className="bg-black py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
            {t(data.cta)?.title}
          </h2>
          <p className="text-sm text-gray-400 mb-8 font-medium">
            {t(data.cta)?.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={data.cta?.studentUrl || '/properties'}
              className="px-8 py-3 text-sm text-white font-bold hover:opacity-90 transition-all"
              style={{ backgroundColor: '#e8445a' }}
            >
              {t(data.cta)?.studentBtn}
            </a>
            <a
              href={data.cta?.ownerUrl || '/list-property'}
              className="px-8 py-3 text-sm border-2 border-white text-white font-bold hover:bg-white hover:text-black transition-all"
            >
              {t(data.cta)?.ownerBtn}
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}