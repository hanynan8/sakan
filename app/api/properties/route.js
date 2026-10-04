// path: app/api/properties/route.js
import { auth, connectToMongo } from "@/lib/auth";
import Property from "@/models/property";
import { AREAS, COLLEGES, CAMPUSES } from "@/lib/taxonomy";
import { json, requireRole, sameOriginOk, forbiddenOrigin } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { escapeRegex, readJson } from "@/lib/validators";
import { validateProperty, PROPERTY_TYPES } from "@/lib/property-validation";

const areaIds = new Set(AREAS.map((a) => a.id));
const collegeIds = new Set(COLLEGES.map((c) => c.id));
const campusIds = new Set(CAMPUSES.map((c) => c.id));

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

// GET /api/properties?area=&college=&campus=&type=&minPrice=&maxPrice=&q=&sort=&page=&limit=&mine=1
// بيرجع Array (متوافق مع الواجهات الحالية) والعدد الكلي في الهيدر X-Total-Count
export async function GET(request) {
  try {
    await connectToMongo();
    const sp = new URL(request.url).searchParams;

    // القيم لازم تكون من التصنيفات المعروفة (بيمنع أي قيم غريبة توصل للاستعلام)
    const area = sp.get("area");
    const college = sp.get("college");
    const campus = sp.get("campus");
    const type = sp.get("type");
    const minPrice = num(sp.get("minPrice"));
    const maxPrice = num(sp.get("maxPrice"));
    const q = (sp.get("q") || "").trim().slice(0, 80);
    const sort = SORTS[sp.get("sort")] || SORTS.newest;
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(sp.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));

    const filter = {};
    if (area && areaIds.has(area)) filter.area = area;
    if (college && collegeIds.has(college)) filter.college = college;
    if (campus && campusIds.has(campus)) filter.campus = campus;
    if (type && PROPERTY_TYPES.includes(type)) filter.type = type;
    if (minPrice !== null || maxPrice !== null) {
      filter.price = {};
      if (minPrice !== null) filter.price.$gte = minPrice;
      if (maxPrice !== null) filter.price.$lte = maxPrice;
    }
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ title: rx }, { address: rx }, { description: rx }];
    }

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

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .select(projection)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Property.countDocuments(filter),
    ]);

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

    const rl = rateLimit(`property-create:${session.user.id}`, 20, 60 * 60 * 1000);
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
      status: "active",
    });

    return json(property, 201);
  } catch (err) {
    console.error("POST /api/properties error:", err);
    return json({ message: "Server error" }, 500);
  }
}
