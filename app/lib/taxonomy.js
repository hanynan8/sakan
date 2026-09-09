// path: lib/taxonomy.js
// مصدر واحد لكل بيانات "كليات جامعة أسوان" و"مناطق مدينة أسوان"
// مستخدم في: صفحة البحث /properties، وفورم إضافة سكن بالبروفايل
// مبني على بحث محدث لمقار جامعة أسوان 2026 (آخر تحديث بيضم كلية التجارة تحت أسوان الجديدة)

// ── حرم/تجمعات جامعة أسوان ──
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