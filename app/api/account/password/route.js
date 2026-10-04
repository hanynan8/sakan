// path: app/api/account/password/route.js
// POST /api/account/password { currentPassword, newPassword }
import bcrypt from "bcryptjs";
import { connectToMongo, UserModel } from "@/lib/auth";
import { json, requireUser, sameOriginOk, forbiddenOrigin } from "@/lib/api";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { isString, readJson, validatePassword } from "@/lib/validators";

export async function POST(request) {
  try {
    if (!sameOriginOk(request)) return forbiddenOrigin();
    const gate = await requireUser();
    if (gate.error) return gate.error;
    const userId = gate.session.user.id;

    const key = `pw-change:${userId}`;
    const rl = rateLimit(key, 5, 15 * 60 * 1000);
    if (rl.limited) {
      return json({ message: "محاولات كتير، حاول بعد شوية" }, 429, { "Retry-After": String(rl.retryAfter) });
    }

    const { data: body } = await readJson(request, 4 * 1024);
    if (!isString(body?.currentPassword) || !isString(body?.newPassword)) {
      return json({ message: "البيانات ناقصة" }, 400);
    }
    const pwError = validatePassword(body.newPassword);
    if (pwError) return json({ message: pwError }, 400);
    if (body.newPassword === body.currentPassword) {
      return json({ message: "كلمة المرور الجديدة لازم تكون مختلفة عن الحالية" }, 400);
    }

    await connectToMongo();
    const user = await UserModel.findById(userId).select("+password");
    if (!user) return json({ message: "غير موجود" }, 404);

    if (!(await bcrypt.compare(body.currentPassword, user.password))) {
      return json({ message: "كلمة المرور الحالية غير صحيحة" }, 403);
    }

    user.password = await bcrypt.hash(body.newPassword, 12);
    await user.save();
    resetRateLimit(key);
    return json({ ok: true });
  } catch (err) {
    console.error("POST /api/account/password error:", err);
    return json({ message: "Server error" }, 500);
  }
}
