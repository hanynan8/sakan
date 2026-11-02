// path: app/api/upload/route.js
// POST /api/upload (multipart/form-data: file) → { url }
// رفع صورة سكن لـ Cloudinary (خطة مجانية). الفحص كله على السيرفر:
//   صلاحية (owner/admin من الداتابيز) + rate limit + حجم + نوع الملف الحقيقي (magic bytes) مش اللي المتصفح بيقوله.
// المفاتيح (CLOUDINARY_API_SECRET) مابتوصلش للمتصفح أبدًا.
import crypto from "node:crypto";
import { json, requireRole, sameOriginOk, forbiddenOrigin } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_BYTES = 3 * 1024 * 1024; // 3MB (الواجهة بتضغط الصورة قبل الرفع)
const FOLDER = "sakan/properties";

// نوع الصورة من أول بايتات الملف
function sniffImage(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  return null;
}

export async function POST(request) {
  try {
    if (!sameOriginOk(request)) return forbiddenOrigin();

    const cloud = process.env.CLOUDINARY_CLOUD_NAME;
    const key = process.env.CLOUDINARY_API_KEY;
    const secret = process.env.CLOUDINARY_API_SECRET;
    if (!cloud || !key || !secret) return json({ message: "رفع الصور غير مفعّل على السيرفر" }, 503);

    const gate = await requireRole(["owner", "admin"]);
    if (gate.error) return gate.error;
    const userId = gate.session.user.id;

    const hourly = await rateLimit(`upload:h:${userId}`, 30, 60 * 60 * 1000);
    const daily = await rateLimit(`upload:d:${userId}`, 80, 24 * 60 * 60 * 1000);
    if (hourly.limited || daily.limited) {
      return json({ message: "رفعت صور كتير، حاول بعد شوية" }, 429, { "Retry-After": String(hourly.retryAfter || daily.retryAfter) });
    }

    const len = Number(request.headers.get("content-length") || 0);
    if (len > MAX_BYTES + 64 * 1024) return json({ message: "الصورة كبيرة (الحد الأقصى 3MB)" }, 413);

    let file;
    try {
      file = (await request.formData()).get("file");
    } catch {
      return json({ message: "طلب غير صحيح" }, 400);
    }
    if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
      return json({ message: "الملف مطلوب" }, 400);
    }
    if (file.size > MAX_BYTES) return json({ message: "الصورة كبيرة (الحد الأقصى 3MB)" }, 413);

    const buf = Buffer.from(await file.arrayBuffer());
    const kind = sniffImage(buf);
    if (!kind) return json({ message: "الملف لازم يكون صورة JPG أو PNG أو WebP" }, 400);

    // توقيع Cloudinary: sha1 للـ params مرتبة أبجديًا + السر
    const timestamp = Math.floor(Date.now() / 1000);
    const params = { allowed_formats: "jpg,png,webp", folder: FOLDER, timestamp: String(timestamp) };
    const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
    const signature = crypto.createHash("sha1").update(toSign + secret).digest("hex");

    const fd = new FormData();
    fd.append("file", new Blob([buf], { type: `image/${kind === "jpg" ? "jpeg" : kind}` }), `upload.${kind}`);
    fd.append("api_key", key);
    fd.append("signature", signature);
    for (const [k, v] of Object.entries(params)) fd.append(k, v);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
      method: "POST",
      body: fd,
      signal: AbortSignal.timeout(20000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || typeof data.secure_url !== "string") {
      console.error("cloudinary upload failed:", res.status, data?.error?.message);
      return json({ message: "فشل رفع الصورة، حاول تاني" }, 502);
    }

    // ضغط/تحويل تلقائي عند العرض (بيوفّر من حد الباندويث المجاني)
    const url = data.secure_url.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_1400,c_limit/");
    return json({ url }, 201);
  } catch (err) {
    console.error("POST /api/upload error:", err);
    return json({ message: "Server error" }, 500);
  }
}
