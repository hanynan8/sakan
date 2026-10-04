// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { safeCallbackUrl } from "@/lib/safe-redirect";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = req.nextUrl;

  // حماية /profile: أي حد مش مسجل دخول بيتحول لصفحة /signin (مع callbackUrl يرجعه هنا تاني بعد الدخول)
  if (!token && pathname.startsWith("/profile")) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", safeCallbackUrl(pathname));
    return NextResponse.redirect(signInUrl);
  }

  // لوحة الإدارة: للأدمن بس (التحقق الحقيقي بيتم برضو في الـ API)
  if (token && pathname.startsWith("/profile/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/profile", req.url));
  }

  // لو مسجل دخول بالفعل ومحاول يدخل /signin أو /signup تاني، رجّعه لبروفايله
  if (token && (pathname === "/signin" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/signin", "/signup"],
};
