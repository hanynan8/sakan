// path: lib/property-validation.js
// فحص وتنضيف بيانات السكن (للإضافة والتعديل). بيرجع { data } أو { error }.
import { AREAS, COLLEGES, CAMPUSES } from "@/lib/taxonomy";
import { cleanString, isPlainObject, isHttpUrl } from "@/lib/validators";

export const PROPERTY_TYPES = ["apartment", "room", "shared-room", "studio"];
export const PROPERTY_STATUSES = ["active", "hidden", "rented"];

const areaIds = new Set(AREAS.map((a) => a.id));
const collegeById = new Map(COLLEGES.map((c) => [c.id, c]));
const campusIds = new Set(CAMPUSES.map((c) => c.id));

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
export function validateProperty(body, { partial = false } = {}) {
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

  if (has("type")) {
    if (!PROPERTY_TYPES.includes(body.type)) return { error: "نوع السكن غير صحيح" };
    out.type = body.type;
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

  if (has("college")) {
    if (body.college === null || body.college === "") out.college = null;
    else if (typeof body.college === "string" && collegeById.has(body.college)) out.college = body.college;
    else return { error: "الكلية غير صحيحة" };
  }
  if (has("campus")) {
    if (body.campus === null || body.campus === "") out.campus = null;
    else if (typeof body.campus === "string" && campusIds.has(body.campus)) out.campus = body.campus;
    else return { error: "الحرم الجامعي غير صحيح" };
  }
  // لو الكلية محددة، الحرم لازم يطابقها
  if (out.college) out.campus = collegeById.get(out.college).campus;

  if (has("images")) {
    if (!Array.isArray(body.images) || body.images.length > 10) return { error: "أقصى عدد للصور 10" };
    const imgs = body.images.map((u) => (typeof u === "string" ? u.trim() : ""));
    if (!imgs.every((u) => isHttpUrl(u))) return { error: "روابط الصور لازم تبدأ بـ http:// أو https://" };
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
