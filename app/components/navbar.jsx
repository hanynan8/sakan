'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

/* ─────────────────────────────────────────────
   Small reusable input with optional show/hide
───────────────────────────────────────────── */
function Field({ label, type = 'text', value, onChange, placeholder, required, autoComplete }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full px-3 py-2 text-sm border border-gray-300 bg-gray-50 text-black placeholder-gray-400 focus:outline-none focus:border-gray-800 focus:bg-white transition-all rounded"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute inset-y-0 right-2.5 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
          >
            {show ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {message}
    </div>
  );
}

function SubmitBtn({ loading, label, loadingLabel }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-2.5 bg-black text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all rounded flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {loadingLabel}
        </>
      ) : label}
    </button>
  );
}

/* ═══════════════════════════════════════════════
   MAIN NAVBAR
═══════════════════════════════════════════════ */
function NavbarContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language, toggleLanguage } = useLanguage();

  const [supportOpen, setSupportOpen]       = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');
  const [scrolled, setScrolled]             = useState(false);
  const [userMenuOpen, setUserMenuOpen]     = useState(false);

  const [modal, setModal] = useState(null);

  const [siForm, setSiForm]       = useState({ identifier: '', password: '' });
  const [siError, setSiError]     = useState('');
  const [siLoading, setSiLoading] = useState(false);

  const [suForm, setSuForm] = useState({
    firstName: '', lastName: '', identifier: '', password: '', referralCode: ''
  });
  const [suError, setSuError]     = useState('');
  const [suLoading, setSuLoading] = useState(false);

  const supportRef  = useRef(null);
  const userMenuRef = useRef(null);

  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  const ar = language === 'ar';
  const t  = (section) => ar ? section?.ar : section?.en;

  // ── احفظ كود الدعوة من الـ URL في localStorage ──
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      localStorage.setItem('referralCode', ref.toUpperCase());
      localStorage.setItem('referralExpiry', Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }, [searchParams]);

  const closeModal = () => {
    setModal(null);
    setSiError(''); setSiForm({ identifier: '', password: '' });
    setSuError(''); setSuForm({ firstName: '', lastName: '', identifier: '', password: '', referralCode: '' });
  };

  // ── فتح Sign Up مع تملية الكود تلقائياً ──
  const openSignUp = () => {
    const savedCode   = localStorage.getItem('referralCode');
    const savedExpiry = localStorage.getItem('referralExpiry');
    const isValid     = savedExpiry && Date.now() < parseInt(savedExpiry);
    setSuForm({
      firstName: '', lastName: '', identifier: '', password: '',
      referralCode: (savedCode && isValid) ? savedCode : ''
    });
    setModal('signup');
  };

  const isEmail = (val) => /\S+@\S+\.\S+/.test(val);

  useEffect(() => {
    fetchData();
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    const onClickOutside = (e) => {
      if (supportRef.current  && !supportRef.current.contains(e.target))  setSupportOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  const fetchData = async () => {
    try {
      const res    = await fetch('/api/data?collection=Navbar');
      const result = await res.json();
      setData(result[0]);
    } catch (err) {
      console.error('Navbar fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ── SIGN IN ── */
  const handleSignIn = async (e) => {
    e.preventDefault();
    setSiError('');
    setSiLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect:   false,
        identifier: siForm.identifier,
        password:   siForm.password,
      });
      if (!result || result.error) {
        setSiError(ar ? 'البريد/الرقم أو كلمة المرور غير صحيحة' : 'Incorrect email/phone or password');
      } else {
        closeModal();
      }
    } catch {
      setSiError(ar ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred, try again');
    } finally {
      setSiLoading(false);
    }
  };

  /* ── SIGN UP ── */
  const handleSignUp = async (e) => {
    e.preventDefault();
    setSuError('');

    if (suForm.password.length < 8) {
      setSuError(ar ? 'كلمة المرور لازم تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }
    if (!/[A-Z]/.test(suForm.password)) {
      setSuError(ar ? 'لازم تحتوي على حرف كبير واحد على الأقل' : 'Must contain at least one uppercase letter');
      return;
    }
    if (!/[0-9]/.test(suForm.password)) {
      setSuError(ar ? 'لازم تحتوي على رقم واحد على الأقل' : 'Must contain at least one number');
      return;
    }

    setSuLoading(true);
    try {
      const payload = {
        firstName:    suForm.firstName.trim(),
        lastName:     suForm.lastName.trim(),
        password:     suForm.password,
        referralCode: suForm.referralCode.trim() || undefined,
        ...(isEmail(suForm.identifier)
          ? { email: suForm.identifier.trim() }
          : { phone: suForm.identifier.trim() }),
      };

      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSuError(body.message || (ar ? 'فشل إنشاء الحساب' : 'Failed to create account'));
        return;
      }

      const signInResult = await signIn('credentials', {
        redirect:   false,
        identifier: suForm.identifier,
        password:   suForm.password,
      });

      if (signInResult?.error) {
        setModal('signin');
        setSiForm({ identifier: suForm.identifier, password: '' });
        setSuForm({ firstName: '', lastName: '', identifier: '', password: '', referralCode: '' });
      } else {
        // امسح الكود بعد استخدامه
        localStorage.removeItem('referralCode');
        localStorage.removeItem('referralExpiry');
        closeModal();
      }
    } catch {
      setSuError(ar ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred, try again');
    } finally {
      setSuLoading(false);
    }
  };

  const userMenuItems = [
    {
      label: { ar: 'الملف الشخصي', en: 'Profile' },
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      href: '/profile',
    },
    {
      label: { ar: 'الإعدادات', en: 'Settings' },
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: '/settings',
    },
    {
      label: { ar: 'حجوزاتي', en: 'My Bookings' },
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      href: '/my-bookings',
    },
  ];

  if (loading || !data) return <nav className="h-14 bg-white border-b border-gray-200 sticky top-0 z-50" />;

  return (
    <>
      {/* ══════════════ NAVBAR ══════════════ */}
      <nav
        className={`bg-white sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-sm' : 'border-b border-gray-200'} font-sans`}
        dir={ar ? 'rtl' : 'ltr'}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 gap-3">

            {/* Logo */}
            <a href="/" className="flex-shrink-0 flex items-center gap-2">
              {data.brand?.logo
                ? <img src={data.brand.logo} alt={t(data.brand)?.name} className="h-7 w-auto" />
                : <span className="text-xl font-black text-black tracking-tight">{t(data.brand)?.name}</span>
              }
            </a>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-3 hidden md:block">
              <div className="relative flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t(data.search)?.placeholder}
                  className={`w-full px-3 py-1.5 text-sm border border-gray-300 bg-gray-50 text-black placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:bg-white transition-all ${ar ? 'rounded-r text-right' : 'rounded-l'}`}
                />
                <button className={`px-3 bg-black text-white hover:bg-gray-800 transition-all flex-shrink-0 ${ar ? 'rounded-l' : 'rounded-r'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right actions */}
            <div className={`flex items-center gap-1.5 flex-shrink-0 ${ar ? 'mr-auto' : 'ml-auto'}`}>

              {/* Support dropdown */}
              <div className="relative hidden md:block" ref={supportRef}>
                <button
                  onClick={() => setSupportOpen(!supportOpen)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:text-black transition-colors rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0118 0v6" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
                  </svg>
                  <span>{t(data.support)?.label}</span>
                  <svg className={`w-3 h-3 transition-transform duration-200 ${supportOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {supportOpen && (
                  <div className={`absolute top-full mt-1 bg-white border border-gray-200 shadow-lg z-50 overflow-hidden ${ar ? 'left-0' : 'right-0'}`} style={{ width: '380px' }}>
                    <div className="flex">
                      <div className="flex-1 py-3">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 px-4">{t(data.support)?.supportNowLabel}</p>
                        {data.support?.supportNow?.map((item, i) => (
                          <a key={i} href={item.url} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-2.5">
                              <span className="text-gray-400 group-hover:text-gray-700 transition-colors flex-shrink-0">
                                {item.type === 'whatsapp' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>}
                                {item.type === 'messenger' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.908 1.438 5.504 3.686 7.199v3.558l3.444-1.888c.919.252 1.892.388 2.87.388 5.523 0 10-4.145 10-9.257S17.523 2 12 2zm.979 12.465l-2.548-2.718-4.976 2.718 5.476-5.81 2.61 2.718 4.914-2.718-5.476 5.81z" /></svg>}
                                {item.type === 'email' && <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                                {item.type === 'chat' && <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                              </span>
                              <span className="text-sm text-gray-700 group-hover:text-black transition-colors">{t(item)?.label}</span>
                            </div>
                            {item.badge && (
                              <span className={`text-xs font-semibold px-2 py-0.5 ${item.badge === 'online' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                {item.badge === 'online' ? (ar ? 'متاح' : 'Online') : item.badge}
                              </span>
                            )}
                          </a>
                        ))}
                      </div>
                      <div className="w-px bg-gray-200 my-3" />
                      <div className="flex-1 py-3">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 px-4">{t(data.support)?.quickLinksLabel}</p>
                        {data.support?.quickLinks?.map((link, i) => (
                          <a key={i} href={link.url} className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 transition-colors group">
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-sm text-gray-700 group-hover:text-black">{t(link)?.label}</span>
                          </a>
                        ))}
                        {data.support?.phone && (
                          <div className="mx-4 mt-2 pt-2 border-t border-gray-200 flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            <span className="text-sm font-semibold text-black">{data.support.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Language toggle */}
              <button
                onClick={toggleLanguage}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:text-black border border-gray-200 hover:border-gray-400 transition-all rounded"
              >
                {ar ? 'English' : 'عربي'}
              </button>

              {/* ─── AUTH AREA ─── */}
              {status === 'loading' ? (
                <div className="hidden md:flex gap-1.5">
                  <div className="w-16 h-8 bg-gray-100 animate-pulse rounded" />
                  <div className="w-20 h-8 bg-gray-100 animate-pulse rounded" />
                </div>
              ) : session ? (
                <div className="relative hidden md:block" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:text-black border border-gray-200 hover:border-gray-400 transition-all rounded"
                  >
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="max-w-[80px] truncate">
                      {ar ? 'أهلاً' : 'Hi'}, {session.user?.name?.split(' ')[0]}
                    </span>
                    <svg className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <div className={`absolute top-full mt-1 bg-white border border-gray-200 shadow-lg z-50 overflow-hidden rounded w-48 ${ar ? 'left-0' : 'right-0'}`}>
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-500">{ar ? 'مسجل كـ' : 'Signed in as'}</p>
                        <p className="text-sm font-semibold text-black truncate">{session.user?.name}</p>
                      </div>
                      <div className="py-1">
                        {userMenuItems.map((item, i) => (
                          <a key={i} href={item.href} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors group">
                            <span className="text-gray-400 group-hover:text-gray-700 transition-colors">{item.icon}</span>
                            <span>{ar ? item.label.ar : item.label.en}</span>
                          </a>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 py-1">
                        <button onClick={() => { signOut(); setUserMenuOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          {ar ? 'تسجيل الخروج' : 'Sign Out'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-1.5">
                  <button
                    onClick={() => setModal('signin')}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-black border border-gray-200 hover:border-gray-400 transition-all rounded"
                  >
                    {ar ? 'تسجيل الدخول' : 'Sign In'}
                  </button>
                  <button
                    onClick={openSignUp}
                    className="px-3 py-1.5 text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-all rounded"
                  >
                    {ar ? 'إنشاء حساب' : 'Sign Up'}
                  </button>
                </div>
              )}

              {/* Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex md:hidden items-center justify-center w-8 h-8 border border-gray-200 text-gray-500 hover:text-black hover:border-gray-400 transition-all rounded"
              >
                {mobileMenuOpen
                  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white" dir={ar ? 'rtl' : 'ltr'}>
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="relative flex">
                <input type="text" placeholder={t(data.search)?.placeholder} className={`w-full px-3 py-2 text-sm border border-gray-300 bg-gray-50 text-black placeholder-gray-400 focus:outline-none focus:border-gray-500 ${ar ? 'rounded-r' : 'rounded-l'}`} />
                <button className={`px-3 bg-black text-white flex-shrink-0 ${ar ? 'rounded-l' : 'rounded-r'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
            </div>
            <div className="px-4 py-2 border-b border-gray-100">
              {data.support?.supportNow?.map((item, i) => (
                <a key={i} href={item.url} className="flex items-center gap-2 py-2 text-sm text-gray-700">{t(item)?.label}</a>
              ))}
              {data.support?.quickLinks?.map((link, i) => (
                <a key={i} href={link.url} className="block py-2 text-sm text-gray-700">{t(link)?.label}</a>
              ))}
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between gap-2">
              <button onClick={toggleLanguage} className="text-sm font-medium text-gray-600">{ar ? 'English' : 'العربية'}</button>
              {session ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">{ar ? 'أهلاً' : 'Hi'}, {session.user?.name?.split(' ')[0]}</span>
                  <button onClick={() => signOut()} className="text-sm font-medium text-red-600">{ar ? 'خروج' : 'Sign Out'}</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setMobileMenuOpen(false); setModal('signin'); }} className="text-sm font-medium text-gray-700 border border-gray-300 px-3 py-1.5 rounded">{ar ? 'دخول' : 'Sign In'}</button>
                  <button onClick={() => { setMobileMenuOpen(false); openSignUp(); }} className="text-sm font-semibold bg-black text-white px-3 py-1.5 rounded">{ar ? 'حساب جديد' : 'Sign Up'}</button>
                </div>
              )}
            </div>
            {session && (
              <div className="px-4 pb-3 border-t border-gray-100">
                {userMenuItems.map((item, i) => (
                  <a key={i} href={item.href} className="flex items-center gap-2 py-2 text-sm text-gray-700">
                    {item.icon}
                    <span>{ar ? item.label.ar : item.label.en}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* ══════════════ AUTH MODAL ══════════════ */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir={ar ? 'rtl' : 'ltr'}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-sm shadow-2xl rounded overflow-hidden">
            <div className="flex border-b border-gray-200">
              {['signin', 'signup'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setModal(tab); setSiError(''); setSuError(''); }}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${modal === tab ? 'text-black border-b-2 border-black bg-white' : 'text-gray-400 hover:text-gray-600 bg-gray-50'}`}
                >
                  {tab === 'signin' ? (ar ? 'تسجيل الدخول' : 'Sign In') : (ar ? 'إنشاء حساب' : 'Sign Up')}
                </button>
              ))}
              <button onClick={closeModal} className="px-3 text-gray-400 hover:text-black transition-colors bg-gray-50 border-b border-gray-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ── SIGN IN ── */}
            {modal === 'signin' && (
              <form onSubmit={handleSignIn} className="px-6 py-5 space-y-4">
                <Field
                  label={ar ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email or Phone Number'}
                  value={siForm.identifier}
                  onChange={(e) => setSiForm({ ...siForm, identifier: e.target.value })}
                  placeholder={ar ? 'example@mail.com أو 010xxxxxxxx' : 'example@mail.com or 010xxxxxxxx'}
                  autoComplete="username"
                  required
                />
                <Field
                  label={ar ? 'كلمة المرور' : 'Password'}
                  type="password"
                  value={siForm.password}
                  onChange={(e) => setSiForm({ ...siForm, password: e.target.value })}
                  placeholder={ar ? 'أدخل كلمة المرور' : 'Enter your password'}
                  autoComplete="current-password"
                  required
                />
                <ErrorBanner message={siError} />
                <SubmitBtn loading={siLoading} label={ar ? 'تسجيل الدخول' : 'Sign In'} loadingLabel={ar ? 'جارٍ الدخول...' : 'Signing in...'} />
                <p className="text-center text-xs text-gray-500">
                  {ar ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
                  <button type="button" onClick={() => { openSignUp(); setSiError(''); }} className="font-semibold text-black underline underline-offset-2">
                    {ar ? 'إنشاء حساب' : 'Sign Up'}
                  </button>
                </p>
              </form>
            )}

            {/* ── SIGN UP ── */}
            {modal === 'signup' && (
              <form onSubmit={handleSignUp} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label={ar ? 'الاسم الأول *' : 'First Name *'}
                    value={suForm.firstName}
                    onChange={(e) => setSuForm({ ...suForm, firstName: e.target.value })}
                    placeholder={ar ? 'محمد' : 'John'}
                    autoComplete="given-name"
                    required
                  />
                  <Field
                    label={ar ? 'الاسم الأخير *' : 'Last Name *'}
                    value={suForm.lastName}
                    onChange={(e) => setSuForm({ ...suForm, lastName: e.target.value })}
                    placeholder={ar ? 'أحمد' : 'Doe'}
                    autoComplete="family-name"
                    required
                  />
                </div>
                <Field
                  label={ar ? 'البريد الإلكتروني أو رقم الهاتف *' : 'Email or Phone Number *'}
                  value={suForm.identifier}
                  onChange={(e) => setSuForm({ ...suForm, identifier: e.target.value })}
                  placeholder={ar ? 'example@mail.com أو 010xxxxxxxx' : 'example@mail.com or 010xxxxxxxx'}
                  autoComplete="username"
                  required
                />
                <Field
                  label={ar ? 'كلمة المرور *' : 'Password *'}
                  type="password"
                  value={suForm.password}
                  onChange={(e) => setSuForm({ ...suForm, password: e.target.value })}
                  placeholder={ar ? '8 أحرف، حرف كبير، ورقم' : '8+ chars, uppercase & number'}
                  autoComplete="new-password"
                  required
                />
                {/* referralCode بيتبعت في الـ payload من localStorage بس — مش field ظاهر */}
                <ErrorBanner message={suError} />
                <SubmitBtn loading={suLoading} label={ar ? 'إنشاء الحساب' : 'Create Account'} loadingLabel={ar ? 'جارٍ الإنشاء...' : 'Creating...'} />
                <p className="text-center text-xs text-gray-500">
                  {ar ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                  <button type="button" onClick={() => { setModal('signin'); setSuError(''); }} className="font-semibold text-black underline underline-offset-2">
                    {ar ? 'تسجيل الدخول' : 'Sign In'}
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════
   DEFAULT EXPORT — wrapped in Suspense because
   NavbarContent uses useSearchParams()
═══════════════════════════════════════════════ */








export default function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarContent />
    </Suspense>
  );
}