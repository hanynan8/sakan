// path: app/api/properties/[id]/route.js
import { auth, connectToMongo } from "@/lib/auth";
import Property from "@/models/property";
import Favorite from "@/models/favorite";
import Booking from "@/models/booking";
import mongoose from "mongoose";
import { json, requireUser, sameOriginOk, forbiddenOrigin } from "@/lib/api";
import { readJson, isString, looksLikeEmail, normalizeEmail, normalizePhone } from "@/lib/validators";
import { UserModel } from "@/lib/auth";
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

    if (property.status === "hidden" || property.status === "pending") {
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

    const { data, error } = validateProperty(picked, {
      partial: true,
      keepImages: property.images || [],
      anyImageHost: session.user.role === "admin",
    });
    if (error) return json({ message: error }, 400);

    // الموافقة على الإعلان (pending → active) وإرجاعه للمراجعة للأدمن بس
    if (session.user.role !== "admin" && "status" in data) {
      if (property.status === "pending") return json({ message: "الإعلان لسه تحت المراجعة" }, 403);
      if (data.status === "pending") return json({ message: "الحالة غير صحيحة" }, 400);
    }
    // نقل ملكية السكن لمستخدم تاني (أدمن بس): ownerContact = إيميل أو تليفون المالك الجديد
    let newOwner = null;
    if (session.user.role === "admin" && isString(body?.ownerContact) && body.ownerContact.trim()) {
      const c = body.ownerContact.trim();
      const query = looksLikeEmail(c) ? { email: normalizeEmail(c) } : { phone: normalizePhone(c) };
      if (!Object.values(query)[0]) return json({ message: "إيميل/رقم المالك غير صحيح" }, 400);
      newOwner = await UserModel.findOne(query).select("_id role").lean();
      if (!newOwner) return json({ message: "مفيش مستخدم بالبيانات دي" }, 404);
      if (newOwner.role === "student") return json({ message: "المستخدم ده طالب، غيّر دوره لمالك الأول" }, 400);
    }
    if (Object.keys(data).length === 0 && !newOwner) return json({ message: "مفيش حاجة تتعدّل" }, 400);
    if (newOwner) property.owner = newOwner._id;

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

    await Promise.all([
      Property.findByIdAndDelete(id),
      Favorite.deleteMany({ property: id }),
      Booking.deleteMany({ property: id }),
    ]);
    return json({ message: "تم الحذف" }, 200);
  } catch (err) {
    console.error("DELETE /api/properties/[id] error:", err);
    return json({ message: "Server error" }, 500);
  }
}
