// path: app/profile/admin/page.jsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AREAS } from '@/lib/taxonomy';

const inputCls = 'px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-brand';
const btnCls = 'px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded hover:border-gray-500 transition-all';
const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '—');

async function api(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'Error');
  return data;
}

/* ───────── طلبات الدعم ───────── */
function RequestsTab({ ar }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch('/api/data?collection=request', { cache: 'no-store' });
      if (res.status === 404) return setItems([]); // لسه مفيش طلبات
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setItems((Array.isArray(data) ? data : []).sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)));
    } catch {
      setErr(ar ? 'تعذر تحميل الطلبات' : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [ar]);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    try {
      await api(`/api/data?collection=request&id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      load();
    } catch (e) { alert(e.message); }
  };
  const remove = async (id) => {
    if (!confirm(ar ? 'حذف الطلب؟' : 'Delete this request?')) return;
    try { await api(`/api/data?collection=request&id=${id}`, { method: 'DELETE' }); load(); } catch (e) { alert(e.message); }
  };

  if (loading) return <p className="text-sm text-gray-400 py-8 text-center">{ar ? 'جارٍ التحميل...' : 'Loading...'}</p>;
  if (err) return <p className="text-sm text-red-600 py-8 text-center">{err}</p>;
  if (!items.length) return <p className="text-sm text-gray-500 py-8 text-center">{ar ? 'مفيش طلبات دعم' : 'No support requests'}</p>;

  return (
    <div className="space-y-3">
      {items.map((r) => (
        <div key={r._id} className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="font-semibold text-navy break-words">{r.subject}</p>
              <p className="text-xs text-gray-500 mt-0.5" dir="ltr">{r.email} · {r.query} · {fmt(r.submittedAt)}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {r.status === 'done' ? (ar ? 'تم' : 'Done') : (ar ? 'جديد' : 'New')}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2 whitespace-pre-line break-words">{r.description}</p>
          <div className="flex gap-2 mt-3">
            <a href={`mailto:${r.email}?subject=${encodeURIComponent('Re: ' + (r.subject || ''))}`} className={btnCls}>{ar ? 'رد بالإيميل' : 'Reply'}</a>
            <button onClick={() => setStatus(r._id, r.status === 'done' ? 'new' : 'done')} className={btnCls}>
              {r.status === 'done' ? (ar ? 'إعادة فتح' : 'Reopen') : (ar ? 'تم الحل' : 'Mark done')}
            </button>
            <button onClick={() => remove(r._id)} className={`${btnCls} !border-red-200 text-red-600`}>{ar ? 'حذف' : 'Delete'}</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────── المستخدمين ───────── */
function UsersTab({ ar, selfId }) {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ users: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page) });
      if (q.trim()) p.set('q', q.trim());
      if (role) p.set('role', role);
      setData(await api(`/api/admin/users?${p}`, { cache: 'no-store' }));
    } catch { setData({ users: [], pages: 1, total: 0 }); }
    finally { setLoading(false); }
  }, [q, role, page]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const changeRole = async (id, newRole) => {
    try {
      await api(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: newRole }) });
      load();
    } catch (e) { alert(e.message); }
  };
  const remove = async (u) => {
    if (!confirm(ar ? `حذف ${u.name} وكل سكناته؟` : `Delete ${u.name} and all their listings?`)) return;
    try { await api(`/api/admin/users/${u.id}`, { method: 'DELETE' }); load(); } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <input className={`${inputCls} flex-1 min-w-[180px]`} placeholder={ar ? 'بحث بالاسم / الإيميل / الهاتف' : 'Search name / email / phone'} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <select className={inputCls} value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">{ar ? 'كل الأدوار' : 'All roles'}</option>
          <option value="student">{ar ? 'طالب' : 'Student'}</option>
          <option value="owner">{ar ? 'مالك' : 'Owner'}</option>
          <option value="admin">{ar ? 'أدمن' : 'Admin'}</option>
        </select>
      </div>
      <p className="text-xs text-gray-500 mb-2">{data.total} {ar ? 'مستخدم' : 'users'}</p>
      <div className={`space-y-2 ${loading ? 'opacity-60' : ''}`}>
        {data.users.map((u) => (
          <div key={u.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="font-semibold text-navy text-sm truncate">{u.name}</p>
              <p className="text-xs text-gray-500" dir="ltr">{u.email || u.phone} · {fmt(u.createdAt)}</p>
            </div>
            {u.id === selfId ? (
              <span className="text-xs text-gray-400">{ar ? 'أنت' : 'You'}</span>
            ) : (
              <div className="flex gap-2">
                <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} className={`${btnCls} bg-white`}>
                  <option value="student">{ar ? 'طالب' : 'Student'}</option>
                  <option value="owner">{ar ? 'مالك' : 'Owner'}</option>
                  <option value="admin">{ar ? 'أدمن' : 'Admin'}</option>
                </select>
                <button onClick={() => remove(u)} className={`${btnCls} !border-red-200 text-red-600`}>{ar ? 'حذف' : 'Delete'}</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <Pager page={page} pages={data.pages} setPage={setPage} ar={ar} />
    </div>
  );
}

/* ───────── السكنات ───────── */
function PropertiesTab({ ar }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ properties: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page) });
      if (q.trim()) p.set('q', q.trim());
      if (status) p.set('status', status);
      setData(await api(`/api/admin/properties?${p}`, { cache: 'no-store' }));
    } catch { setData({ properties: [], pages: 1, total: 0 }); }
    finally { setLoading(false); }
  }, [q, status, page]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const changeStatus = async (id, newStatus) => {
    try {
      await api(`/api/properties/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      load();
    } catch (e) { alert(e.message); }
  };
  const remove = async (p) => {
    if (!confirm(ar ? `حذف "${p.title}"؟` : `Delete "${p.title}"?`)) return;
    try { await api(`/api/properties/${p.id}`, { method: 'DELETE' }); load(); } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <input className={`${inputCls} flex-1 min-w-[180px]`} placeholder={ar ? 'بحث بالعنوان' : 'Search title / address'} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <select className={inputCls} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">{ar ? 'كل الحالات' : 'All statuses'}</option>
          <option value="active">{ar ? 'متاح' : 'Active'}</option>
          <option value="rented">{ar ? 'مؤجر' : 'Rented'}</option>
          <option value="hidden">{ar ? 'مخفي' : 'Hidden'}</option>
        </select>
      </div>
      <p className="text-xs text-gray-500 mb-2">{data.total} {ar ? 'سكن' : 'properties'}</p>
      <div className={`space-y-2 ${loading ? 'opacity-60' : ''}`}>
        {data.properties.map((p) => {
          const area = AREAS.find((a) => a.id === p.area);
          return (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <Link href={`/properties/${p.id}`} className="font-semibold text-navy text-sm hover:underline">{p.title}</Link>
                <p className="text-xs text-gray-500">
                  {p.price} {ar ? 'ج.م' : 'EGP'} · {ar ? area?.ar : area?.en} · {p.owner ? `${p.owner.name} (${p.owner.contact})` : '—'}
                </p>
              </div>
              <div className="flex gap-2">
                <select value={p.status} onChange={(e) => changeStatus(p.id, e.target.value)} className={`${btnCls} bg-white`}>
                  <option value="active">{ar ? 'متاح' : 'Active'}</option>
                  <option value="rented">{ar ? 'مؤجر' : 'Rented'}</option>
                  <option value="hidden">{ar ? 'مخفي' : 'Hidden'}</option>
                </select>
                <button onClick={() => remove(p)} className={`${btnCls} !border-red-200 text-red-600`}>{ar ? 'حذف' : 'Delete'}</button>
              </div>
            </div>
          );
        })}
      </div>
      <Pager page={page} pages={data.pages} setPage={setPage} ar={ar} />
    </div>
  );
}

