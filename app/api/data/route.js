// app/api/data/route.js
//
// API عام للـ collections (محتوى المساعدة والمدونة وطلبات الدعم).
// القواعد الأمنية:
//   • القراءة العامة مسموحة لـ collections محددة بس (PUBLIC_READ).
//   • الكتابة العامة مسموحة لـ collection واحد بس (request) وبحقول محددة ومحدودة الحجم + rate limit.
//   • أي حاجة تانية (قراءة / إضافة / تعديل / حذف) للأدمن بس.
//   • collections حساسة (users, payments, ...) ممنوعة تمامًا حتى على الأدمن من هنا.

import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { sameOriginOk } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.warn("Warning: MONGO_URI not defined in environment");
}

if (!globalThis._contentMongo) globalThis._contentMongo = { conn: null, promise: null };
if (!globalThis._mongoModels) globalThis._mongoModels = {};

/* ═══════════════ إعدادات الأمان ═══════════════ */

// collections متاحة للقراءة لأي زائر (محتوى عام لصفحات المساعدة والمدونة)
const PUBLIC_READ = new Set(["blogspage", "blogdetails"]);

// collections ممنوعة تمامًا من الـ API ده (بيانات حساسة)
const BLOCKED = new Set(["users", "accounts", "sessions", "verificationtokens", "payments"]);

// الكتابة العامة: collection واحد بس
const PUBLIC_WRITE = "request";

const COLLECTION_NAME_RE = /^[A-Za-z0-9_-]{1,64}$/;
const MAX_PUBLIC_BODY_BYTES = 20 * 1024; // 20KB
const MAX_ADMIN_INSERT_MANY = 500;

// Rate limit للكتابة العامة: 5 طلبات كل 10 دقايق لكل IP
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

