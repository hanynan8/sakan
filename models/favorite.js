// path: models/favorite.js
// المفضلة: كل سجل = مستخدم + سكن (مسجّل مرة واحدة بس لكل زوج).
import mongoose, { Schema, models } from "mongoose";

const favoriteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, property: 1 }, { unique: true });
favoriteSchema.index({ user: 1, createdAt: -1 });

const Favorite = models.Favorite || mongoose.model("Favorite", favoriteSchema);
export default Favorite;
