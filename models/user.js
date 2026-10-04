// path: models/user.js
import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },

    // إيميل أو تليفون (واحد منهم لازم يكون موجود)
    email: { type: String, trim: true, lowercase: true, sparse: true, unique: true, maxlength: 254 },
    phone: { type: String, trim: true, sparse: true, unique: true, maxlength: 20 },

    password: { type: String, required: true, select: false },
    // بيتحدّث عند تغيير كلمة المرور: أي جلسة اتعملت قبله بتنتهي
    passwordChangedAt: { type: Date, default: null },

    // student = طالب بيدور على سكن | owner = مالك بيعرض سكن | admin = مسؤول النظام
    role: {
      type: String,
      enum: ["student", "owner", "admin"],
      default: "student",
    },
  },
  { timestamps: true }
);

// لازم يكون فيه إيميل أو تليفون
userSchema.pre("validate", function (next) {
  if (!this.email && !this.phone) {
    return next(new Error("Email or phone is required"));
  }
  next();
});

// اسم كامل جاهز للاستخدام في الجلسة (session.user.name)
userSchema.virtual("name").get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});
userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.passwordChangedAt;
    delete ret.__v;
    return ret;
  },
});
userSchema.set("toObject", { virtuals: true });

const User = models.User || mongoose.model("User", userSchema);
export default User;
