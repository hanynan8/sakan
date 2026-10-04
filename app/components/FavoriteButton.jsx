// path: app/components/FavoriteButton.jsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useLanguage } from '@/contexts/LanguageContext';

// زر القلب (إضافة/إزالة من المفضلة). بيشتغل جوه كروت متغلفة بـ <Link> من غير ما يفتح الصفحة.
export default function FavoriteButton({ propertyId, className = '', size = 'md' }) {
  const { isFav, toggle } = useFavorites();
  const { language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const ar = language === 'ar';
  const active = isFav(propertyId);

  const onClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggle(propertyId);
    if (!result.ok && result.reason === 'auth') {
      router.push(`/signin?callbackUrl=${encodeURIComponent(pathname || '/')}`);
    }
  };

  const dim = size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const icon = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? (ar ? 'إزالة من المفضلة' : 'Remove from shortlist') : (ar ? 'إضافة للمفضلة' : 'Add to shortlist')}
      title={active ? (ar ? 'إزالة من المفضلة' : 'Remove from shortlist') : (ar ? 'إضافة للمفضلة' : 'Add to shortlist')}
      className={`${dim} bg-white/95 rounded-full shadow flex items-center justify-center transition-colors ${active ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} ${className}`}
    >
      <svg className={icon} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    </button>
  );
}
