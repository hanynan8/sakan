// path: contexts/FavoritesContext.js
'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

const FavoritesContext = createContext({
  ids: new Set(),
  ready: false,
  isFav: () => false,
  toggle: async () => ({ ok: false, reason: 'no-provider' }),
});

export function FavoritesProvider({ children }) {
  const { status } = useSession();
  const [ids, setIds] = useState(() => new Set());
  const [ready, setReady] = useState(false);

  // هات أرقام المفضلة مرة واحدة أول ما المستخدم يسجل دخول
  useEffect(() => {
    let cancelled = false;
    if (status === 'authenticated') {
      (async () => {
        try {
          const res = await fetch('/api/favorites?idsOnly=1', { cache: 'no-store' });
          if (!res.ok) throw new Error('failed');
          const list = await res.json();
          if (!cancelled) setIds(new Set(Array.isArray(list) ? list : []));
        } catch {
          if (!cancelled) setIds(new Set());
        } finally {
          if (!cancelled) setReady(true);
        }
      })();
    } else if (status === 'unauthenticated') {
      setIds(new Set());
      setReady(true);
    }
    return () => {
      cancelled = true;
    };
  }, [status]);

  const isFav = useCallback((id) => ids.has(String(id)), [ids]);

  const toggle = useCallback(
    async (id) => {
      if (status !== 'authenticated') return { ok: false, reason: 'auth' };
      const key = String(id);
      const wasFav = ids.has(key);

      // تحديث فوري (optimistic) ثم تراجع لو الطلب فشل
      setIds((prev) => {
        const next = new Set(prev);
        wasFav ? next.delete(key) : next.add(key);
        return next;
      });

      try {
        const res = wasFav
          ? await fetch(`/api/favorites?propertyId=${encodeURIComponent(key)}`, { method: 'DELETE' })
          : await fetch('/api/favorites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ propertyId: key }),
            });
        if (!res.ok) throw new Error('failed');
        return { ok: true, active: !wasFav };
      } catch {
        setIds((prev) => {
          const next = new Set(prev);
          wasFav ? next.add(key) : next.delete(key);
          return next;
        });
        return { ok: false, reason: 'error' };
      }
    },
    [ids, status]
  );

  const value = useMemo(() => ({ ids, ready, isFav, toggle }), [ids, ready, isFav, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export const useFavorites = () => useContext(FavoritesContext);
