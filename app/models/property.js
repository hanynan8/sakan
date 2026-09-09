// path: models/property.js
import mongoose, { Schema, models } from "mongoose";

const propertySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // السعر شهريًا بالجنيه المصري
    price: { type: Number, required: true },

    // نوع السكن
    type: {
      type: String,
      enum: ["apartment", "room", "shared-room", "studio"],
      default: "apartment",
    },

    // عدد الأسرّة/الغرف المتاحة
    bedrooms: { type: Number, default: 1 },
    capacity: { type: Number, default: 1 },

    // مرتبط بتصنيفات lib/taxonomy.js (بالـ id)
    area: { type: String, required: true },
    college: { type: String, default: null },
    campus: { type: String, default: null },

    address: { type: String, default: "" },
    images: [{ type: String }],
    amenities: [{ type: String }], // مثال: واي فاي، تكييف، مصعد...

    // المالك اللي أضاف السكن (owner أو admin)
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

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

const Property = models.Property || mongoose.model("Property", propertySchema);
export default Property;