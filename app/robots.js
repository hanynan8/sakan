export default function robots() {
  const base = process.env.AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/profile", "/signin", "/signup"] }],
    ...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}
