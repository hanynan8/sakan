import mongoose from "mongoose";

await mongoose.connect(process.env.MONGO_AUTH_URI, { dbName: "Next-Auth" });
const admins = await mongoose.connection
  .collection("users")
  .find({ role: "admin" }, { projection: { email: 1, phone: 1, firstName: 1 } })
  .toArray();
console.log(admins.length ? admins : "مفيش أدمن");
await mongoose.disconnect();
