// path: app/api/properties/route.js
import { auth, connectToMongo } from "@/lib/auth";
import Property from "@/models/property";

function jsonResponse(data, status = 200) {
  return Response.json(data, { status });
}

// GET /api/properties?area=sail&college=engineering&campus=abu-elrish&type=apartment&minPrice=&maxPrice=
export async function GET(request) {
  try {
    await connectToMongo();
    const url = new URL(request.url);
    const area = url.searchParams.get("area");
    const college = url.searchParams.get("college");
    const campus = url.searchParams.get("campus");
    const type = url.searchParams.get("type");
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const mine = url.searchParams.get("mine"); // "1" => سكنات المستخدم الحالي بس

    const filter = { status: "active" };
    if (area) filter.area = area;
    if (college) filter.college = college;
    if (campus) filter.campus = campus;
    if (type) filter.type = type;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (mine === "1") {
      const session = await auth();
      if (!session?.user) return jsonResponse({ message: "Unauthorized" }, 401);
      delete filter.status;
      filter.owner = session.user.id;
    }

    const properties = await Property.find(filter).sort({ createdAt: -1 }).lean();
    return jsonResponse(properties, 200);
  } catch (err) {
    console.error("GET /api/properties error:", err);
    return jsonResponse({ message: "Server error" }, 500);
  }
}

// POST /api/properties — owner أو admin بس
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonResponse({ message: "لازم تسجل دخول الأول" }, 401);
    }
    if (!["owner", "admin"].includes(session.user.role)) {
      return jsonResponse({ message: "لازم يكون حسابك مالك سكن عشان تضيف عقار" }, 403);
    }

    await connectToMongo();
    const body = await request.json();
    const { title, price, area, college, campus, type, bedrooms, capacity, address, description, images, amenities } = body;

    if (!title || !price || !area) {
      return jsonResponse({ message: "العنوان، السعر، والمنطقة مطلوبين" }, 400);
    }

    const property = await Property.create({
      title,
      description: description || "",
      price,
      type: type || "apartment",
      bedrooms: bedrooms || 1,
      capacity: capacity || 1,
      area,
      college: college || null,
      campus: campus || null,
      address: address || "",
      images: Array.isArray(images) ? images : [],
      amenities: Array.isArray(amenities) ? amenities : [],
      owner: session.user.id,
    });

    return jsonResponse(property, 201);
  } catch (err) {
    console.error("POST /api/properties error:", err);
    return jsonResponse({ message: "Server error" }, 500);
  }
}