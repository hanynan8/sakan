// path: app/api/admin/users/route.js — قائمة المستخدمين (أدمن بس)
import { connectToMongo, UserModel } from "@/lib/auth";
import { json, requireRole } from "@/lib/api";
import { escapeRegex } from "@/lib/validators";

const ROLES = ["student", "owner", "admin"];

export async function GET(request) {
  try {
    const gate = await requireRole(["admin"]);
    if (gate.error) return gate.error;
    await connectToMongo();

    const sp = new URL(request.url).searchParams;
    const q = (sp.get("q") || "").trim().slice(0, 60);
    const role = sp.get("role");
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
    const limit = 30;

    const filter = {};
    if (ROLES.includes(role)) filter.role = role;
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }, { phone: rx }];
    }

    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(filter),
    ]);

    return json({
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      users: users.map((u) => ({
        id: u._id.toString(),
        name: `${u.firstName} ${u.lastName}`.trim(),
        email: u.email || null,
        phone: u.phone || null,
        role: u.role,
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    console.error("GET /api/admin/users error:", err);
    return json({ message: "Server error" }, 500);
  }
}
