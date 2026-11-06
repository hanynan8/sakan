// scripts/fill-property-images.mjs
// بيملّي صور حقيقية للسكنات اللي مالهاش صور.
//
// بتحط صورك الحقيقية في فولدر، السكربت بيرفعها على Cloudinary (نفس حسابك) وبيوزعها على السكنات الفاضية.
//
//   node --env-file=.env.local scripts/fill-property-images.mjs --dir ./photos
//   node --env-file=.env.local scripts/fill-property-images.mjs --urls ./urls.txt
//   node --env-file=.env.local scripts/fill-property-images.mjs --dir ./photos --per 4 --dry
//
// الخيارات:
//   --dir <path>    فولدر صور (jpg / png / webp). لو جواه فولدرات اسمها furnished و unfurnished
//                   بتتوزع حسب تأثيث الشقة، والصور اللي برا الفولدرات دي بتتستخدم للاتنين.
//   --urls <file>   ملف نصي فيه رابط صورة في كل سطر (روابط Cloudinary بتاعتك. السطور اللي بتبدأ بـ # بتتتجاهل).
//   --per <n>       عدد الصور لكل شقة (الافتراضي 3، الحد الأقصى 10)
//   --dry           يطبع الخطة بس من غير رفع ولا تعديل في الداتابيز
//   --force         يستبدل صور كل السكنات (مش الفاضية بس) — استخدمه بحذر
//
// المطلوب في .env.local: MONGO_AUTH_URI و CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET (لو بترفع من --dir).
// الروابط المرفوعة بتتحفظ في scripts/.fill-images-cache.json عشان لو شغلت السكربت تاني ميرفعش الصور من الأول.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? null : argv[i + 1] ?? true;
};
const flag = (name) => argv.includes(`--${name}`);

const dir = opt("dir");
const urlsFile = opt("urls");
const per = Math.min(10, Math.max(1, parseInt(opt("per") || "3", 10) || 3));
const dry = flag("dry");
const force = flag("force");

if (!dir && !urlsFile) {
  console.error("لازم تحدد --dir <فولدر صور> أو --urls <ملف روابط>. شوف الشرح في أول الملف.");
  process.exit(1);
}

const EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const CACHE = path.join(path.dirname(new URL(import.meta.url).pathname), ".fill-images-cache.json");
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};

function listImages(d) {
  if (!fs.existsSync(d)) return [];
  return fs
    .readdirSync(d)
    .filter((f) => EXT.has(path.extname(f).toLowerCase()))
    .sort()
    .map((f) => path.join(d, f));
}

// ── رفع صورة لـ Cloudinary (نفس توقيع /api/upload) ──
async function uploadToCloudinary(file) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) throw new Error("مفاتيح Cloudinary مش موجودة في .env.local");

  const buf = fs.readFileSync(file);
  const hash = crypto.createHash("sha1").update(buf).digest("hex");
  if (cache[hash]) return cache[hash];

  const timestamp = String(Math.floor(Date.now() / 1000));
  const params = { allowed_formats: "jpg,png,webp", folder: "betak/properties", timestamp };
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  const signature = crypto.createHash("sha1").update(toSign + secret).digest("hex");

  const ext = path.extname(file).toLowerCase().replace(".", "");
  const mime = ext === "jpg" ? "jpeg" : ext;
  const fd = new FormData();
  fd.append("file", new Blob([buf], { type: `image/${mime}` }), path.basename(file));
  fd.append("api_key", key);
  fd.append("signature", signature);
  for (const [k, v] of Object.entries(params)) fd.append(k, v);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || typeof data.secure_url !== "string") {
    throw new Error(`فشل رفع ${path.basename(file)}: ${data?.error?.message || res.status}`);
  }
  const url = data.secure_url.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_1400,c_limit/");
  cache[hash] = url;
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  return url;
}

// ── تجهيز مجموعات الصور: shared (للاتنين) / furnished / unfurnished ──
const pools = { shared: [], furnished: [], unfurnished: [] };

if (dir) {
  const root = path.resolve(dir);
  const groups = { shared: listImages(root), furnished: listImages(path.join(root, "furnished")), unfurnished: listImages(path.join(root, "unfurnished")) };
  const total = groups.shared.length + groups.furnished.length + groups.unfurnished.length;
  if (!total) {
    console.error(`مفيش صور (jpg/png/webp) في ${root}`);
    process.exit(1);
  }
  console.log(`لقيت ${groups.shared.length} صورة عامة، ${groups.furnished.length} مفروشة، ${groups.unfurnished.length} غير مفروشة.`);
  if (dry) {
    for (const g of Object.keys(groups)) pools[g] = groups[g].map((f) => `file:${path.basename(f)}`);
  } else {
    for (const g of Object.keys(groups)) {
      for (const f of groups[g]) {
        process.stdout.write(`رفع ${path.relative(root, f)} ... `);
        pools[g].push(await uploadToCloudinary(f));
        console.log("تمام");
      }
    }
  }
}

if (urlsFile) {
  const urls = fs
    .readFileSync(urlsFile, "utf8")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("#"));
  const bad = urls.filter((u) => !/^https:\/\//.test(u));
  if (bad.length) {
    console.error("الروابط لازم تبدأ بـ https://  —  الغلط:", bad.slice(0, 3).join(", "));
    process.exit(1);
  }
  pools.shared.push(...urls);
  console.log(`حملت ${urls.length} رابط من ${urlsFile}.`);
}

const poolFor = (furnished) => [...(furnished ? pools.furnished : pools.unfurnished), ...pools.shared];

// نوزع بالتناوب (offset بيزيد مع كل شقة) عشان الشقق اللي جنب بعض ماتاخدش نفس الصور
function pick(pool, n, offset) {
  const count = Math.min(n, pool.length);
  const out = [];
  for (let i = 0; i < count; i++) out.push(pool[(offset * count + i) % pool.length]);
  return out;
}

if (dry) {
  console.log(`\n[dry] هيتوزع ${per} صور لكل شقة فاضية بالتناوب. مفيش رفع ولا تعديل اتعمل.`);
  console.log("عينة (مفروشة):", pick(poolFor(true), per, 0));
  console.log("عينة (غير مفروشة):", pick(poolFor(false), per, 0));
  process.exit(0);
}

if (!process.env.MONGO_AUTH_URI) {
  console.error("MONGO_AUTH_URI مش موجود (استخدم --env-file=.env.local)");
  process.exit(1);
}

const { default: mongoose } = await import("mongoose");
await mongoose.connect(process.env.MONGO_AUTH_URI, { dbName: "Next-Auth" });
const col = mongoose.connection.collection("properties");

const query = force ? {} : { $or: [{ images: { $exists: false } }, { images: { $size: 0 } }, { images: null }] };
const props = await col.find(query, { projection: { _id: 1, furnished: 1, title: 1 } }).sort({ createdAt: 1 }).toArray();
console.log(`\nعدد السكنات اللي هتتحدّث: ${props.length}`);

let done = 0;
let skipped = 0;
for (let i = 0; i < props.length; i++) {
  const pool = poolFor(!!props[i].furnished);
  if (!pool.length) {
    skipped++;
    continue;
  }
  await col.updateOne({ _id: props[i]._id }, { $set: { images: pick(pool, per, i) } });
  done++;
}
console.log(`✔ اتحدّث ${done} سكن${skipped ? ` — وتخطيت ${skipped} (مفيش صور مناسبة ليهم)` : ""}.`);
await mongoose.disconnect();
