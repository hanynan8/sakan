import mongoose from "mongoose";

let isConnected = false;

export const connectMongoDB = async () => {
  if (isConnected) {
    console.log("MongoDB already connected ✅:", mongoose.connection.name);
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_AUTH_URI, {
      dbName: "Next-Auth", // ⬅️ إجباري علشان يسيب test
    });
    isConnected = true;
    console.log("Connected to MongoDB 🚀:", mongoose.connection.name);
  } catch (error) {
    console.error("MongoDB connection error ❌:", error);
  }
};
