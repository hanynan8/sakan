// path: app/api/admin/stats/route.js — أرقام عامة للأدمن
import { connectToMongo, UserModel } from "@/lib/auth";
import Property from "@/models/property";
import Booking from "@/models/booking";
import { json, requireRole } from "@/lib/api";

export async function GET() {
  try {
    const gate = await requireRole(["admin"]);
    if (gate.error) return gate.error;
    await connectToMongo();

    const [usersByRole, propsByStatus, bookingsByStatus] = await Promise.all([
      UserModel.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Property.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);
    const toMap = (rows) => Object.fromEntries(rows.map((r) => [r._id, r.count]));
    return json({ users: toMap(usersByRole), properties: toMap(propsByStatus), bookings: toMap(bookingsByStatus) });
  } catch (err) {
    console.error("GET /api/admin/stats error:", err);
    return json({ message: "Server error" }, 500);
  }
}
