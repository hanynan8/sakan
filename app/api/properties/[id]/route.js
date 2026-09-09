// path: app/api/properties/[id]/route.js
import { auth, connectToMongo } from "@/lib/auth";
import Property from "@/models/property";
import mongoose from "mongoose";

function jsonResponse(data, status = 200) {
  return Response.json(data, { status });
}

// GET /api/properties/:id — تفاصيل سكن واحد
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse({ message: "Invalid id" }, 400);
    }
    await connectToMongo();
    const property = await Property.findById(id).lean();
    if (!property) return jsonResponse({ message: "غير موجود" }, 404);
    return jsonResponse(property, 200);
  } catch (err) {
    console.error("GET /api/properties/[id] error:", err);
    return jsonResponse({ message: "Server error" }, 500);
  }
}

// PATCH /api/properties/:id — تعديل (المالك نفسه أو admin بس)
export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) return jsonResponse({ message: "Unauthorized" }, 401);

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return jsonResponse({ message: "Invalid id" }, 400);

    await connectToMongo();
    const property = await Property.findById(id);
    if (!property) return jsonResponse({ message: "غير موجود" }, 404);

    const isOwner = property.owner.toString() === session.user.id;
    if (!isOwner && session.user.role !== "admin") {
      return jsonResponse({ message: "مش مسموح لك تعدل السكن ده" }, 403);
    }

    const body = await request.json();
    const allowed = ["title", "description", "price", "type", "bedrooms", "capacity", "area", "college", "campus", "address", "images", "amenities", "status"];
    for (const key of allowed) {
      if (key in body) property[key] = body[key];
    }
    await property.save();

    return jsonResponse(property, 200);
  } catch (err) {
    console.error("PATCH /api/properties/[id] error:", err);
    return jsonResponse({ message: "Server error" }, 500);
  }
}

// DELETE /api/properties/:id — المالك نفسه أو admin بس
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) return jsonResponse({ message: "Unauthorized" }, 401);

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return jsonResponse({ message: "Invalid id" }, 400);

    await connectToMongo();
    const property = await Property.findById(id);
    if (!property) return jsonResponse({ message: "غير موجود" }, 404);

    const isOwner = property.owner.toString() === session.user.id;
    if (!isOwner && session.user.role !== "admin") {
      return jsonResponse({ message: "مش مسموح لك تحذف السكن ده" }, 403);
    }

    await Property.findByIdAndDelete(id);
    return jsonResponse({ message: "تم الحذف" }, 200);
  } catch (err) {
    console.error("DELETE /api/properties/[id] error:", err);
    return jsonResponse({ message: "Server error" }, 500);
  }
}