// path: app/api/properties/route.js
import { auth, connectToMongo } from "@/lib/auth";
import Property from "@/models/property";
import { AREAS, COLLEGES, GENDER_IDS, areaRankForCollege } from "@/lib/taxonomy";
import { json, requireRole, sameOriginOk, forbiddenOrigin } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { escapeRegex, readJson } from "@/lib/validators";
import { validateProperty } from "@/lib/property-validation";

const areaIds = new Set(AREAS.map((a) => a.id));
const collegeIds = new Set(COLLEGES.map((c) => c.id));

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 60;
const MAX_PER_OWNER = 50;

const SORTS = {
  newest: { createdAt: -1 },
  price_asc: { price: 1, createdAt: -1 },
  price_desc: { price: -1, createdAt: -1 },
};

const num = (v) => {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

// عدد صحيح بين min و max من الـ query (أو null لو مش صالح)
const intParam = (v, min, max) => {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};

// GET /api/properties?area=&college=&gender=&furnished=yes|no&bedrooms=&floor=&beds=&utilities=included|excluded
//                    &minPrice=&maxPrice=&q=&sort=&page=&limit=&mine=1
// - لو فيه area بيتم تجاهل college خالص (الفلتر بالمنطقة بس)
// - لو فيه college من غير area: السكنات كلها بتظهر مرتبة من المنطقة الأقرب للكلية للأبعد (nearby=0 يلغي ده)
// - bedrooms: 1-3 بالظبط و4 = 4 فأكتر | floor: 0-5 بالظبط و6 = 6 فأعلى | beds: 1-5 بالظبط و6 = 6 فأكتر
// بيرجع Array (متوافق مع الواجهات الحالية) والعدد الكلي في الهيدر X-Total-Count
export async function GET(request) {
  try {
    await connectToMongo();
    const sp = new URL(request.url).searchParams;

    // القيم لازم تكون من التصنيفات المعروفة (بيمنع أي قيم غريبة توصل للاستعلام)
    const area = sp.get("area");
    const college = sp.get("college");
    const gender = sp.get("gender"); // male | female
    const furnished = sp.get("furnished"); // "yes" | "no"
    const utilities = sp.get("utilities"); // "included" | "excluded"
    const bedrooms = intParam(sp.get("bedrooms"), 1, 4);
    const floor = intParam(sp.get("floor"), 0, 6);
    const beds = intParam(sp.get("beds"), 1, 6);
    const minPrice = num(sp.get("minPrice"));
    const maxPrice = num(sp.get("maxPrice"));
    const q = (sp.get("q") || "").trim().slice(0, 80);
    const sort = SORTS[sp.get("sort")] || SORTS.newest;
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(sp.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));

    const filter = {};
    const and = [];

    // كلية بدون منطقة + أولوية المنطقة مفعّلة (الافتراضي): بنعرض كل السكنات مرتبة من الأقرب للأبعد
    // بغض النظر عن الكلية اللي اختارها المالك. nearby=0 بيرجّع الفلترة العادية بالكلية.
    const byProximity = !!(!area && college && collegeIds.has(college) && sp.get("nearby") !== "0");

    if (area && areaIds.has(area)) filter.area = area;
    else if (byProximity) {
      // مفيش فلترة بالكلية هنا؛ الترتيب بيتعمل بعد الاستعلام
    } else if (college && collegeIds.has(college)) {
      // السكن يظهر لو الكلية دي من ضمن كلياته القريبة (أو الكلية القديمة للسكنات القديمة)
      and.push({ $or: [{ colleges: college }, { college }] });
    }

    // الجنس: ذكور/إناث بيشمل كمان السكنات اللي "للاتنين" والقديمة اللي مفيهاش الحقل
    if (gender && GENDER_IDS.includes(gender) && gender !== "any") filter.gender = { $in: [gender, "any", null] };

    if (furnished === "yes") filter.furnished = true;
    else if (furnished === "no") filter.furnished = { $ne: true }; // يشمل السكنات القديمة اللي مفيهاش الحقل

    if (utilities === "included") filter.utilitiesIncluded = true;
    else if (utilities === "excluded") filter.utilitiesIncluded = { $ne: true };

    if (bedrooms !== null) filter.bedrooms = bedrooms >= 4 ? { $gte: 4 } : bedrooms;
    if (floor !== null) filter.floor = floor >= 6 ? { $gte: 6 } : floor;
    if (beds !== null) filter.beds = beds >= 6 ? { $gte: 6 } : beds;

    if (minPrice !== null || maxPrice !== null) {
      filter.price = {};
      if (minPrice !== null) filter.price.$gte = minPrice;
      if (maxPrice !== null) filter.price.$lte = maxPrice;
    }
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      and.push({ $or: [{ title: rx }, { address: rx }, { description: rx }] });
    }
    if (and.length) filter.$and = and;

    let projection = "-owner -__v";
    if (sp.get("mine") === "1") {
      // سكنات المستخدم الحالي بس (بكل الحالات)
      const session = await auth();
      if (!session?.user?.id) return json({ message: "Unauthorized" }, 401);
      filter.owner = session.user.id;
      projection = "-__v";
    } else {
      filter.status = "active"; // الزوار يشوفوا المتاح بس
    }

    let properties;
    let total;
    if (byProximity) {
      // الترتيب بالقرب بيتعمل في الذاكرة ثم الترقيم (مجموعة السكنات صغيرة)
      const all = await Property.find(filter).select(projection).sort(sort).limit(2000).lean();
      const rank = (p) => areaRankForCollege(college, p.area);
      // sort ثابت: الترتيب الأصلي (حسب sort/الأحدث) بيتحفظ جوه نفس المنطقة
      all.sort((a, b) => rank(a) - rank(b));
      total = all.length;
      properties = all.slice((page - 1) * limit, page * limit);
    } else {
      [properties, total] = await Promise.all([
        Property.find(filter)
          .select(projection)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Property.countDocuments(filter),
      ]);
    }

    return json(properties, 200, {
      "X-Total-Count": String(total),
      "X-Page": String(page),
      "X-Limit": String(limit),
      "Access-Control-Expose-Headers": "X-Total-Count, X-Page, X-Limit",
    });
  } catch (err) {
    console.error("GET /api/properties error:", err);
    return json({ message: "Server error" }, 500);
  }
}