/* ═══════════════ Helpers ═══════════════ */

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// اتصال مستقل (createConnection) بقاعدة المحتوى MONGO_URI.
// ماينفعش نستخدم mongoose.connect هنا لأن lib/mongodb.js بيستخدمه بالفعل لقاعدة Next-Auth،
// واستدعاؤه تاني بـ URI مختلف بيرمي خطأ "active connection with different connection strings".
async function connectToMongo() {
  const cache = globalThis._contentMongo;
  if (cache.conn) return cache.conn;
  if (!MONGO_URI) throw new Error("Please set MONGO_URI environment variable");

  if (!cache.promise) {
    cache.promise = mongoose
      .createConnection(MONGO_URI, { maxPoolSize: 5, serverSelectionTimeoutMS: 10000 })
      .asPromise()
      .catch((err) => {
        cache.promise = null;
        throw err;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

const schema = new mongoose.Schema({}, { strict: false });

function getModelForCollection(collectionName) {
  const conn = globalThis._contentMongo.conn;
  if (!conn) throw new Error("Content DB not connected");
  const name = String(collectionName);
  if (globalThis._mongoModels[name]) return globalThis._mongoModels[name];

  const modelName = `Model_${name.replace(/[^a-zA-Z0-9]/g, "_")}`;
  const Model = conn.models[modelName] || conn.model(modelName, schema, name);
  globalThis._mongoModels[name] = Model;
  return Model;
}

function isValidCollectionName(name) {
  if (!name || !COLLECTION_NAME_RE.test(name)) return false;
  if (name.toLowerCase().startsWith("system")) return false;
  if (BLOCKED.has(name.toLowerCase())) return false;
  return true;
}

async function listCollections() {
  const conn = await connectToMongo();
  const cols = await conn.db.listCollections().toArray();
  return cols.map((c) => c.name).filter((n) => isValidCollectionName(n));
}

function getSearchParams(request) {
  const url = new URL(request.url);
  return {
    collection: url.searchParams.get("collection"),
    id: url.searchParams.get("id"),
  };
}

async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// بيرفض أي مفاتيح فيها $ أو . (NoSQL operator injection) على أي عمق
function hasDangerousKeys(value, depth = 0) {
  if (depth > 8) return true;
  if (Array.isArray(value)) return value.some((v) => hasDangerousKeys(v, depth + 1));
  if (value && typeof value === "object") {
    return Object.keys(value).some(
      (k) => k.startsWith("$") || k.includes(".") || hasDangerousKeys(value[k], depth + 1)
    );
  }
  return false;
}

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

// يتأكد إن اليوزر أدمن، ولو لأ بيرجع Response جاهز
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return { error: jsonResponse({ error: "Unauthorized" }, 401) };
  if (session.user.role !== "admin") return { error: jsonResponse({ error: "Forbidden" }, 403) };
  return { session };
}

function getClientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// تنضيف وفحص طلب الدعم العام. بيرجع { data } أو { error }
function validateSupportRequest(body) {
  if (!isPlainObject(body)) return { error: "Invalid body" };

  const email = str(body.email, 254).toLowerCase();
  const query = str(body.query, 100);
  const subject = str(body.subject, 200);
  const description = str(body.description, 5000);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Invalid email" };
  if (!query) return { error: "Query type is required" };
  if (!subject) return { error: "Subject is required" };
  if (!description) return { error: "Description is required" };

  const attachmentNames = Array.isArray(body.attachmentNames)
    ? body.attachmentNames.slice(0, 10).map((n) => str(n, 255)).filter(Boolean)
    : [];

  // الحقول دي بس هي اللي بتتحفظ — أي حاجة تانية في الـ body بتتجاهل
  return {
    data: {
      email,
      query,
      subject,
      description,
      attachmentNames,
      status: "new",
      submittedAt: new Date(),
    },
  };
}

function serverError(err) {
  console.error("[/api/data]", err);
  return jsonResponse({ error: "Internal server error" }, 500);
}

/* ═══════════════ GET ═══════════════ */

export async function GET(request) {
  try {
    const { collection, id } = getSearchParams(request);

    // بدون collection = تفريغ كل الداتا → أدمن بس
    if (!collection) {
      const gate = await requireAdmin();
      if (gate.error) return gate.error;

      const colNames = await listCollections(); // بيفتح الاتصال
      const results = await Promise.all(
        colNames.map((name) => getModelForCollection(name).find({}))
      );
      const payload = colNames.reduce((acc, name, i) => {
        acc[name] = results[i];
        return acc;
      }, {});
      return jsonResponse(payload, 200);
    }

    const colName = String(collection);
    if (!isValidCollectionName(colName)) return jsonResponse({ error: "Forbidden" }, 403);

    // collection مش عام → أدمن بس (والفحص قبل أي اتصال بالداتا بيز)
    if (!PUBLIC_READ.has(colName)) {
      const gate = await requireAdmin();
      if (gate.error) return gate.error;
    }

    await connectToMongo();
    const existingCols = await listCollections();
    if (!existingCols.includes(colName)) {
      return jsonResponse({ error: `Collection '${colName}' not found` }, 404);
    }

    const Model = getModelForCollection(colName);

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return jsonResponse({ error: "Invalid id format" }, 400);
      }
      const doc = await Model.findById(id);
      if (!doc) return jsonResponse({ error: "Document not found" }, 404);
      return jsonResponse(doc, 200);
    }

    const docs = await Model.find({}).limit(1000);
    return jsonResponse(docs, 200);
  } catch (err) {
    return serverError(err);
  }
}

/* ═══════════════ POST ═══════════════ */

export async function POST(request) {
  try {
    if (!sameOriginOk(request)) return jsonResponse({ error: "Forbidden origin" }, 403);
    const { collection } = getSearchParams(request);
    if (!collection) return jsonResponse({ error: "Collection is required" }, 400);

    const colName = String(collection);
    if (!isValidCollectionName(colName)) return jsonResponse({ error: "Forbidden" }, 403);

    /* ── مسار عام: طلب دعم من أي زائر ── */
    if (colName === PUBLIC_WRITE) {
      const len = Number(request.headers.get("content-length") || 0);
      if (len > MAX_PUBLIC_BODY_BYTES) return jsonResponse({ error: "Payload too large" }, 413);

      if ((await rateLimit(`support-request:${getClientIp(request)}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)).limited) {
        return jsonResponse({ error: "Too many requests. Please try again later." }, 429);
      }

      const raw = await request.text().catch(() => "");
      if (raw.length > MAX_PUBLIC_BODY_BYTES) return jsonResponse({ error: "Payload too large" }, 413);
      let body = null;
      try { body = JSON.parse(raw); } catch { body = null; }
      const { data, error } = validateSupportRequest(body);
      if (error) return jsonResponse({ error }, 400);

      await connectToMongo();
      await getModelForCollection(colName).create(data);
      return jsonResponse({ ok: true }, 201);
    }

    /* ── أي collection تاني: أدمن بس ── */
    const gate = await requireAdmin();
    if (gate.error) return gate.error;

    const body = await parseBody(request);
    if (body === null || typeof body !== "object") return jsonResponse({ error: "Invalid body" }, 400);
    if (hasDangerousKeys(body)) return jsonResponse({ error: "Invalid keys in body" }, 400);

    await connectToMongo();
    const Model = getModelForCollection(colName);

    if (Array.isArray(body)) {
      if (body.length === 0 || body.length > MAX_ADMIN_INSERT_MANY || !body.every(isPlainObject)) {
        return jsonResponse({ error: "Invalid array body" }, 400);
      }
      return jsonResponse(await Model.insertMany(body), 201);
    }

    return jsonResponse(await Model.create(body), 201);
  } catch (err) {
    return serverError(err);
  }
}

/* ═══════════════ PUT (أدمن بس) ═══════════════ */

export async function PUT(request) {
  try {
    if (!sameOriginOk(request)) return jsonResponse({ error: "Forbidden origin" }, 403);
    const gate = await requireAdmin();
    if (gate.error) return gate.error;

    const { collection, id } = getSearchParams(request);
    if (!collection) return jsonResponse({ error: "Collection is required" }, 400);
    if (!id) return jsonResponse({ error: "ID is required for PUT" }, 400);
    if (!mongoose.Types.ObjectId.isValid(id)) return jsonResponse({ error: "Invalid id format" }, 400);

    const colName = String(collection);
    if (!isValidCollectionName(colName)) return jsonResponse({ error: "Forbidden" }, 403);

    const body = await parseBody(request);
    if (!isPlainObject(body)) return jsonResponse({ error: "Invalid body" }, 400);
    if (hasDangerousKeys(body)) return jsonResponse({ error: "Invalid keys in body" }, 400);
    delete body._id;

    await connectToMongo();
    const existingCols = await listCollections();
    if (!existingCols.includes(colName)) return jsonResponse({ error: "Collection not found" }, 404);

    const Model = getModelForCollection(colName);
    const updated = await Model.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: false });
    if (!updated) return jsonResponse({ error: "Document not found" }, 404);
    return jsonResponse(updated, 200);
  } catch (err) {
    return serverError(err);
  }
}

/* ═══════════════ DELETE (أدمن بس) ═══════════════ */

export async function DELETE(request) {
  try {
    if (!sameOriginOk(request)) return jsonResponse({ error: "Forbidden origin" }, 403);
    const gate = await requireAdmin();
    if (gate.error) return gate.error;

    const { collection, id } = getSearchParams(request);
    if (!collection) return jsonResponse({ error: "Collection is required" }, 400);
    if (!id) return jsonResponse({ error: "ID is required for DELETE" }, 400);
    if (!mongoose.Types.ObjectId.isValid(id)) return jsonResponse({ error: "Invalid id format" }, 400);

    const colName = String(collection);
    if (!isValidCollectionName(colName)) return jsonResponse({ error: "Forbidden" }, 403);

    await connectToMongo();
    const existingCols = await listCollections();
    if (!existingCols.includes(colName)) return jsonResponse({ error: "Collection not found" }, 404);

    const Model = getModelForCollection(colName);
    const deleted = await Model.findByIdAndDelete(id);
    if (!deleted) return jsonResponse({ error: "Document not found" }, 404);
    return jsonResponse(deleted, 200);
  } catch (err) {
    return serverError(err);
  }
}