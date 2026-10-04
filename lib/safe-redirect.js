// path: lib/safe-redirect.js
// بيمنع Open Redirect: بيقبل بس مسارات داخلية للموقع (بتبدأ بـ / وبدون // أو \).
export function safeCallbackUrl(value, fallback = "/profile") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  if (/[\u0000-\u001f]/.test(value)) return fallback;
  return value;
}
