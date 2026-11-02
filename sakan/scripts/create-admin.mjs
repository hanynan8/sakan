// scripts/create-admin.mjs
// إنشاء أول أدمن (أو ترقية مستخدم موجود لأدمن).
//
//   node --env-file=.env.local scripts/create-admin.mjs <email-or-phone> <password> [firstName] [lastName]
//
// مثال:
//   node --env-file=.env.local scripts/create-admin.mjs admin@sakan.com "StrongPass1" Admin Sakan
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const [identifier, password, firstName = "Admin", lastName = "Sakan"] = process.argv.slice(2);
if (!identifier || !password) {
  console.error('Usage: node --env-file=.env.local scripts/create-admin.mjs <email-or-phone> <password> [firstName] [lastName]');
  process.exit(1);
}
if (!process.env.MONGO_AUTH_URI) {
  console.error("MONGO_AUTH_URI is not set (استخدم --env-file=.env.local)");
  process.exit(1);
}
if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
  console.error("Password must be 8+ chars with an uppercase letter and a number");
  process.exit(1);
}

const isEmail = identifier.includes("@");
const key = isEmail ? "email" : "phone";
const value = isEmail ? identifier.trim().toLowerCase() : identifier.replace(/[\s\-().]/g, "");

await mongoose.connect(process.env.MONGO_AUTH_URI, { dbName: "Next-Auth" });
const users = mongoose.connection.collection("users");

const existing = await users.findOne({ [key]: value });
if (existing) {
  await users.updateOne({ _id: existing._id }, { $set: { role: "admin" } });
  console.log(`✔ ${value} موجود بالفعل — اتحوّل لأدمن.`);
} else {
  const now = new Date();
  await users.insertOne({
    firstName, lastName, [key]: value,
    password: await bcrypt.hash(password, 12),
    role: "admin", passwordChangedAt: null, createdAt: now, updatedAt: now, __v: 0,
  });
  console.log(`✔ اتعمل حساب أدمن جديد: ${value}`);
}
await mongoose.disconnect();
