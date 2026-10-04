// path: app/api/admin/properties/route.js — كل السكنات بكل الحالات + اسم المالك (أدمن بس)
// التعديل/الحذف بيتم من /api/properties/[id] (الأدمن مسموح له).
import { connectToMongo } from "@/lib/auth";
import Property from "@/models/property";
import "@/models/user"; // عشان populate يلاقي الموديل
import { json, requireRole } from "@/lib/api";
import { escapeRegex } from "@/lib/validators";
import { PROPERTY_STATUSES } from "@/lib/property-validation";

export async function GET(request) {
  try {
    const gate = await requireRole(["admin"]);
    if (gate.error) return gate.error;
    await connectToMongo();

    const sp = new URL(request.url).searchParams;
    const q = (sp.get("q") || "").trim().slice(0, 60);
    const status = sp.get("status");
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
    const limit = 30;

    const filter = {};
    if (PROPERTY_STATUSES.includes(status)) filter.status = status;
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ title: rx }, { address: rx }];
    }

    const [items, total] = await Promise.all([
      Property.find(filter)
        .populate("owner", "firstName lastName email phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Property.countDocuments(filter),
    ]);

    return json({
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      properties: items.map((p) => ({
        id: p._id.toString(),
        title: p.title,
        price: p.price,
        status: p.status,
        area: p.area,
        createdAt: p.createdAt,
        owner: p.owner
          ? { name: `${p.owner.firstName} ${p.owner.lastName}`.trim(), contact: p.owner.email || p.owner.phone || "" }
          : null,
      })),
    });
  } catch (err) {
    console.error("GET /api/admin/properties error:", err);
    return json({ message: "Server error" }, 500);
  }
}
