// path: app/api/admin/users/[id]/route.js — تغيير دور مستخدم / حذفه (أدمن بس)
import mongoose from "mongoose";
import { connectToMongo, UserModel } from "@/lib/auth";
import Property from "@/models/property";
import Favorite from "@/models/favorite";
import { json, requireRole, sameOriginOk, forbiddenOrigin } from "@/lib/api";
import { readJson } from "@/lib/validators";

const ROLES = ["student", "owner", "admin"];

async function guard(request, params) {
  if (!sameOriginOk(request)) return { error: forbiddenOrigin() };
  const gate = await requireRole(["admin"]);
  if (gate.error) return gate;
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return { error: json({ message: "Invalid id" }, 400) };
  if (id === gate.session.user.id) {
    return { error: json({ message: "ماينفعش تعدّل أو تحذف حسابك من هنا" }, 400) };
  }
  return { id };
}

export async function PATCH(request, { params }) {
  try {
    const g = await guard(request, params);
    if (g.error) return g.error;

    const { data: body } = await readJson(request, 2 * 1024);
    if (!ROLES.includes(body?.role)) return json({ message: "الدور غير صحيح" }, 400);

    await connectToMongo();
    const user = await UserModel.findByIdAndUpdate(g.id, { $set: { role: body.role } }, { new: true }).lean();
    if (!user) return json({ message: "غير موجود" }, 404);
    return json({ ok: true, id: g.id, role: user.role });
  } catch (err) {
    console.error("PATCH /api/admin/users/[id] error:", err);
    return json({ message: "Server error" }, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const g = await guard(request, params);
    if (g.error) return g.error;

    await connectToMongo();
    const user = await UserModel.findById(g.id).select("role").lean();
    if (!user) return json({ message: "غير موجود" }, 404);

    const props = await Property.find({ owner: g.id }).select("_id").lean();
    await Promise.all([
      Favorite.deleteMany({ $or: [{ user: g.id }, { property: { $in: props.map((p) => p._id) } }] }),
      Property.deleteMany({ owner: g.id }),
      UserModel.deleteOne({ _id: g.id }),
    ]);
    return json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/users/[id] error:", err);
    return json({ message: "Server error" }, 500);
  }
}
