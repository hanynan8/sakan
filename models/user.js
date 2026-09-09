// path: models/user.js
import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    // إيميل أو تليفون (واحد منهم لازم يكون موجود)
    email: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
    phone: { type: String, trim: true, sparse: true, unique: true },

    password: { type: String, required: true },

    // student = طالب بيدور على سكن | owner = مالك بيعرض سكن | admin = مسؤول النظام
    role: {
      type: String,
      enum: ["student", "owner", "admin"],
      default: "student",
    },

    // نظام الإحالة (Refer & Earn)
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String, default: null },
    referralCount: { type: Number, default: 0 },
    referralEarnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// اسم كامل جاهز للاستخدام في الجلسة (session.user.name)
userSchema.virtual("name").get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

const User = models.User || mongoose.model("User", userSchema);
export default User;