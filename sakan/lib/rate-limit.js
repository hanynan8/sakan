// path: lib/rate-limit.js
// Rate limiter:
//   • لو UPSTASH_REDIS_REST_URL و UPSTASH_REDIS_REST_TOKEN متظبطين → Redis مشترك (شغال صح على Vercel/serverless).
//   • غير كده → في الذاكرة (per-instance) — مناسب للتطوير المحلي أو سيرفر واحد بس.
// لو Redis وقع، بنرجع للذاكرة بدل ما نوقف الموقع (fail-open) ونسجّل الخطأ.

if (!globalThis._rateBuckets) globalThis._rateBuckets = new Map();

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisPipeline(commands) {
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
    signal: AbortSignal.timeout(2500),
  });
  if (!res.ok) throw new Error(`Redis ${res.status}`);
  return res.json();
}

function memoryLimit(key, max, windowMs) {
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

/**
 * @param {string} key      مفتاح فريد (مثلاً "login:ip:1.2.3.4")
 * @param {number} max      أقصى عدد محاولات في الفترة
 * @param {number} windowMs مدة الفترة بالملي ثانية
 * @returns {Promise<{ limited: boolean, retryAfter: number }>}
 */
export async function rateLimit(key, max, windowMs) {
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      const k = `rl:${key}`;
      const out = await redisPipeline([
        ["INCR", k],
        ["PEXPIRE", k, String(windowMs), "NX"],
        ["PTTL", k],
      ]);
      const count = Number(out[0]?.result);
      const ttl = Number(out[2]?.result);
      if (!Number.isFinite(count)) throw new Error("bad redis reply");
      // لو المفتاح اتساب من غير TTL لأي سبب، نحط له واحد عشان مايفضلش محظور للأبد
      if (ttl < 0) await redisPipeline([["PEXPIRE", k, String(windowMs)]]).catch(() => {});
      if (count > max) return { limited: true, retryAfter: Math.max(1, Math.ceil((ttl > 0 ? ttl : windowMs) / 1000)) };
      return { limited: false, retryAfter: 0 };
    } catch (err) {
      console.error("rate-limit redis error, falling back to memory:", err.message);
    }
  }
  return memoryLimit(key, max, windowMs);
}

export async function resetRateLimit(key) {
  globalThis._rateBuckets.delete(key);
  if (REDIS_URL && REDIS_TOKEN) {
    try { await redisPipeline([["DEL", `rl:${key}`]]); } catch { /* ignore */ }
  }
}

export function getClientIp(request) {
  const fwd = request?.headers?.get?.("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request?.headers?.get?.("x-real-ip") || "unknown";
}
