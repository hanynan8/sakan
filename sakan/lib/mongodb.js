// path: lib/mongodb.js
// اتصال Mongoose الأساسي (قاعدة بيانات Next-Auth: المستخدمين والسكنات والمفضلة).
// بنخزّن الـ promise نفسه في global عشان الطلبات المتزامنة ما تفتحش أكتر من اتصال،
// ومع الـ hot-reload في التطوير ما تتكررش الاتصالات.
import mongoose from "mongoose";

if (!globalThis._mongooseMain) globalThis._mongooseMain = { promise: null };

export const connectMongoDB = async () => {
  const uri = process.env.MONGO_AUTH_URI;
  if (!uri) throw new Error("MONGO_AUTH_URI is not defined in environment");

  if (mongoose.connection.readyState === 1) return mongoose.connection;

  const cache = globalThis._mongooseMain;
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        dbName: "Next-Auth", // ⬅️ إجباري علشان يسيب test
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => m.connection)
      .catch((err) => {
        cache.promise = null; // يسمح بإعادة المحاولة في الطلب الجاي
        throw err;
      });
  }
  return cache.promise;
};
