// path: app/api/bookings/[id]/route.js
// PATCH { status } — الطالب يقدر يلغي طلبه المعلّق بس، والأدمن يغيّر لأي حالة.
import mongoose from "mongoose";
import { connectToMongo } from "@/lib/auth";
import Booking from "@/models/booking";
import { json, requireUser, sameOriginOk, forbiddenOrigin } from "@/lib/api";
import { readJson } from "@/lib/validators";

const STATUSES = ["pending", "confirmed", "cancelled"];

export async function PATCH(request, { params }) {
  try {
    if (!sameOriginOk(request)) return forbiddenOrigin();
    const gate = await requireUser();
    if (gate.error) return gate.error;
    const { session } = gate;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return json({ message: "Invalid id" }, 400);

    const { data: body } = await readJson(request, 1024);
    if (!STATUSES.includes(body?.status)) return json({ message: "الحالة غير صحيحة" }, 400);

    await connectToMongo();
    const booking = await Booking.findById(id);
    if (!booking) return json({ message: "غير موجود" }, 404);

    const isAdmin = session.user.role === "admin";
    const isMine = booking.user.toString() === session.user.id;
    if (!isAdmin) {
      if (!isMine) return json({ message: "غير موجود" }, 404);
      if (booking.status !== "pending" || body.status !== "cancelled") {
        return json({ message: "تقدر تلغي الطلبات المعلّقة بس" }, 403);
      }
    }

    booking.status = body.status;
    try {
      await booking.save();
    } catch (err) {
      if (err?.code === 11000) return json({ message: "فيه طلب معلّق تاني لنفس السكن" }, 409);
      throw err;
    }
    return json({ ok: true, id, status: booking.status });
  } catch (err) {
    console.error("PATCH /api/bookings/[id] error:", err);
    return json({ message: "Server error" }, 500);
  }
}
