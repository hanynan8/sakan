// path: app/api/auth/register/route.js
import bcrypt from "bcryptjs";
import { connectToMongo, UserModel } from "@/lib/auth";
import { json, sameOriginOk, forbiddenOrigin } from "@/lib/api";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  cleanName,
  isString,
  isPlainObject,
  normalizeEmail,
  normalizePhone,
  readJson,
  validatePassword,
} from "@/lib/validators";

// طالب أو مالك بس مسموح من فورم التسجيل (الأدمن بيتحدد من لوحة الإدارة أو الداتابيز)
const VALID_SIGNUP_ROLES = ["student", "owner"];

export async function POST(request) {
  try {
    if (!sameOriginOk(request)) return forbiddenOrigin();

    // 5 حسابات جديدة كل ساعة لكل IP
    const rl = await rateLimit(`register:${getClientIp(request)}`, 5, 60 * 60 * 1000);
    if (rl.limited) {
      return json({ message: "محاولات كتير، حاول بعد شوية" }, 429, { "Retry-After": String(rl.retryAfter) });
    }

    const { data: body, tooLarge } = await readJson(request, 10 * 1024);
    if (tooLarge) return json({ message: "Payload too large" }, 413);
    if (!isPlainObject(body)) return json({ message: "Invalid body" }, 400);

    const firstName = cleanName(body.firstName);
    const lastName = cleanName(body.lastName);
    if (!firstName || !lastName) return json({ message: "الاسم الأول والأخير مطلوبين" }, 400);

    // لازم إيميل أو تليفون كـ string (بيمنع NoSQL injection بـ object)
    const hasEmail = isString(body.email) && body.email.trim() !== "";
    const hasPhone = isString(body.phone) && body.phone.trim() !== "";
    if (!hasEmail && !hasPhone) return json({ message: "لازم تدخل بريد إلكتروني أو رقم هاتف" }, 400);

    const email = hasEmail ? normalizeEmail(body.email) : null;
    const phone = !hasEmail && hasPhone ? normalizePhone(body.phone) : null;
    if (hasEmail && !email) return json({ message: "البريد الإلكتروني غير صحيح" }, 400);
    if (!hasEmail && !phone) return json({ message: "رقم الهاتف غير صحيح" }, 400);

    const pwError = validatePassword(body.password);
    if (pwError) return json({ message: pwError }, 400);

    const role = VALID_SIGNUP_ROLES.includes(body.role) ? body.role : "student";

    await connectToMongo();

    const existing = await UserModel.findOne(email ? { email } : { phone }).select("_id").lean();
    if (existing) {
      return json({ message: email ? "Email already registered" : "Phone already registered" }, 409);
    }

    const hashed = await bcrypt.hash(body.password, 12);
    try {
      const user = await UserModel.create({
        firstName,
        lastName,
        password: hashed,
        ...(email ? { email } : { phone }),
        role,
      });
      return json({ message: "User created", id: user._id }, 201);
    } catch (err) {
      // سباق (race) على الـ unique index
      if (err?.code === 11000) {
        return json({ message: email ? "Email already registered" : "Phone already registered" }, 409);
      }
      throw err;
    }
  } catch (err) {
    console.error("register error:", err);
    return json({ message: "Server error" }, 500);
  }
}
