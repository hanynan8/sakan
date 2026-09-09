'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr, lang) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function t(section, lang) {
  return lang === 'ar' ? section?.ar : section?.en;
}

// ─── Featured Sidebar Card — نفس الكارد بالظبط من صفحة البلوجز ───────────────

function FeaturedSideCard({ blog, lang }) {
  const title = t(blog.title, lang);

  return (
    <Link href={`/blogs/${blog.slug}`} className="group flex flex-row gap-3 items-center">
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
        <span className="text-xs text-gray-400">{blog.readingTime} min read</span>
      </div>
    </Link>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function BlogDetailPage() {
  const { language } = useLanguage();
  const lang = language;
  const params = useParams();
  const slug = params?.id;

  const [blog, setBlog] = useState(null);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    async function fetchData() {
      try {
        const res = await fetch('/api/data?collection=blogdetails');
        const data = await res.json();

        const found = data.find((b) => b.slug === slug);
        if (!found) {
          setNotFound(true);
        } else {
          setBlog(found);
          // البلوجات المميزة — نفس منطق الصفحة الرئيسية
          setFeaturedBlogs(data.filter((b) => b.featured && b.slug !== slug));
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  // ── Loading ──
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

  // ── Not Found ──
  if (notFound || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <p className="text-gray-400 font-medium text-sm">المقال غير موجود</p>
        <Link
          href="/help/blog"
          className="text-xs font-bold px-5 py-2 border-2 transition-all"
          style={{ borderColor: '#e8445a', color: '#e8445a' }}
        >
          {lang === 'ar' ? 'العودة للمدونة' : 'Back to Blogs'}
        </Link>
      </div>
    );
  }

  const title = t(blog.title, lang);
  const description = t(blog.description, lang);
  const excerpt = t(blog.excerpt, lang);

  return (
    <div className={`min-h-screen bg-white font-sans ${lang === 'ar' ? 'rtl' : 'ltr'}`}>

      {/* ── نفس التقسيم بالظبط ── */}
      <div className="max-w-screen-2xl mx-auto px-10 sm:px-16 py-6">
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── LEFT: Blog Content ── */}
          <div className="flex-1 min-w-0">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-5 text-xs text-gray-400 font-medium flex-wrap">
              <Link href="/" className="hover:text-gray-600 transition-colors">
                {lang === 'ar' ? 'الرئيسية' : 'Home'}
              </Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-gray-600 transition-colors">
                {lang === 'ar' ? 'المدونة' : 'Blog'}
              </Link>
              <span>/</span>
              <span className="text-gray-600 line-clamp-1">{title}</span>
            </div>

            {/* Cover Image */}
            <div className="relative w-full aspect-[16/7] overflow-hidden rounded-xl mb-6 bg-gray-100">
              <img
                src={blog.coverImage}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/1200x525/f3f4f6/9ca3af?text=${encodeURIComponent(blog.category)}`;
                }}
              />
              {/* Category badge */}
              <span
                className="absolute top-4 left-4 text-xs font-bold uppercase tracking-widest px-3 py-1 text-white"
                style={{ backgroundColor: '#e8445a' }}
              >
                {blog.category}
              </span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-xs text-gray-400 font-medium">
                {formatDate(blog.publishedAt, lang)}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="text-xs font-bold" style={{ color: '#e8445a' }}>
                {blog.readingTime} {lang === 'ar' ? 'دقيقة قراءة' : 'min read'}
              </span>
              {blog.tags?.length > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {blog.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-black text-black leading-tight mb-3">
              {title}
            </h1>

            {/* Excerpt */}
            <p className="text-sm text-gray-500 leading-relaxed mb-6 border-l-4 pl-4"
              style={{ borderColor: '#e8445a' }}>
              {excerpt}
            </p>

            {/* Author */}
            {blog.author && (
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                  style={{ backgroundColor: '#e8445a' }}
                >
                  {blog.author.name?.[0] ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-bold text-black">{blog.author.name}</p>
                  <p className="text-xs text-gray-400">{lang === 'ar' ? 'كاتب' : 'Author'}</p>
                </div>
              </div>
            )}

            {/* ── Full Description HTML ── */}
            <div
              className="prose prose-sm max-w-none
                prose-headings:font-black prose-headings:text-black
                prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
                prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
                prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4
                prose-a:font-bold prose-a:no-underline
                prose-li:text-gray-600 prose-li:leading-relaxed
                prose-strong:text-black"
              style={{ '--tw-prose-links': '#e8445a' }}
              dangerouslySetInnerHTML={{ __html: description }}
            />

            {/* Back Button */}
            <div className="mt-10 pt-6 border-t border-gray-100">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-bold transition-colors"
                style={{ color: '#e8445a' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                {lang === 'ar' ? 'العودة للمدونة' : 'Back to Blogs'}
              </Link>
            </div>

          </div>

          {/* ── RIGHT: Featured Sidebar — نفس الكود بالظبط ── */}
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
                featuredBlogs.map((b) => (
                  <div key={String(b._id ?? b.slug)}>
                    <FeaturedSideCard blog={b} lang={lang} />
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