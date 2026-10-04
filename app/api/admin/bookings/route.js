// path: app/api/admin/bookings/route.js — كل طلبات الحجز (أدمن بس)
import { connectToMongo } from "@/lib/auth";
import Booking from "@/models/booking";
import "@/models/user";
import "@/models/property";
import { json, requireRole } from "@/lib/api";

const STATUSES = ["pending", "confirmed", "cancelled"];

export async function GET(request) {
  try {
    const gate = await requireRole(["admin"]);
    if (gate.error) return gate.error;
    await connectToMongo();

    const sp = new URL(request.url).searchParams;
    const status = sp.get("status");
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
    const limit = 30;
    const filter = STATUSES.includes(status) ? { status } : {};

    const [items, total] = await Promise.all([
      Booking.find(filter)
        .populate("user", "firstName lastName email phone")
        .populate("property", "title price")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return json({
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      bookings: items.map((b) => ({
        id: b._id.toString(),
        status: b.status,
        phone: b.phone,
        message: b.message,
        moveInDate: b.moveInDate,
        createdAt: b.createdAt,
        user: b.user ? { name: `${b.user.firstName} ${b.user.lastName}`.trim(), contact: b.user.email || b.user.phone || "" } : null,
        property: b.property ? { id: b.property._id.toString(), title: b.property.title, price: b.property.price } : null,
      })),
    });
  } catch (err) {
    console.error("GET /api/admin/bookings error:", err);
    return json({ message: "Server error" }, 500);
  }
}
