// path: lib/taxonomy.js
// مصدر واحد لكل بيانات "كليات جامعة أسوان" و"مناطق مدينة أسوان"
// مستخدم في: صفحة البحث /properties، وفورم إضافة سكن بالبروفايل
// مبني على بحث محدث لمقار جامعة أسوان 2026 (آخر تحديث بيضم كلية التجارة تحت أسوان الجديدة)

// ── حرم/تجمعات جامعة أسوان ──
// ملحوظة: الحرم الجامعي اتشال من الفلاتر وفورم الإضافة. بنحتفظ بيه هنا بس كبيانات داخلية
// عشان نعرف أي كليات موجودة في أي منطقة (AREA_CAMPUS تحت).
export const CAMPUSES = [
  { id: "sahari", ar: "صحاري - طريق المطار", en: "Sahari - Airport Road" },
  { id: "abu-elrish", ar: "أبو الريش", en: "Abu El-Rish" },
  { id: "new-aswan", ar: "أسوان الجديدة", en: "New Aswan" },
  { id: "naga", ar: "النفق", en: "El-Naga (Tunnel)" },
];

// ── كليات جامعة أسوان (~21 كلية/معهد) مربوطة بالحرم بتاعها ──
export const COLLEGES = [
  // 🟢 صحاري - طريق المطار
  { id: "science", ar: "كلية العلوم", en: "Faculty of Science", campus: "sahari" },
  { id: "vet-medicine", ar: "كلية الطب البيطري", en: "Faculty of Veterinary Medicine", campus: "sahari" },
  { id: "agriculture", ar: "كلية الزراعة والموارد الطبيعية", en: "Faculty of Agriculture & Natural Resources", campus: "sahari" },
  { id: "fisheries", ar: "كلية تكنولوجيا المصايد والأسماك", en: "Faculty of Fisheries Technology", campus: "sahari" },
  { id: "social-work", ar: "كلية الخدمة الاجتماعية", en: "Faculty of Social Work", campus: "sahari" },
  { id: "sport-science", ar: "كلية التربية الرياضية / علوم الرياضة", en: "Faculty of Physical Education", campus: "sahari" },
  { id: "nursing", ar: "كلية التمريض", en: "Faculty of Nursing", campus: "sahari" },
  { id: "nursing-institute", ar: "المعهد الفني للتمريض", en: "Technical Institute of Nursing", campus: "sahari" },
  { id: "african-studies", ar: "معهد البحوث والدراسات الأفريقية ودول حوض النيل", en: "Institute of African & Nile Basin Studies", campus: "sahari" },
  { id: "energy-engineering", ar: "كلية هندسة الطاقة (امتداد طريق المطار)", en: "Faculty of Energy Engineering", campus: "sahari" },

  // 🔵 أبو الريش
  { id: "engineering", ar: "كلية الهندسة", en: "Faculty of Engineering", campus: "abu-elrish" },

  // 🟣 أسوان الجديدة (شامل التجارة بعد آخر تحديث للجامعة)
  { id: "law", ar: "كلية الحقوق", en: "Faculty of Law", campus: "new-aswan" },
  { id: "dar-aloloom", ar: "كلية دار العلوم", en: "Faculty of Dar Al-Uloom", campus: "new-aswan" },
  { id: "arts", ar: "كلية الآداب", en: "Faculty of Arts", campus: "new-aswan" },
  { id: "al-alsun", ar: "كلية الألسن", en: "Faculty of Al-Alsun (Languages)", campus: "new-aswan" },
  { id: "archaeology", ar: "كلية الآثار", en: "Faculty of Archaeology", campus: "new-aswan" },
  { id: "medicine", ar: "كلية الطب البشري", en: "Faculty of Medicine", campus: "new-aswan" },
  { id: "dentistry", ar: "كلية طب الفم والأسنان", en: "Faculty of Dentistry", campus: "new-aswan" },
  { id: "commerce", ar: "كلية التجارة", en: "Faculty of Commerce", campus: "new-aswan" },

  // 🟠 النفق
  { id: "education", ar: "كلية التربية", en: "Faculty of Education", campus: "naga" },
  { id: "specific-education", ar: "كلية التربية النوعية", en: "Faculty of Specific Education", campus: "naga" },
];