// POST /api/properties — owner أو admin بس
export async function POST(request) {
  try {
    if (!sameOriginOk(request)) return forbiddenOrigin();

    const gate = await requireRole(["owner", "admin"]);
    if (gate.error) return gate.error;
    const { session } = gate;

    const rl = await rateLimit(`property-create:${session.user.id}`, 20, 60 * 60 * 1000);
    if (rl.limited) {
      return json({ message: "محاولات كتير، حاول بعد شوية" }, 429, { "Retry-After": String(rl.retryAfter) });
    }

    const { data: body, tooLarge } = await readJson(request);
    if (tooLarge) return json({ message: "Payload too large" }, 413);

    const { data, error } = validateProperty(body, { partial: false });
    if (error) return json({ message: error }, 400);

    await connectToMongo();

    const count = await Property.countDocuments({ owner: session.user.id });
    if (count >= MAX_PER_OWNER) {
      return json({ message: `وصلت للحد الأقصى من السكنات (${MAX_PER_OWNER})` }, 403);
    }

    const property = await Property.create({
      ...data,
      images: data.images || [],
      amenities: data.amenities || [],
      owner: session.user.id,
      // إعلانات المالكين بتستنى موافقة الأدمن قبل ما تظهر للزوار
      status: session.user.role === "admin" ? "active" : "pending",
    });

    return json(property, 201);
  } catch (err) {
    console.error("POST /api/properties error:", err);
    return json({ message: "Server error" }, 500);
  }
}
