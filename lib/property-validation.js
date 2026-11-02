// path: lib/property-validation.js
// فحص وتنضيف بيانات السكن (للإضافة والتعديل). بيرجع { data } أو { error }.
import { AREAS, COLLEGES, GENDER_IDS } from "@/lib/taxonomy";
import { cleanString, isPlainObject, isHttpUrl } from "@/lib/validators";

// الصور: لو Cloudinary متظبط، الروابط الجديدة لازم تكون من حسابك إنت بس (بتتعمل بالرفع من /api/upload).
// ده بيمنع أي حد يحط روابط لمواقع خارجية (تتبع الزوار / محتوى مسيء).
// الروابط القديمة الموجودة في السكن بالفعل (keepImages) بتفضل مقبولة عشان التعديل مايتكسرش.
const CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUD_PREFIX = CLOUD ? `https://res.cloudinary.com/${CLOUD}/image/upload/` : null;
const isAllowedImage = (u, keep) =>
  isHttpUrl(u) && u.startsWith("https://") && (!CLOUD_PREFIX || u.startsWith(CLOUD_PREFIX) || keep.has(u));

export const PROPERTY_STATUSES = ["pending", "active", "hidden", "rented"];

const areaIds = new Set(AREAS.map((a) => a.id));
const collegeIds = new Set(COLLEGES.map((c) => c.id));

const toInt = (v, min, max) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const i = Math.round(n);
  return i < min || i > max ? null : i;
};

/**
 * @param {object} body
 * @param {{ partial?: boolean }} opts partial=true => بيفحص بس الحقول الموجودة (للتعديل)
 */
export function validateProperty(body, { partial = false, keepImages = [], anyImageHost = false } = {}) {
  if (!isPlainObject(body)) return { error: "Invalid body" };
  const out = {};
  const has = (k) => Object.prototype.hasOwnProperty.call(body, k);

  if (!partial || has("title")) {
    const title = cleanString(body.title, 120);
    if (title.length < 3) return { error: "العنوان لازم يكون 3 حروف على الأقل" };
    out.title = title;
  }

  if (!partial || has("price")) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 1 || price > 1000000) return { error: "السعر غير صحيح" };
    out.price = Math.round(price);
  }

  if (!partial || has("area")) {
    if (typeof body.area !== "string" || !areaIds.has(body.area)) return { error: "المنطقة غير صحيحة" };
    out.area = body.area;
  }

  if (has("description")) out.description = cleanString(body.description, 3000);
  if (has("address")) out.address = cleanString(body.address, 200);

  if (has("gender")) {
    if (!GENDER_IDS.includes(body.gender)) return { error: "الجنس غير صحيح" };
    out.gender = body.gender;
  }

  if (has("furnished")) {
    if (typeof body.furnished !== "boolean") return { error: "قيمة مفروش/غير مفروش غير صحيحة" };
    out.furnished = body.furnished;
  }

  if (has("bedrooms")) {
    const n = toInt(body.bedrooms, 0, 50);
    if (n === null) return { error: "عدد الغرف غير صحيح" };
    out.bedrooms = n;
  }
  if (has("capacity")) {
    const n = toInt(body.capacity, 1, 100);
    if (n === null) return { error: "السعة غير صحيحة" };
    out.capacity = n;
  }
  if (has("beds")) {
    if (body.beds === null || body.beds === "") out.beds = null;
    else {
      const n = toInt(body.beds, 1, 100);
      if (n === null) return { error: "عدد السراير غير صحيح" };
      out.beds = n;
    }
  }
  if (has("floor")) {
    if (body.floor === null || body.floor === "") out.floor = null;
    else {
      const n = toInt(body.floor, 0, 50);
      if (n === null) return { error: "رقم الدور غير صحيح" };
      out.floor = n;
    }
  }
  if (has("utilitiesIncluded")) {
    if (typeof body.utilitiesIncluded !== "boolean") return { error: "قيمة شامل/غير شامل المرافق غير صحيحة" };
    out.utilitiesIncluded = body.utilitiesIncluded;
  }

  // الكليات القريبة (مصفوفة ids). الحقل القديم college بيتفضى لما الكليات تتحفظ
  if (has("colleges")) {
    if (!Array.isArray(body.colleges) || body.colleges.length > collegeIds.size) return { error: "الكليات غير صحيحة" };
    if (!body.colleges.every((c) => typeof c === "string" && collegeIds.has(c))) return { error: "الكلية غير صحيحة" };
    out.colleges = [...new Set(body.colleges)];
    out.college = null;
  }

  if (has("images")) {
    if (!Array.isArray(body.images) || body.images.length > 10) return { error: "أقصى عدد للصور 10" };
    const imgs = body.images.map((u) => (typeof u === "string" ? u.trim() : ""));
    if (!imgs.every((u) => (anyImageHost ? isHttpUrl(u) && u.startsWith("https://") : isAllowedImage(u, new Set(keepImages))))) return { error: "الصور لازم تترفع من الموقع نفسه" };
    out.images = imgs;
  }

  if (has("amenities")) {
    if (!Array.isArray(body.amenities) || body.amenities.length > 20) return { error: "أقصى عدد للمميزات 20" };
    out.amenities = body.amenities.map((a) => cleanString(a, 40)).filter(Boolean);
  }

  if (has("status")) {
    if (!PROPERTY_STATUSES.includes(body.status)) return { error: "الحالة غير صحيحة" };
    out.status = body.status;
  }

  return { data: out };
}
