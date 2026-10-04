// path: lib/auth.js
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { rateLimit, resetRateLimit, getClientIp } from "@/lib/rate-limit";
import { looksLikeEmail, normalizeEmail, normalizePhone } from "@/lib/validators";

// alias بنفس الاسم اللي بتستخدمه الـ API routes
export const connectToMongo = connectMongoDB;
export const UserModel = User;

// hash وهمي بيتقارن بيه لما اليوزر مش موجود (عشان وقت الرد يبقى متقارب ومايتعرفش مين مسجل)
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 12);

const ROLE_REFRESH_MS = 60 * 1000; // نعيد قراءة الدور من الداتابيز كل دقيقة

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: {
    signIn: "/signin",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const { identifier, password } = credentials || {};
        if (typeof identifier !== "string" || typeof password !== "string") return null;
        if (!identifier.trim() || !password || password.length > 200) return null;

        // ── Brute-force protection: لكل IP ولكل حساب ──
        const ip = getClientIp(request);
        const idKey = `login:id:${identifier.trim().toLowerCase()}`;
        const ipKey = `login:ip:${ip}`;
        if ((await rateLimit(ipKey, 30, 15 * 60 * 1000)).limited) return null;
        if ((await rateLimit(idKey, 8, 15 * 60 * 1000)).limited) return null;

        await connectToMongo();

        const isEmail = looksLikeEmail(identifier);
        const query = isEmail
          ? { email: normalizeEmail(identifier) }
          : { phone: normalizePhone(identifier) };
        if (!Object.values(query)[0]) {
          await bcrypt.compare(password, DUMMY_HASH);
          return null;
        }

        const user = await User.findOne(query).select("+password");
        const hash = user?.password || DUMMY_HASH;
        const valid = await bcrypt.compare(password, hash);
        if (!user || !valid) return null;

        await resetRateLimit(idKey); // دخول ناجح => نصفّر عداد المحاولات

        return {
          id: user._id.toString(),
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email || null,
          phone: user.phone || null,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.name = user.name;
        token.roleCheckedAt = Date.now();
        token.issuedAt = Date.now();
        return token;
      }

      // تحديث الدور/الاسم من الداتابيز دوريًا (أو عند طلب update() من الكلاينت)
      // عشان لو الأدمن غيّر دور مستخدم أو اتحذف حسابه يتطبّق قبل ما التوكن ينتهي.
      const stale = !token.roleCheckedAt || Date.now() - token.roleCheckedAt > ROLE_REFRESH_MS;
      if (token.id && (stale || trigger === "update")) {
        try {
          await connectToMongo();
          const fresh = await User.findById(token.id).select("role firstName lastName passwordChangedAt").lean();
          if (!fresh) return null; // الحساب اتحذف => الجلسة تنتهي
          // كلمة المرور اتغيّرت بعد ما الجلسة دي اتعملت => الجلسة تنتهي
          if (fresh.passwordChangedAt && (token.issuedAt || 0) < fresh.passwordChangedAt.getTime()) return null;
          token.role = fresh.role;
          token.name = `${fresh.firstName} ${fresh.lastName}`.trim();
          token.roleCheckedAt = Date.now();
        } catch (err) {
          console.error("jwt refresh error:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name || session.user.name;
        session.user.role = token.role || "student";
        session.user.phone = token.phone || null;
      }
      return session;
    },
  },
});