// ── أشهر مناطق مدينة أسوان (~32 منطقة متداولة في العناوين/المواصلات) ──
export const AREAS = [
  { id: "wost-elbalad", ar: "وسط البلد", en: "Wast El-Balad (Downtown)" },
  { id: "corniche", ar: "كورنيش النيل", en: "Nile Corniche" },
  { id: "souq-siyahi", ar: "السوق السياحي", en: "Tourist Souq" },
  { id: "mahatta", ar: "المحطة", en: "El-Mahatta (Station)" },
  { id: "atlas", ar: "أطلس", en: "Atlas" },
  { id: "el-akkad", ar: "العقاد", en: "El-Akkad" },
  { id: "emtidad-el-akkad", ar: "امتداد العقاد", en: "Emtidad El-Akkad" },
  { id: "sadat-road", ar: "طريق السادات", en: "El-Sadat Road" },
  { id: "mahmoudia", ar: "المحمودية", en: "El-Mahmoudia" },
  { id: "sail", ar: "السيل", en: "El-Sail" },
  { id: "sail-elgadid", ar: "السيل الجديد", en: "El-Sail El-Gadid" },
  { id: "sail-sharq", ar: "السيل شرق", en: "El-Sail Sharq" },
  { id: "sail-gharb", ar: "السيل غرب", en: "El-Sail Gharb" },
  { id: "sail-rifi", ar: "السيل الريفي", en: "El-Sail El-Rifi" },
  { id: "kima", ar: "كيما", en: "Kima" },
  { id: "sadaqa", ar: "الصداقة", en: "El-Sadaka" },
  { id: "sadaqa-gadida", ar: "الصداقة الجديدة", en: "El-Sadaka El-Gadida" },
  { id: "sadaqa-qadima", ar: "الصداقة القديمة", en: "El-Sadaka El-Qadima" },
  { id: "naga", ar: "النفق", en: "El-Naga (Tunnel)" },
  { id: "abu-elrish", ar: "أبو الريش", en: "Abu El-Rish" },
  { id: "abu-elrish-qebli", ar: "أبو الريش قبلي", en: "Abu El-Rish Qebli" },
  { id: "abu-elrish-bahari", ar: "أبو الريش بحري", en: "Abu El-Rish Bahari" },
  { id: "sahari", ar: "صحاري", en: "Sahari" },
  { id: "airport-road", ar: "طريق المطار", en: "Airport Road" },
  { id: "new-aswan", ar: "أسوان الجديدة", en: "New Aswan" },
  { id: "elkoror", ar: "الكرور", en: "El-Koror" },
  { id: "kasr-elhagar", ar: "كسر الحجر", en: "Kasr El-Hagar" },
  { id: "sheikh-haroun", ar: "الشيخ هارون", en: "Sheikh Haroun" },
  { id: "nasiriya", ar: "الناصرية", en: "El-Nasiriya" },
  { id: "khor-awadah", ar: "خور عواضة", en: "Khor Awadah" },
  { id: "madina-sinaeya", ar: "المدينة الصناعية", en: "Industrial City" },
  { id: "high-dam", ar: "السد العالي", en: "The High Dam" },
];

// ── التأثيث: id هو قيمة ?furnished= في الفلتر، و value هي القيمة المخزّنة في الداتابيز ──
export const FURNISHED_OPTIONS = [
  { id: "yes", value: true, ar: "مفروشة", en: "Furnished" },
  { id: "no", value: false, ar: "غير مفروشة", en: "Unfurnished" },
];

// ── الجنس (الفلتر + فورم الإضافة). "any" = مناسب للاتنين، وبيظهر في فلتر الولاد والبنات ──
export const GENDER_OPTIONS = [
  { id: "male", ar: "ذكور (شباب)", en: "Male" },
  { id: "female", ar: "إناث (بنات)", en: "Female" },
  { id: "any", ar: "للاتنين", en: "Any" },
];
export const GENDER_IDS = GENDER_OPTIONS.map((g) => g.id);

