// path: models/property.js
import mongoose, { Schema, models } from "mongoose";

const propertySchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    description: { type: String, default: "", maxlength: 3000 },

    // السعر شهريًا بالجنيه المصري
    price: { type: Number, required: true, min: 1, max: 1000000 },

    // نوع السكن
    type: {
      type: String,
      enum: ["apartment", "room", "shared-room", "studio"],
      default: "apartment",
    },

    // عدد الأسرّة/الغرف المتاحة
    bedrooms: { type: Number, default: 1, min: 0, max: 50 },
    capacity: { type: Number, default: 1, min: 1, max: 100 },

    // مرتبط بتصنيفات lib/taxonomy.js (بالـ id)
    area: { type: String, required: true },
    college: { type: String, default: null },
    campus: { type: String, default: null },

    address: { type: String, default: "", maxlength: 200 },
    images: { type: [{ type: String, maxlength: 600 }], validate: (v) => v.length <= 10 },
    amenities: { type: [{ type: String, maxlength: 40 }], validate: (v) => v.length <= 20 }, // مثال: واي فاي، تكييف، مصعد...

    // المالك اللي أضاف السكن (owner أو admin)
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    status: {
      type: String,
      enum: ["active", "hidden", "rented"],
      default: "active",
    },
  },
  { timestamps: true }
);

propertySchema.index({ area: 1 });
propertySchema.index({ college: 1 });
propertySchema.index({ campus: 1 });
propertySchema.index({ status: 1, createdAt: -1 });
propertySchema.index({ price: 1 });

const Property = models.Property || mongoose.model("Property", propertySchema);
export default Property;
