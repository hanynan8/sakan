'use client';

import { usePathname } from 'next/navigation';

export default function ConditionalShell({ navbar, footer, hiddenOn = [], hideNavbarOn = [], children }) {
  const pathname = usePathname();

  // تشيك لو الراوت الحالي موجود في قايمة hiddenOn
  const hide = hiddenOn.some((route) => pathname === route);

  // routes بتخفي الناف بار بس (الفوتر يفضل ظاهر)، وبتشمل الراوت نفسه وأي راوت تحته
  const hideNav = hide || hideNavbarOn.some((route) => pathname === route || pathname?.startsWith(route + '/'));

  return (
    <>
      {!hideNav && navbar}
      {children}
      {!hide && footer}
    </>
  );
}