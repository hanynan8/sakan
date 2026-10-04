// path: app/api/favorites/route.js
// المفضلة للمستخدم الحالي.
//   GET    /api/favorites            → السكنات المفضلة (كاملة) الأحدث أولًا
//   GET    /api/favorites?idsOnly=1  → أرقام السكنات بس (لتلوين القلب في الكروت)
//   POST   /api/favorites {propertyId}
//   DELETE /api/favorites?propertyId=...
import mongoose from "mongoose";
import { connectToMongo } from "@/lib/auth";
import Favorite from "@/models/favorite";
import Property from "@/models/property";
import { json, requireUser, sameOriginOk, forbiddenOrigin } from "@/lib/api";
import { readJson } from "@/lib/validators";

const MAX_FAVORITES = 200;
const validId = (id) => typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

export async function GET(request) {
  try {
    const gate = await requireUser();
    if (gate.error) return gate.error;
    await connectToMongo();

    const userId = gate.session.user.id;
    const idsOnly = new URL(request.url).searchParams.get("idsOnly") === "1";

    const favs = await Favorite.find({ user: userId }).sort({ createdAt: -1 }).limit(MAX_FAVORITES).lean();
    if (idsOnly) return json(favs.map((f) => f.property.toString()));

    const properties = await Property.find({
      _id: { $in: favs.map((f) => f.property) },
      status: { $ne: "hidden" },
    })
      .select("-owner -__v")
      .lean();
    const byId = new Map(properties.map((p) => [p._id.toString(), p]));
    // نحافظ على ترتيب الإضافة (الأحدث أولًا)
    const ordered = favs.map((f) => byId.get(f.property.toString())).filter(Boolean);
    return json(ordered);
  } catch (err) {
    console.error("GET /api/favorites error:", err);
    return json({ message: "Server error" }, 500);
  }
}

export async function POST(request) {
  try {
    if (!sameOriginOk(request)) return forbiddenOrigin();
    const gate = await requireUser();
    if (gate.error) return gate.error;

    const { data: body } = await readJson(request, 2 * 1024);
    const propertyId = body?.propertyId;
    if (!validId(propertyId)) return json({ message: "Invalid propertyId" }, 400);

    await connectToMongo();
    const userId = gate.session.user.id;

    const exists = await Property.exists({ _id: propertyId, status: { $ne: "hidden" } });
    if (!exists) return json({ message: "السكن غير موجود" }, 404);

    const count = await Favorite.countDocuments({ user: userId });
    if (count >= MAX_FAVORITES) return json({ message: `وصلت للحد الأقصى (${MAX_FAVORITES}) في المفضلة` }, 403);

    // upsert => آمن لو اتبعت الطلب مرتين
    await Favorite.updateOne(
      { user: userId, property: propertyId },
      { $setOnInsert: { user: userId, property: propertyId } },
      { upsert: true }
    );
    return json({ ok: true, propertyId }, 201);
  } catch (err) {
    console.error("POST /api/favorites error:", err);
    return json({ message: "Server error" }, 500);
  }
}

export async function DELETE(request) {
  try {
    if (!sameOriginOk(request)) return forbiddenOrigin();
    const gate = await requireUser();
    if (gate.error) return gate.error;

    const propertyId = new URL(request.url).searchParams.get("propertyId");
    if (!validId(propertyId)) return json({ message: "Invalid propertyId" }, 400);

    await connectToMongo();
    await Favorite.deleteOne({ user: gate.session.user.id, property: propertyId });
    return json({ ok: true, propertyId });
  } catch (err) {
    console.error("DELETE /api/favorites error:", err);
    return json({ message: "Server error" }, 500);
  }
}
