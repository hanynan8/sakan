'use client';

import { useId } from 'react';

/* ═══════════════════════════════════════════════
   الزخرفة النوبية (نفس مثلثات الفوتر: أزرق فاتح + أزرق غامق)
   بدل ما تتكرر على خلفية كاملة، بنستخدمها هنا كلمسات صغيرة
   متفرقة في الموقع. كل لمسة بتتلاشى تدريجياً ناحية الأطراف
   عشان ما تبانش كمربع مقصوص.
   الاستخدام: حط المكوّن جوه عنصر position: relative + overflow-hidden،
   وخلّي المحتوى اللي فوقه relative z-10.
═══════════════════════════════════════════════ */

const TILE_W = 80;
const TILE_H = 42;

// الزاوية اللي هتتلاشى منها الزخرفة (مركز التدرج)
const ANCHORS = {
  'top-left': { css: 'top-0 left-0', origin: '0% 0%' },
  'top-right': { css: 'top-0 right-0', origin: '100% 0%' },
  'bottom-left': { css: 'bottom-0 left-0', origin: '0% 100%' },
  'bottom-right': { css: 'bottom-0 right-0', origin: '100% 100%' },
};

function Tile({ id, stroke }) {
  return (
    <pattern id={id} width={TILE_W} height={TILE_H} viewBox={`0 1 ${TILE_W} ${TILE_H}`} patternUnits="userSpaceOnUse">
      <g stroke={stroke} strokeWidth="2" strokeLinejoin="round">
        {/* المثلثات اللي لفوق: أزرق فاتح #9DB4F5 */}
        <path d="M20 0 L40 44 L0 44 Z" fill="#9DB4F5" />
        <path d="M60 0 L80 44 L40 44 Z" fill="#9DB4F5" />
        {/* المثلثات اللي نازلة لتحت: أزرق غامق #4169E1 */}
        <path d="M20 0 L60 0 L40 44 Z" fill="#4169E1" />
        <path d="M60 0 L100 0 L80 44 Z" fill="#4169E1" />
        <path d="M-20 0 L20 0 L0 44 Z" fill="#4169E1" />
      </g>
    </pattern>
  );
}

/**
 * لمسة زخرفية في ركن سكشن.
 * @param position  'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
 * @param size      المقاس بالبكسل (مربع)
 * @param opacity   الشفافية الكلية (الفوتر 0.05 على كحلي، وعلى الأبيض محتاجة أعلى شوية)
 * @param stroke    لون الخطوط بين المثلثات (أبيض على الخلفيات الملونة، وممكن يتغير)
 * @param className كلاسات إضافية (مثلاً hidden sm:block عشان تختفي على الموبايل)
 */
export function NubianOrnament({
  position = 'top-left',
  size = 220,
  opacity = 0.16,
  stroke = '#fff',
  className = '',
}) {
  const uid = useId().replace(/:/g, '');
  const patternId = `nubian-${uid}`;
  const anchor = ANCHORS[position] || ANCHORS['top-left'];
  const fade = `radial-gradient(circle at ${anchor.origin}, #000 0%, rgba(0,0,0,0.6) 40%, transparent 72%)`;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      className={`absolute ${anchor.css} pointer-events-none select-none ${className}`}
      style={{ opacity, WebkitMaskImage: fade, maskImage: fade }}
    >
      <defs>
        <Tile id={patternId} stroke={stroke} />
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

/**
 * شريط رفيع (صف واحد من المثلثات) يتحط كفاصل بين سكشنين.
 * بيتلاشى من الطرفين عشان يبان خفيف.
 */
export function NubianBand({ height = 21, opacity = 0.5, stroke = '#fff', className = '' }) {
  const uid = useId().replace(/:/g, '');
  const patternId = `nubian-band-${uid}`;
  const fade = 'linear-gradient(to right, transparent 0%, #000 25%, #000 75%, transparent 100%)';

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="100%"
      height={height}
      className={`block pointer-events-none select-none ${className}`}
      style={{ opacity, WebkitMaskImage: fade, maskImage: fade }}
    >
      <defs>
        <Tile id={patternId} stroke={stroke} />
      </defs>
      {/* التايل الأصلي ارتفاعه 42، فبنصغّره للنص عشان الشريط يبقى رفيع */}
      <g transform={`scale(${height / TILE_H})`}>
        <rect width={`${(100 * TILE_H) / height}%`} height={TILE_H} fill={`url(#${patternId})`} />
      </g>
    </svg>
  );
}

export default NubianOrnament;
