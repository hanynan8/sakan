'use client';

import { usePathname } from 'next/navigation';

export default function ConditionalShell({ navbar, footer, hiddenOn = [], children }) {
  const pathname = usePathname();

  // تشيك لو الراوت الحالي موجود في قايمة hiddenOn
  const hide = hiddenOn.some((route) => pathname === route);

  return (
    <>
      {!hide && navbar}
      {children}
      {!hide && footer}
    </>
  );
}