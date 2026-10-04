// path: lib/validators.js
// دوال تنضيف وفحص مدخلات مشتركة (بتتأكد من النوع قبل أي استعلام للداتابيز).

export const isString = (v) => typeof v === "string";

export function cleanString(v, max = 255) {
  return isString(v) ? v.trim().slice(0, max) : "";
}

export function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(v) {
  if (!isString(v)) return null;
  const e = v.trim().toLowerCase();
  return e.length <= 254 && EMAIL_RE.test(e) ? e : null;
}

// أرقام فقط مع + اختيارية في الأول (بنشيل المسافات والشرطات والأقواس)
export function normalizePhone(v) {
  if (!isString(v)) return null;
  const p = v.replace(/[\s\-().]/g, "");
  return /^\+?[0-9]{8,15}$/.test(p) ? p : null;
}

export function looksLikeEmail(v) {
  return isString(v) && v.includes("@");
}

// سياسة كلمة المرور: 8 حروف على الأقل، حرف كبير، رقم، وحد أقصى 72 (حد bcrypt)
export function validatePassword(pw) {
  if (!isString(pw)) return "Password is required";
  if (pw.length < 8) return "Password must be at least 8 characters";
  if (Buffer.byteLength(pw, "utf8") > 72) return "Password is too long (max 72 bytes)";
  if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(pw)) return "Password must contain at least one number";
  return null;
}

export function cleanName(v) {
  const s = cleanString(v, 50).replace(/\s+/g, " ");
  return s.length >= 1 ? s : "";
}

export function isHttpUrl(v, max = 600) {
  if (!isString(v) || v.length > max) return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// يتأكد إن الـ body JSON object ويرجعه، أو null
export async function readJson(request, maxBytes = 50 * 1024) {
  try {
    const len = Number(request.headers.get("content-length") || 0);
    if (len > maxBytes) return { tooLarge: true };
    const text = await request.text();
    if (text.length > maxBytes) return { tooLarge: true };
    const data = JSON.parse(text);
    return { data };
  } catch {
    return { data: null };
  }
}
