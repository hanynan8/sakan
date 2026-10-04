// path: models/booking.js
// طلب حجز: طالب بيطلب سكن معين، والأدمن بيتابع الطلب ويأكده/يلغيه.
import mongoose, { Schema, models } from "mongoose";

const bookingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    phone: { type: String, required: true, maxlength: 20 }, // رقم التواصل (واتساب)
    moveInDate: { type: Date, default: null },
    message: { type: String, default: "", maxlength: 500 },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

// طلب واحد "معلّق" بس لكل (طالب + سكن) — بيمنع التكرار والسبام
bookingSchema.index(
  { user: 1, property: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);
bookingSchema.index({ status: 1, createdAt: -1 });

const Booking = models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;
