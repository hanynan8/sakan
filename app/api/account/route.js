// path: app/api/account/route.js
//   GET    /api/account  → بيانات حسابي
//   PATCH  /api/account  → تعديل الاسم
//   DELETE /api/account  → حذف حسابي (بيطلب كلمة المرور) + سكناتي ومفضلتي
import bcrypt from "bcryptjs";
import { connectToMongo, UserModel } from "@/lib/auth";
import Property from "@/models/property";
import Favorite from "@/models/favorite";
import { json, requireUser, sameOriginOk, forbiddenOrigin } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { cleanName, isString, readJson } from "@/lib/validators";

export async function GET() {
  try {
    const gate = await requireUser();
    if (gate.error) return gate.error;
    await connectToMongo();
    const user = await UserModel.findById(gate.session.user.id).lean();
    if (!user) return json({ message: "غير موجود" }, 404);
    return json({
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email || null,
      phone: user.phone || null,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("GET /api/account error:", err);
    return json({ message: "Server error" }, 500);
  }
}

export async function PATCH(request) {
  try {
    if (!sameOriginOk(request)) return forbiddenOrigin();
    const gate = await requireUser();
    if (gate.error) return gate.error;

    const { data: body } = await readJson(request, 4 * 1024);
    const firstName = cleanName(body?.firstName);
    const lastName = cleanName(body?.lastName);
    if (!firstName || !lastName) return json({ message: "الاسم الأول والأخير مطلوبين" }, 400);

    await connectToMongo();
    const user = await UserModel.findByIdAndUpdate(
      gate.session.user.id,
      { $set: { firstName, lastName } },
      { new: true }
    ).lean();
    if (!user) return json({ message: "غير موجود" }, 404);
    return json({ ok: true, firstName: user.firstName, lastName: user.lastName });
  } catch (err) {
    console.error("PATCH /api/account error:", err);
    return json({ message: "Server error" }, 500);
  }
}

export async function DELETE(request) {
  try {
    if (!sameOriginOk(request)) return forbiddenOrigin();
    const gate = await requireUser();
    if (gate.error) return gate.error;
    const userId = gate.session.user.id;

    const rl = rateLimit(`account-delete:${userId}`, 5, 15 * 60 * 1000);
    if (rl.limited) return json({ message: "محاولات كتير، حاول بعد شوية" }, 429);

    const { data: body } = await readJson(request, 2 * 1024);
    if (!isString(body?.password)) return json({ message: "كلمة المرور مطلوبة" }, 400);

    await connectToMongo();
    const user = await UserModel.findById(userId).select("+password role");
    if (!user) return json({ message: "غير موجود" }, 404);
    if (!(await bcrypt.compare(body.password, user.password))) {
      return json({ message: "كلمة المرور غير صحيحة" }, 403);
    }

    // مانسمحش بحذف آخر أدمن (عشان النظام مايفضلش من غير مسؤول)
    if (user.role === "admin") {
      const admins = await UserModel.countDocuments({ role: "admin" });
      if (admins <= 1) return json({ message: "ماينفعش تحذف آخر حساب أدمن" }, 400);
    }

    const myProps = await Property.find({ owner: userId }).select("_id").lean();
    await Promise.all([
      Favorite.deleteMany({ $or: [{ user: userId }, { property: { $in: myProps.map((p) => p._id) } }] }),
      Property.deleteMany({ owner: userId }),
      UserModel.deleteOne({ _id: userId }),
    ]);
    return json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/account error:", err);
    return json({ message: "Server error" }, 500);
  }
}
