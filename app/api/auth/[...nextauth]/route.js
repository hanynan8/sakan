// path: app/api/auth/[...nextauth]/route.js
// مسارات NextAuth (signin / signout / session / csrf ...).
// التسجيل في route منفصل: app/api/auth/register/route.js
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
