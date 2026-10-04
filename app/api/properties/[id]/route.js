// path: app/api/properties/[id]/route.js
import { auth, connectToMongo } from "@/lib/auth";
import Property from "@/models/property";
import Favorite from "@/models/favorite";
import mongoose from "mongoose";
import { json, requireUser, sameOriginOk, forbiddenOrigin } from "@/lib/api";
import { readJson } from "@/lib/validators";
import { validateProperty } from "@/lib/property-validation";

const EDITABLE = ["title", "description", "price", "type", "bedrooms", "capacity", "area", "college", "campus", "address", "images", "amenities", "status"];

// GET /api/properties/:id — تفاصيل سكن واحد
// السكنات المخفية بتظهر لصاحبها والأدمن بس، وبيانات المالك (owner) مش بتتعرض للعامة.
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return json({ message: "Invalid id" }, 400);

    await connectToMongo();
    const property = await Property.findById(id).select("-__v").lean();
    if (!property) return json({ message: "غير موجود" }, 404);

    if (property.status === "hidden") {
      const session = await auth();
      const isOwner = session?.user?.id && property.owner.toString() === session.user.id;
      if (!isOwner && session?.user?.role !== "admin") return json({ message: "غير موجود" }, 404);
    }

    const { owner, ...publicData } = property;
    return json(publicData, 200);
  } catch (err) {
    console.error("GET /api/properties/[id] error:", err);
    return json({ message: "Server error" }, 500);
  }
}

// PATCH /api/properties/:id — تعديل (المالك نفسه أو admin بس)
export async function PATCH(request, { params }) {
  try {
    if (!sameOriginOk(request)) return forbiddenOrigin();
    const gate = await requireUser();
    if (gate.error) return gate.error;
    const { session } = gate;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return json({ message: "Invalid id" }, 400);

    await connectToMongo();
    const property = await Property.findById(id);
    if (!property) return json({ message: "غير موجود" }, 404);

    const isOwner = property.owner.toString() === session.user.id;
    if (!isOwner && session.user.role !== "admin") {
      return json({ message: "مش مسموح لك تعدل السكن ده" }, 403);
    }

    const { data: body, tooLarge } = await readJson(request);
    if (tooLarge) return json({ message: "Payload too large" }, 413);

    // نفلتر الحقول المسموحة بس قبل الفحص (owner وأي حاجة تانية بتتجاهل)
    const picked = {};
    if (body && typeof body === "object") for (const k of EDITABLE) if (k in body) picked[k] = body[k];

    const { data, error } = validateProperty(picked, { partial: true });
    if (error) return json({ message: error }, 400);
    if (Object.keys(data).length === 0) return json({ message: "مفيش حاجة تتعدّل" }, 400);

    Object.assign(property, data);
    await property.save();

    return json(property, 200);
  } catch (err) {
    console.error("PATCH /api/properties/[id] error:", err);
    return json({ message: "Server error" }, 500);
  }
}

// DELETE /api/properties/:id — المالك نفسه أو admin بس
export async function DELETE(request, { params }) {
  try {
    if (!sameOriginOk(request)) return forbiddenOrigin();
    const gate = await requireUser();
    if (gate.error) return gate.error;
    const { session } = gate;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return json({ message: "Invalid id" }, 400);

    await connectToMongo();
    const property = await Property.findById(id);
    if (!property) return json({ message: "غير موجود" }, 404);

    const isOwner = property.owner.toString() === session.user.id;
    if (!isOwner && session.user.role !== "admin") {
      return json({ message: "مش مسموح لك تحذف السكن ده" }, 403);
    }

    await Promise.all([Property.findByIdAndDelete(id), Favorite.deleteMany({ property: id })]);
    return json({ message: "تم الحذف" }, 200);
  } catch (err) {
    console.error("DELETE /api/properties/[id] error:", err);
    return json({ message: "Server error" }, 500);
  }
}
