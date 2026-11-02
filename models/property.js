// path: models/property.js
import mongoose, { Schema, models } from "mongoose";
import { GENDER_IDS } from "@/lib/taxonomy";

const propertySchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    description: { type: String, default: "", maxlength: 3000 },

    // السعر شهريًا بالجنيه المصري
    price: { type: Number, required: true, min: 1, max: 1000000 },

    // الجنس المسموح بالسكن فيه (male / female / any). السكنات القديمة بدون قيمة بتتعامل كـ any
    gender: { type: String, enum: GENDER_IDS, default: "any", index: true },

    // مفروشة (true) أو غير مفروشة (false) — القديم بدون قيمة بيتعامل كغير مفروش
    furnished: { type: Boolean, default: false, index: true },

    // عدد الغرف + عدد السراير + السعة (عدد الأفراد)
    bedrooms: { type: Number, default: 1, min: 0, max: 50 },
    beds: { type: Number, default: null, min: 1, max: 100 },
    capacity: { type: Number, default: 1, min: 1, max: 100 },

    // الدور (0 = أرضي)
    floor: { type: Number, default: null, min: 0, max: 50 },

    // شامل مياه وكهربا وغاز (true) أو غير شامل (false)
    utilitiesIncluded: { type: Boolean, default: false },

    // مرتبط بتصنيفات lib/taxonomy.js (بالـ id)
    area: { type: String, required: true },
    // الكليات القريبة من السكن (المالك بيختار واحدة أو أكتر)
    colleges: { type: [{ type: String, maxlength: 40 }], default: [], validate: (v) => v.length <= 25 },
    // قديم: كان بيخزن كلية واحدة بس. لسه بنقراه للسكنات القديمة (اتشال الحرم الجامعي)
    college: { type: String, default: null },

    address: { type: String, default: "", maxlength: 200 },
    images: { type: [{ type: String, maxlength: 600 }], validate: (v) => v.length <= 10 },
    amenities: { type: [{ type: String, maxlength: 40 }], validate: (v) => v.length <= 20 }, // مثال: واي فاي، تكييف، مصعد...

    // المالك اللي أضاف السكن (owner أو admin)
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // pending = مستني موافقة الأدمن (إعلانات المالكين الجديدة) | active = ظاهر للكل
    status: {
      type: String,
      enum: ["pending", "active", "hidden", "rented"],
      default: "pending",
    },
  },
  { timestamps: true }
);

propertySchema.index({ area: 1 });
propertySchema.index({ college: 1 });
propertySchema.index({ colleges: 1 });
propertySchema.index({ bedrooms: 1 });
propertySchema.index({ status: 1, createdAt: -1 });
propertySchema.index({ price: 1 });

const Property = models.Property || mongoose.model("Property", propertySchema);
export default Property;
