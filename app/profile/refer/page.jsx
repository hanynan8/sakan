'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ReferPage() {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const ar = language === 'ar';

  const [copied, setCopied] = useState(false);

  const code         = session?.user?.referralCode     || '—';
  const count        = session?.user?.referralCount    || 0;
  const earnings     = session?.user?.referralEarnings || 0;
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${code}`
    : `/?ref=${code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl  = `https://wa.me/?text=${encodeURIComponent((ar ? 'سجّل باستخدام رابطي: ' : 'Sign up using my link: ') + referralLink)}`;
  const messengerUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(referralLink)}&app_id=181477095234103`;
  const gmailUrl     = `mailto:?subject=${encodeURIComponent(ar ? 'دعوة للتسجيل' : 'Join using my referral')}&body=${encodeURIComponent(referralLink)}`;

  return (
    <div className="min-h-screen bg-white" dir={ar ? 'rtl' : 'ltr'}>

      {/* ── HERO ── */}
      <div className="relative bg-gray-900 overflow-hidden min-h-[340px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/75 to-transparent" />

        {/* Coins */}
        <div className="absolute right-1/4 top-0 bottom-0 items-center pointer-events-none select-none hidden md:flex">
          <div className="relative w-72 h-72">
            {[
              { top: '8%',  left: '45%', size: 48, rotate: '-15deg', dur: '1.6s', delay: '0s'   },
              { top: '18%', left: '70%', size: 38, rotate: '10deg',  dur: '2.0s', delay: '0.2s' },
              { top: '38%', left: '18%', size: 54, rotate: '-5deg',  dur: '1.8s', delay: '0.1s' },
              { top: '55%', left: '58%', size: 42, rotate: '20deg',  dur: '2.2s', delay: '0.3s' },
              { top: '72%', left: '32%', size: 36, rotate: '-10deg', dur: '1.5s', delay: '0.15s'},
              { top: '22%', left: '85%', size: 32, rotate: '5deg',   dur: '1.9s', delay: '0.25s'},
            ].map((c, i) => (
              <div key={i} className="absolute animate-bounce"
                style={{ top: c.top, left: c.left, animationDuration: c.dur, animationDelay: c.delay }}>
                <svg width={c.size} height={c.size} viewBox="0 0 50 50" style={{ transform: `rotate(${c.rotate})` }}>
                  <ellipse cx="25" cy="25" rx="22" ry="22" fill="#D97706" />
                  <ellipse cx="25" cy="23" rx="22" ry="20" fill="#FBBF24" />
                  <ellipse cx="25" cy="22" rx="18" ry="16" fill="#F59E0B" />
                  <text x="25" y="27" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#78350F">£</text>
                </svg>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12 w-full">
          <div className="max-w-lg">
            <h1 className="text-4xl font-black text-white leading-tight mb-3">
              {ar
                ? <><span>أحل صديقاً،</span><br /><span>وكلاكما يكسب <span className="text-yellow-400">£50</span></span></>
                : <><span>Refer a friend, and</span><br /><span>you both get <span className="text-yellow-400">£50</span></span></>
              }
            </h1>
            <p className="text-gray-300 text-sm mb-8 leading-relaxed">
              {ar
                ? "لما صديقك يحجز، كلاكما يحصل على £50. استمر في المشاركة — لا حد للأرباح!"
                : "When your friend books, you both get £50. Keep sharing, keep earning — there's no limit!"
              }
            </p>

            {/* Card */}
            <div className="bg-white rounded-xl p-5 shadow-2xl w-full max-w-xs">
              <p className="text-xs font-semibold text-gray-500 mb-2">
                {ar ? 'رابط الدعوة الخاص بك' : 'Your referral link'}
              </p>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500 truncate mb-3 font-mono">
                {referralLink}
              </div>

              <button
                onClick={handleCopyLink}
                className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all mb-3 ${copied ? 'bg-green-500 text-white' : 'bg-rose-500 hover:bg-rose-600 text-white'}`}
              >
                {copied ? (ar ? '✓ تم النسخ' : '✓ Copied!') : (ar ? 'نسخ الرابط' : 'Copy Link')}
              </button>

              {/* Share icons */}
              <div className="flex items-center gap-2 mb-4">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center hover:opacity-90 transition-opacity">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
                <a href={messengerUrl} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center hover:opacity-90 transition-opacity">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.908 1.438 5.504 3.686 7.199v3.558l3.444-1.888c.919.252 1.892.388 2.87.388 5.523 0 10-4.145 10-9.257S17.523 2 12 2zm.979 12.465l-2.548-2.718-4.976 2.718 5.476-5.81 2.61 2.718 4.914-2.718-5.476 5.81z" />
                  </svg>
                </a>
                <a href={gmailUrl}
                  className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center hover:opacity-90 transition-opacity">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                  </svg>
                </a>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{count > 0 ? `${count}+` : '10,000+'}</p>
                    <p className="text-xs text-gray-400">{ar ? 'أشخاص تم دعوتهم' : 'People Referred'}</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-gray-900">£{earnings > 0 ? `${earnings}+` : '500K+'}</p>
                    <p className="text-xs text-gray-400">{ar ? 'إجمالي الأرباح' : 'Payout Disbursed'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10 space-y-10">

        {/* Your Referrals */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-1">{ar ? 'دعواتك' : 'Your Referrals'}</h2>
          <div className="border-t border-gray-200 pt-4">
            <div className="border border-gray-100 rounded-xl px-5 py-4 bg-gray-50 text-sm text-gray-500">
              {count === 0
                ? ar
                  ? <>ابدأ أول دعوة بمشاركة كودك الفريد مع أصدقائك واكسب <span className="text-rose-500 font-semibold">£50</span></>
                  : <>Initiate your first referral by sharing your unique referral code with your friends and earn <span className="text-rose-500 font-semibold">£50</span></>
                : ar
                  ? `لديك ${count} دعوة ناجحة — إجمالي أرباحك: £${earnings}`
                  : `You have ${count} successful referral(s) — Total earnings: £${earnings}`
              }
            </div>
          </div>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            {ar ? 'الأمر بسيط كـ 1، 2، 3' : 'Referring is as easy as 1,2,3'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
            {[
              {
                step: 1,
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>,
                en: { title: 'You Share', desc: 'Share your unique referral link with anyone looking for an accommodation' },
                ar: { title: 'تشارك', desc: 'شارك رابطك الفريد مع أي شخص يبحث عن سكن' },
              },
              {
                step: 2,
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
                en: { title: 'They Book', desc: 'When they book using your link, they get £50.' },
                ar: { title: 'يحجزون', desc: 'لما يحجزوا باستخدام رابطك، يحصلون على £50.' },
              },
              {
                step: 3,
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                en: { title: 'You Earn', desc: "You earn an easy £50 (there's no limit- more referrals = more cash!)" },
                ar: { title: 'تكسب', desc: 'تكسب £50 بسهولة — لا حد، كلما زادت الدعوات زاد الكسب!' },
              },
            ].map((item, i) => (
              <div key={i} className="relative flex items-stretch">
                <div className="flex-1 border border-gray-200 rounded-xl p-5 m-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-gray-400 w-4">{item.step}</span>
                    <span className="text-gray-500">{item.icon}</span>
                  </div>
                  <p className="font-bold text-gray-900 text-sm mb-1">{ar ? item.ar.title : item.en.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{ar ? item.ar.desc : item.en.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden sm:flex items-center justify-center w-4 flex-shrink-0 text-gray-300 z-10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={ar ? "M15.75 19.5L8.25 12l7.5-7.5" : "M8.25 4.5l7.5 7.5-7.5 7.5"} />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Terms */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">{ar ? 'الشروط والأحكام' : 'Terms and Conditions'}</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            {[
              { en: 'You can refer multiple friends and win cashback upto GBP 10,000.', ar: 'يمكنك دعوة أصدقاء متعددين وكسب حتى 10,000 جنيه إسترليني.' },
              { en: 'The referred student must be a new user, not an existing student registered.', ar: 'يجب أن يكون الشخص المُحال مستخدماً جديداً غير مسجل.' },
              { en: 'The referred student must book in the property that is listed.', ar: 'يجب أن يحجز الشخص المُحال في عقار مدرج.' },
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                {ar ? t.ar : t.en}
                {i === 2 && (
                  <button className="text-rose-500 font-semibold text-sm hover:underline whitespace-nowrap">
                    {ar ? 'اقرأ المزيد ↓' : 'See More ↓'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  );
}