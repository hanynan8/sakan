// scripts/seed-examples.mjs
// بيضيف شقق "مثال" عشان تجرّب الفلاتر: شقة على الأقل لكل منطقة + لكل كلية،
// وموزعة بحيث كل قيمة في كل فلتر (جنس / تأثيث / مرافق / غرف / دور / سراير / سعر) يطلع لها نتايج.
//
//   node --env-file=.env.local scripts/seed-examples.mjs          # يمسح الأمثلة القديمة ويضيف الجديدة
//   node --env-file=.env.local scripts/seed-examples.mjs --clear  # يمسح الأمثلة بس
//   node scripts/seed-examples.mjs --dry                          # يطبع ملخص التغطية من غير داتابيز
//
// كل سكن مثال عنوانه بيبدأ بـ "[مثال]" ومملوك لأول أدمن، وده اللي بيتمسح بـ --clear (مفيش حاجة تانية بتتمسح).
import { AREAS, COLLEGES, AREA_CAMPUS, collegesInArea } from "../lib/taxonomy.js";

const PREFIX = "[مثال]";
const args = new Set(process.argv.slice(2));

const GENDERS = ["male", "female", "any"];
const GENDER_AR = { male: "للشباب", female: "للبنات", any: "للاتنين" };
const AMENITIES = ["واي فاي", "تكييف", "غسالة", "ثلاجة", "مطبخ مجهز", "بلكونة", "مصعد", "حارس عقار", "مياه ساخنة"];
const FLOOR_AR = ["الدور الأرضي", "الدور الأول", "الدور التاني", "الدور التالت", "الدور الرابع", "الدور الخامس", "الدور السادس"];

// الكليات القريبة من كل منطقة: كليات الحرم لو المنطقة جواه، وإلا كليتين تلاتة موزعين على الحرم
const CAMPUS_ORDER = ["sahari", "abu-elrish", "new-aswan", "naga"];
function nearbyColleges(area, i) {
  const own = collegesInArea(area.id);
  if (own.length) return own.slice(0, 3).map((c) => c.id);
  const campus = CAMPUS_ORDER[i % CAMPUS_ORDER.length];
  return COLLEGES.filter((c) => c.campus === campus).slice(0, 2).map((c) => c.id);
}

// منطقة لكل كلية: منطقة جوه حرمها لو موجودة
const campusArea = (campusId) => Object.keys(AREA_CAMPUS).find((a) => AREA_CAMPUS[a] === campusId);

function build(i, area, collegeIds, label) {
  const gender = GENDERS[i % 3];
  const furnished = i % 2 === 0;
  const utilitiesIncluded = Math.floor(i / 2) % 2 === 0;
  const bedrooms = (i % 4) + 1;
  const beds = Math.min(6, bedrooms + (Math.floor(i / 4) % 3));
  const floor = i % 7;
  const price =
    Math.round((1200 + bedrooms * 700 + (furnished ? 600 : 0) + (utilitiesIncluded ? 300 : 0) + (i % 5) * 150) / 50) * 50;
  const amenities = [0, 1, 2, 3].map((k) => AMENITIES[(i + k * 2) % AMENITIES.length]);
  const near = collegeIds.map((id) => COLLEGES.find((c) => c.id === id)?.ar).filter(Boolean);
  return {
    title: `${PREFIX} شقة ${furnished ? "مفروشة" : "غير مفروشة"} ${bedrooms} غرف في ${area.ar} ${GENDER_AR[gender]}`,
    description: `شقة ${label} في ${area.ar}، ${FLOOR_AR[floor]}، ${beds} سراير. قريبة من: ${near.join("، ")}. المرافق ${utilitiesIncluded ? "شاملة (مياه وكهرباء وغاز)" : "غير شاملة"}. (إعلان تجريبي لاختبار الفلاتر)`,
    price,
    gender,
    furnished,
    bedrooms,
    beds,
    capacity: beds,
    floor,
    utilitiesIncluded,
    area: area.id,
    colleges: collegeIds,
    college: null,
    address: `شارع تجريبي، ${area.ar}، أسوان`,
    images: [],
    amenities,
    status: "active",
  };
}

