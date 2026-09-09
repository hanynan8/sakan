'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr, lang) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function t(section, lang) {
  return lang === 'ar' ? section?.ar : section?.en;
}

// ─── Hero Slider ─────────────────────────────────────────────────────────────

function HeroSlider({ blogs, pageData, lang }) {
  const [current, setCurrent] = useState(0);
  const readingTimeLabel = t(pageData?.readingTimeLabel, lang) ?? 'min read';

  useEffect(() => {
    if (blogs.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % blogs.length), 5000);
    return () => clearInterval(timer);
  }, [blogs.length]);

  if (!blogs.length) return null;

  const blog = blogs[current];
  const title = t(blog.title, lang);
  const excerpt = t(blog.excerpt, lang);

  return (
    <div className="flex flex-col md:flex-row">
      {/* Image — left */}
      <Link
        href={`/help/blog/${blog.slug}`}
        className="group relative w-full md:w-3/5 aspect-[4/3] md:aspect-auto md:min-h-[380px] overflow-hidden bg-gray-100 flex-shrink-0"
      >
        <img
          src={blog.coverImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            e.currentTarget.src = `https://placehold.co/900x600/f3f4f6/9ca3af?text=${encodeURIComponent(blog.category)}`;
          }}
        />
      </Link>

      {/* Content — right */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-10 py-8">
        {/* Category + meta */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 text-white"
            style={{ backgroundColor: '#e8445a' }}
          >
            {blog.category}
          </span>
          <span className="text-xs text-gray-400 font-medium">
            {blog.readingTime} {readingTimeLabel}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="text-xs text-gray-400 font-medium">
            {formatDate(blog.publishedAt, lang)}
          </span>
        </div>

        {/* Title */}
        <Link href={`/blog/${blog.slug}`} className="group">
          <h1 className="text-2xl md:text-3xl font-black text-black leading-tight mb-4 group-hover:text-gray-700 transition-colors">
            {title}
          </h1>
        </Link>

        {/* Excerpt */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-8">
          {excerpt}
        </p>

        {/* Dots */}
        {blogs.length > 1 && (
          <div className="flex items-center gap-2">
            {blogs.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: i === current ? '24px' : '8px',
                  backgroundColor: i === current ? '#e8445a' : '#d1d5db',
                }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
            <span className="text-xs text-gray-400 font-medium ml-2">
              {current + 1}/{blogs.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Blog Card ───────────────────────────────────────────────────────────────

function BlogCard({ blog, pageData, lang }) {
  const title = t(blog.title, lang);
  const excerpt = t(blog.excerpt, lang);
  const readingTimeLabel = t(pageData?.readingTimeLabel, lang) ?? 'min read';

  return (
    <Link href={`/blog/${blog.slug}`} className="group block h-full">
      <article className="h-full flex flex-col border border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-sm transition-all duration-200 overflow-hidden">
        {/* Cover image */}
        <div className="relative w-full aspect-[18/12] overflow-hidden bg-gray-100">
          <img
            src={blog.coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = `https://placehold.co/800x500/f3f4f6/9ca3af?text=${encodeURIComponent(blog.category)}`;
            }}
          />
        </div>

        {/* Content */}
        <div className="p-2 flex flex-col flex-1">
          {/* Category + meta */}
          <div className="flex items-center gap-1 mb-1.5 flex-wrap">
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded-full border"
              style={{ color: '#e8445a', borderColor: '#fca5a5', backgroundColor: '#fff1f2' }}
            >
              {blog.category}
            </span>
            <span className="text-xs text-gray-400">
              {blog.readingTime} {readingTimeLabel}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
            <span className="text-xs text-gray-400">
              {formatDate(blog.publishedAt, lang)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-black text-black leading-snug line-clamp-2 group-hover:text-gray-700 transition-colors">
            {title}
          </h3>
        </div>
      </article>
    </Link>
  );
}

// ─── Featured Sidebar Card (horizontal: thumbnail left + text right) ──────────

function FeaturedSideCard({ blog, pageData, lang }) {
  const title = t(blog.title, lang);
  const readingTimeLabel = t(pageData?.readingTimeLabel, lang) ?? 'min read';

  return (
    <Link href={`/blog/${blog.slug}`} className="group flex flex-row gap-3 items-center">
      {/* Thumbnail — left */}
      <div className="relative w-32 h-28 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
        <img
          src={blog.coverImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = `https://placehold.co/160x112/f3f4f6/9ca3af?text=Blog`;
          }}
        />
      </div>

      {/* Text — right */}
      <div className="flex-1 min-w-0">
        <span
          className="text-xs font-bold px-1.5 py-0.5 rounded-full mb-1 inline-block"
          style={{ color: '#e8445a', backgroundColor: '#fff1f2' }}
        >
          {blog.category}
        </span>
        <h4 className="text-lg font-bold text-black leading-snug line-clamp-2 group-hover:text-gray-600 transition-colors">
          {title}
        </h4>
        <span className="text-xs text-gray-400">{blog.readingTime} {readingTimeLabel}</span>
      </div>
    </Link>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function BlogsPage() {
  const { language } = useLanguage();
  const lang = language;

  const [pageData, setPageData] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState('Latest');
  const [moreOpen, setMoreOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);

  const moreRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [pageRes, blogsRes] = await Promise.all([
          fetch('/api/data?collection=blogspage'),
          fetch('/api/data?collection=blogdetails'),
        ]);
        const [pageJson, blogsJson] = await Promise.all([pageRes.json(), blogsRes.json()]);
        setPageData(pageJson[0]);
        const sorted = [...blogsJson].sort(
          (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
        );
        setBlogs(sorted);
      } catch (err) {
        console.error('Error fetching blogs data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  useEffect(() => {
    setVisibleCount(9);
  }, [activeCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#e8445a', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  const featuredBlogs = blogs.filter((b) => b.featured);
  const heroBlogs = blogs.slice(0, 3);

  const filteredBlogs =
    activeCategory === 'Latest'
      ? blogs
      : blogs.filter((b) => b.category === activeCategory);

  const visibleBlogs = filteredBlogs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredBlogs.length;

  const allCategories = pageData?.categories;
  const moreItems = allCategories?.more?.items ?? [];
  const moreKeys = moreItems.map((i) => i.key);
  const activeIsMore = moreKeys.includes(activeCategory);

  return (
    <div className={`min-h-screen bg-white font-sans ${lang === 'ar' ? 'rtl' : 'ltr'}`}>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="max-w-screen-2xl mx-auto px-10 sm:px-16 py-6">
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── LEFT: Hero + Tabs + Blogs Grid ── */}
          <div className="flex-1 min-w-0">

            {/* Hero Slider */}
            <div className="border border-gray-200 mb-5">
              <HeroSlider blogs={heroBlogs} pageData={pageData} lang={lang} />
            </div>

            {/* Section header */}
            <h2 className="text-xl font-black text-black mb-1">
              {lang === 'ar' ? 'اقرأ من آلاف المقالات' : 'Read From Thousands Of Blogs'}
            </h2>
            <p className="text-sm text-gray-500 font-medium mb-4">
              {lang === 'ar'
                ? 'استكشف آلاف المقالات التي تغطي كل موضوع يمكنك تخيله'
                : 'Explore Thousands of Blogs Covering Every Topic You Could Imagine'}
            </p>

            {/* Category pills */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-none flex-wrap">
              {allCategories?.main?.map((cat) => {
                const label = t(cat.label, lang);
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => { setActiveCategory(cat.key); setMoreOpen(false); }}
                    className="flex-shrink-0 px-4 py-1.5 text-sm font-bold rounded-full border-2 transition-all whitespace-nowrap"
                    style={
                      isActive
                        ? { borderColor: '#e8445a', backgroundColor: '#e8445a', color: 'white' }
                        : { borderColor: '#e5e7eb', backgroundColor: 'white', color: '#374151' }
                    }
                  >
                    {label}
                  </button>
                );
              })}

              {/* More dropdown */}
              <div className="relative flex-shrink-0" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-full border-2 transition-all whitespace-nowrap"
                  style={
                    activeIsMore
                      ? { borderColor: '#e8445a', backgroundColor: '#e8445a', color: 'white' }
                      : { borderColor: '#e5e7eb', backgroundColor: 'white', color: '#374151' }
                  }
                >
                  {activeIsMore
                    ? t(moreItems.find((i) => i.key === activeCategory)?.label, lang)
                    : t(allCategories?.more?.label, lang)}
                  <svg
                    className="w-3.5 h-3.5 transition-transform"
                    style={{ transform: moreOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {moreOpen && (
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 shadow-lg z-40">
                    {moreItems.map((item) => {
                      const label = t(item.label, lang);
                      const isActive = activeCategory === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => { setActiveCategory(item.key); setMoreOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold transition-all"
                          style={isActive ? { backgroundColor: '#fef2f2', color: '#e8445a' } : { color: '#374151' }}
                          onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                          onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Blogs Grid — 2 columns inside the left column */}
            {visibleBlogs.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-gray-400 font-medium text-sm">
                  {t(pageData?.noResultsLabel, lang)}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {visibleBlogs.map((blog) => (
                    <BlogCard
                      key={String(blog._id ?? blog.slug)}
                      blog={blog}
                      pageData={pageData}
                      lang={lang}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-10 text-center">
                    <button
                      onClick={() => setVisibleCount((v) => v + 6)}
                      className="inline-block px-10 py-3 text-sm border-2 font-bold transition-all"
                      style={{ borderColor: '#e8445a', color: '#e8445a' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e8445a'; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#e8445a'; }}
                    >
                      {t(pageData?.loadMoreLabel, lang)}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── RIGHT: Featured Sidebar ── */}
          <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <span className="text-sm">⭐</span>
              <h2 className="text-sm font-black text-black uppercase tracking-wide">
                {lang === 'ar' ? 'المقالات المميزة' : 'Featured Blogs'}
              </h2>
            </div>

            <div className="space-y-4">
              {featuredBlogs.length === 0 ? (
                <p className="text-xs text-gray-400">—</p>
              ) : (
                featuredBlogs.map((blog) => (
                  <div key={String(blog._id ?? blog.slug)}>
                    <FeaturedSideCard blog={blog} pageData={pageData} lang={lang} />
                  </div>
                ))
              )}
            </div>
          </aside>

        </div>
      </div>

    </div>
  );
}