// path: lib/auth.js
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";

// alias بنفس الاسم اللي بيستخدمه app/api/auth/[...nextauth]/route.js
export const connectToMongo = connectMongoDB;
export const UserModel = User;

// بيولّد referralCode فريد من أول اسم المستخدم (مثال: MOHAMEDX4F2)
export async function getUniqueReferralCode(firstName) {
  const base = String(firstName || "USER")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 6) || "USER";

  let code;
  let exists = true;
  while (exists) {
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    code = `${base}${suffix}`;
    exists = await User.exists({ referralCode: code });
  }
  return code;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
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
      async authorize(credentials) {
        const { identifier, password } = credentials || {};
        if (!identifier || !password) return null;

        await connectToMongo();

        const isEmail = /\S+@\S+\.\S+/.test(identifier);
        const user = await User.findOne(
          isEmail ? { email: identifier.trim().toLowerCase() } : { phone: identifier.trim() }
        );
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email || null,
          phone: user.phone || null,
          role: user.role,
          referralCode: user.referralCode,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.referralCode = user.referralCode;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role || "student";
        session.user.phone = token.phone || null;
        session.user.referralCode = token.referralCode || null;
      }
      return session;
    },
  },
});