function Pager({ page, pages, setPage, ar }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 mt-4 text-sm">
      <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={`${btnCls} disabled:opacity-40`}>{ar ? 'السابق' : 'Prev'}</button>
      <span className="text-gray-500">{page} / {pages}</span>
      <button disabled={page >= pages} onClick={() => setPage(page + 1)} className={`${btnCls} disabled:opacity-40`}>{ar ? 'التالي' : 'Next'}</button>
    </div>
  );
}

/* ───────── الصفحة ───────── */
export default function AdminPage() {
  const { data: session, status } = useSession();
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [tab, setTab] = useState('requests');
  const [stats, setStats] = useState(null);

  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    api('/api/admin/stats', { cache: 'no-store' }).then(setStats).catch(() => {});
  }, [isAdmin]);

  if (status === 'loading') return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">{ar ? 'جارٍ التحميل...' : 'Loading...'}</div>;

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center" dir={ar ? 'rtl' : 'ltr'}>
        <p className="text-lg font-semibold text-gray-700 mb-2">{ar ? 'الصفحة دي للمسؤولين بس' : 'This page is for admins only'}</p>
        <Link href="/profile" className="text-navy underline text-sm">{ar ? 'رجوع للملف الشخصي' : 'Back to profile'}</Link>
      </div>
    );
  }

  const sum = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);
  const cards = [
    { label: ar ? 'المستخدمين' : 'Users', value: sum(stats?.users) },
    { label: ar ? 'السكنات' : 'Properties', value: sum(stats?.properties) },
    { label: ar ? 'المتاحة' : 'Active', value: stats?.properties?.active || 0 },
    { label: ar ? 'المؤجرة' : 'Rented', value: stats?.properties?.rented || 0 },
  ];
  const tabs = [
    { id: 'requests', label: ar ? 'طلبات الدعم' : 'Support requests' },
    { id: 'users', label: ar ? 'المستخدمين' : 'Users' },
    { id: 'properties', label: ar ? 'السكنات' : 'Properties' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-16" dir={ar ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <nav className="flex items-center gap-1.5 text-sm mb-3">
          <Link href="/profile" className="text-gray-500 hover:text-brand-dark">{ar ? 'الملف الشخصي' : 'Profile'}</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium">{ar ? 'لوحة الإدارة' : 'Admin Panel'}</span>
        </nav>
        <h1 className="text-2xl font-bold text-navy mb-4">{ar ? 'لوحة الإدارة' : 'Admin Panel'}</h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {cards.map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400">{c.label}</p>
              <p className="text-2xl font-black text-navy">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4 border-b border-gray-200">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 transition-colors ${tab === t.id ? 'border-brand text-navy' : 'border-transparent text-gray-500 hover:text-navy'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'requests' && <RequestsTab ar={ar} />}
        {tab === 'users' && <UsersTab ar={ar} selfId={session.user.id} />}
        {tab === 'properties' && <PropertiesTab ar={ar} />}
      </div>
    </div>
  );
}
