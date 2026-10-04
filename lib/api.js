// path: lib/api.js
// Helpers مشتركة لكل الـ API routes.
import { auth, connectToMongo, UserModel } from "@/lib/auth";

export function json(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers });
}

// حماية CSRF إضافية للطلبات اللي بتغيّر بيانات: لو الـ Origin موجود لازم يطابق الـ Host.
export function sameOriginOk(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // طلبات server-to-server / same-origin بدون Origin
  try {
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function forbiddenOrigin() {
  return json({ message: "Forbidden origin" }, 403);
}

// بيرجع { session } أو { error: Response }
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) return { error: json({ message: "لازم تسجل دخول الأول" }, 401) };
  return { session };
}

export async function requireRole(roles) {
  const gate = await requireUser();
  if (gate.error) return gate;
  // الدور بيتقرا من الداتابيز في كل عملية محمية (مش من التوكن بس)،
  // عشان أي أدمن/مالك اتسحبت صلاحياته أو اتحذف حسابه يتوقف فورًا.
  try {
    await connectToMongo();
    const fresh = await UserModel.findById(gate.session.user.id).select("role").lean();
    if (!fresh) return { error: json({ message: "لازم تسجل دخول الأول" }, 401) };
    gate.session.user.role = fresh.role;
  } catch (err) {
    console.error("requireRole db error:", err);
    return { error: json({ message: "Server error" }, 500) };
  }
  if (!roles.includes(gate.session.user.role)) {
    return { error: json({ message: "غير مسموح" }, 403) };
  }
  return gate;
}
