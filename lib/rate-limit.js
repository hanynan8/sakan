// path: lib/rate-limit.js
// Rate limiter بسيط في الذاكرة (per-instance).
// كفاية للبداية؛ على استضافة serverless/متعددة السيرفرات استخدم Upstash Redis أو ما شابه.

if (!globalThis._rateBuckets) globalThis._rateBuckets = new Map();

/**
 * @param {string} key      مفتاح فريد (مثلاً "login:ip:1.2.3.4")
 * @param {number} max      أقصى عدد محاولات في الفترة
 * @param {number} windowMs مدة الفترة بالملي ثانية
 * @returns {{ limited: boolean, retryAfter: number }}
 */
export function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const map = globalThis._rateBuckets;

  if (map.size > 10000) {
    for (const [k, v] of map) if (now > v.resetAt) map.delete(k);
  }

  const entry = map.get(key);
  if (!entry || now > entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfter: 0 };
  }
  entry.count += 1;
  if (entry.count > max) {
    return { limited: true, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { limited: false, retryAfter: 0 };
}

export function resetRateLimit(key) {
  globalThis._rateBuckets.delete(key);
}

export function getClientIp(request) {
  const fwd = request?.headers?.get?.("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request?.headers?.get?.("x-real-ip") || "unknown";
}
