// path: app/api/account/route.js
//   GET    /api/account  → بيانات حسابي
//   PATCH  /api/account  → تعديل الاسم
import { connectToMongo, UserModel } from "@/lib/auth";
import { json, requireUser, sameOriginOk, forbiddenOrigin } from "@/lib/api";
import { cleanName, readJson } from "@/lib/validators";

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
