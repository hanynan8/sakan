import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    status: { type: String, required: true },

    payer: {
      id: String,
      email: String,
      name: {
        given_name: String,
        surname: String,
      },
    },

    amount: {
      currency: String,
      value: String,
    },

    captureId: String,
    paymentMethod: { type: String, default: "PayPal" },

    isRefunded: { type: Boolean, default: false },
    refundId: { type: String },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    shipping: {
      address_line_1: String,
      address_line_2: String,
      admin_area_2: String,
      admin_area_1: String,
      postal_code: String,
      country_code: String,
    },

    invoiceId: String,
    referenceId: String,

    rawResponse: Object,
  },
  { timestamps: true }
);

// 👇 ده المهم
export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);
