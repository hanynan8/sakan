// path: app/api/bookings/route.js
//   GET  /api/bookings  → طلبات الحجز بتاعتي
//   POST /api/bookings  { propertyId, phone, moveInDate?, message? }
import mongoose from "mongoose";
import { connectToMongo } from "@/lib/auth";
import Booking from "@/models/booking";
import Property from "@/models/property";
import { json, requireUser, sameOriginOk, forbiddenOrigin } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { cleanString, isPlainObject, normalizePhone, readJson } from "@/lib/validators";

export async function GET() {
  try {
    const gate = await requireUser();
    if (gate.error) return gate.error;
    await connectToMongo();

    const items = await Booking.find({ user: gate.session.user.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("property", "title price area images status")
      .lean();

    return json(
      items.map((b) => ({
        _id: b._id.toString(),
        status: b.status,
        phone: b.phone,
        message: b.message,
        moveInDate: b.moveInDate,
        createdAt: b.createdAt,
        property: b.property
          ? {
              _id: b.property._id.toString(),
              title: b.property.title,
              price: b.property.price,
              area: b.property.area,
              image: b.property.images?.[0] || null,
            }
          : null, // السكن اتحذف
      }))
    );
  } catch (err) {
    console.error("GET /api/bookings error:", err);
    return json({ message: "Server error" }, 500);
  }
}

export async function POST(request) {
  try {
    if (!sameOriginOk(request)) return forbiddenOrigin();
    const gate = await requireUser();
    if (gate.error) return gate.error;
    const userId = gate.session.user.id;

    const rl = await rateLimit(`booking-create:${userId}`, 10, 60 * 60 * 1000);
    if (rl.limited) {
      return json({ message: "محاولات كتير، حاول بعد شوية" }, 429, { "Retry-After": String(rl.retryAfter) });
    }

    const { data: body, tooLarge } = await readJson(request, 4 * 1024);
    if (tooLarge) return json({ message: "Payload too large" }, 413);
    if (!isPlainObject(body)) return json({ message: "Invalid body" }, 400);

    if (typeof body.propertyId !== "string" || !mongoose.Types.ObjectId.isValid(body.propertyId)) {
      return json({ message: "Invalid propertyId" }, 400);
    }
    const phone = normalizePhone(body.phone);
    if (!phone) return json({ message: "رقم الهاتف غير صحيح" }, 400);

    let moveInDate = null;
    if (body.moveInDate) {
      const d = new Date(body.moveInDate);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const max = new Date(); max.setFullYear(max.getFullYear() + 1);
      if (Number.isNaN(d.getTime()) || d < today || d > max) {
        return json({ message: "تاريخ السكن غير صحيح" }, 400);
      }
      moveInDate = d;
    }
    const message = cleanString(body.message, 500);

    await connectToMongo();
    const property = await Property.findById(body.propertyId).select("owner status").lean();
    if (!property || property.status !== "active") {
      return json({ message: "السكن غير متاح للحجز" }, 404);
    }
    if (property.owner.toString() === userId) {
      return json({ message: "ماينفعش تحجز سكنك" }, 400);
    }

    try {
      const booking = await Booking.create({ user: userId, property: body.propertyId, phone, moveInDate, message });
      return json({ ok: true, id: booking._id.toString() }, 201);
    } catch (err) {
      if (err?.code === 11000) return json({ message: "عندك طلب حجز معلّق على السكن ده بالفعل" }, 409);
      throw err;
    }
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    return json({ message: "Server error" }, 500);
  }
}