// ── شامل المرافق (مياه + كهرباء + غاز) ──
export const UTILITIES_OPTIONS = [
  { id: "included", value: true, ar: "شامل مياه وكهرباء وغاز", en: "Utilities included" },
  { id: "excluded", value: false, ar: "غير شامل", en: "Utilities not included" },
];

// ── عدد الغرف في الفلتر: آخر اختيار "4" معناه 4 فأكتر ──
export const BEDROOM_FILTER_OPTIONS = [
  { id: "1", ar: "غرفة", en: "1 bedroom" },
  { id: "2", ar: "غرفتين", en: "2 bedrooms" },
  { id: "3", ar: "3 غرف", en: "3 bedrooms" },
  { id: "4", ar: "4 غرف أو أكتر", en: "4+ bedrooms" },
];

// ── الدور: 0 = أرضي. آخر اختيار "6" معناه 6 فأعلى ──
export const FLOOR_FILTER_OPTIONS = [
  { id: "0", ar: "الدور الأرضي", en: "Ground floor" },
  { id: "1", ar: "الدور الأول", en: "1st floor" },
  { id: "2", ar: "الدور التاني", en: "2nd floor" },
  { id: "3", ar: "الدور التالت", en: "3rd floor" },
  { id: "4", ar: "الدور الرابع", en: "4th floor" },
  { id: "5", ar: "الدور الخامس", en: "5th floor" },
  { id: "6", ar: "السادس فأعلى", en: "6th floor & above" },
];

// ── عدد السراير: آخر اختيار "6" معناه 6 فأكتر ──
export const BEDS_FILTER_OPTIONS = [
  { id: "1", ar: "سرير", en: "1 bed" },
  { id: "2", ar: "سريرين", en: "2 beds" },
  { id: "3", ar: "3 سراير", en: "3 beds" },
  { id: "4", ar: "4 سراير", en: "4 beds" },
  { id: "5", ar: "5 سراير", en: "5 beds" },
  { id: "6", ar: "6 سراير أو أكتر", en: "6+ beds" },
];

// ── ترتيب النتائج ──
export const SORT_OPTIONS = [
  { id: "newest", ar: "الأحدث", en: "Newest" },
  { id: "price_asc", ar: "السعر: من الأقل للأعلى", en: "Price: low to high" },
  { id: "price_desc", ar: "السعر: من الأعلى للأقل", en: "Price: high to low" },
];

// ── المناطق اللي جواها حرم جامعي → أنهي حرم (بنستخدمها نعرض كليات المنطقة) ──
export const AREA_CAMPUS = {
  sahari: "sahari",
  "airport-road": "sahari",
  "abu-elrish": "abu-elrish",
  "abu-elrish-qebli": "abu-elrish",
  "abu-elrish-bahari": "abu-elrish",
  "new-aswan": "new-aswan",
  naga: "naga",
};

// ── Helpers ──
export function getCollegeById(id) {
  return COLLEGES.find((c) => c.id === id) || null;
}

export function getCampusById(id) {
  return CAMPUSES.find((c) => c.id === id) || null;
}

export function getAreaById(id) {
  return AREAS.find((a) => a.id === id) || null;
}

export function collegesByCampus(campusId) {
  return COLLEGES.filter((c) => c.campus === campusId);
}

// الكليات اللي في منطقة معينة (فاضية لو المنطقة مفيهاش حرم جامعي)
export function collegesInArea(areaId) {
  const campusId = AREA_CAMPUS[areaId];
  return campusId ? collegesByCampus(campusId) : [];
}

// كليات سكن معين: الحقل الجديد colleges، وبيرجع للحقل القديم college لو السكن قديم
export function propertyCollegeIds(p) {
  if (Array.isArray(p?.colleges) && p.colleges.length) return p.colleges;
  return p?.college ? [p.college] : [];
}