// ── توليد القايمة ──
const docs = [];
AREAS.forEach((area, i) => docs.push(build(docs.length, area, nearbyColleges(area, i), `مثال للمنطقة`)));
COLLEGES.forEach((college) => {
  const area = AREAS.find((a) => a.id === campusArea(college.campus)) || AREAS[0];
  docs.push(build(docs.length, area, [college.id], `مثال لكلية ${college.ar}`));
});

// ── تقرير التغطية ──
const uniq = (arr) => [...new Set(arr)].sort((a, b) => a - b);
const missing = [];
for (const a of AREAS) if (!docs.some((d) => d.area === a.id)) missing.push(`منطقة ${a.id}`);
for (const c of COLLEGES) if (!docs.some((d) => d.colleges.includes(c.id))) missing.push(`كلية ${c.id}`);
for (let n = 1; n <= 4; n++) if (!docs.some((d) => (n >= 4 ? d.bedrooms >= 4 : d.bedrooms === n))) missing.push(`غرف ${n}`);
for (let n = 0; n <= 6; n++) if (!docs.some((d) => d.floor === n)) missing.push(`دور ${n}`);
for (let n = 1; n <= 6; n++) if (!docs.some((d) => d.beds === n)) missing.push(`سراير ${n}`);
for (const g of GENDERS) if (!docs.some((d) => d.gender === g)) missing.push(`جنس ${g}`);
if (!docs.some((d) => d.furnished) || !docs.some((d) => !d.furnished)) missing.push("تأثيث");
if (!docs.some((d) => d.utilitiesIncluded) || !docs.some((d) => !d.utilitiesIncluded)) missing.push("مرافق");

const prices = docs.map((d) => d.price);
console.log(`عدد الأمثلة: ${docs.length} (${AREAS.length} منطقة + ${COLLEGES.length} كلية)`);
console.log(`غرف: ${uniq(docs.map((d) => d.bedrooms))} | دور: ${uniq(docs.map((d) => d.floor))} | سراير: ${uniq(docs.map((d) => d.beds))}`);
console.log(`سعر: ${Math.min(...prices)} → ${Math.max(...prices)} ج.م`);
console.log(missing.length ? `⚠ ناقص تغطية: ${missing.join("، ")}` : "✔ كل المناطق والكليات وقيم الفلاتر متغطية");
if (args.has("--dry") && args.has("--list")) docs.slice(0, 40).forEach((d) => console.log(`${d.area.padEnd(18)} ${d.colleges.join(",").padEnd(28)} ${d.gender.padEnd(6)} ${d.furnished ? "F" : "-"}${d.utilitiesIncluded ? "U" : "-"} غرف${d.bedrooms} دور${d.floor} سراير${d.beds} ${d.price}`));
if (args.has("--dry")) process.exit(missing.length ? 1 : 0);

// ── الكتابة في الداتابيز ──
if (!process.env.MONGO_AUTH_URI) {
  console.error("MONGO_AUTH_URI is not set (استخدم --env-file=.env.local)");
  process.exit(1);
}
const { default: mongoose } = await import("mongoose");
await mongoose.connect(process.env.MONGO_AUTH_URI, { dbName: "Next-Auth" });
try {
  const admin = await mongoose.connection.collection("users").findOne({ role: "admin" }, { projection: { _id: 1 } });
  if (!admin) {
    console.error("مفيش أدمن. اعمل واحد الأول: scripts/create-admin.mjs");
    process.exit(1);
  }
  const props = mongoose.connection.collection("properties");
  const removed = await props.deleteMany({ owner: admin._id, title: { $regex: `^${PREFIX.replace(/[[\]]/g, "\\$&")}` } });
  console.log(`اتمسح ${removed.deletedCount} مثال قديم`);
  if (!args.has("--clear")) {
    const now = Date.now();
    const rows = docs.map((d, i) => ({
      ...d,
      owner: admin._id,
      createdAt: new Date(now - i * 60_000), // ترتيب "الأحدث" يبقى واضح
      updatedAt: new Date(now - i * 60_000),
      __v: 0,
    }));
    const res = await props.insertMany(rows);
    console.log(`✔ اتضاف ${res.insertedCount} شقة مثال`);
  }
} finally {
  await mongoose.disconnect();
}
