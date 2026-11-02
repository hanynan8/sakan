/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // الهوية البصرية: Royal Blue (الأساسي) + Dark Blue (العناوين والفوتر) + Slate Blue (لمسات وبادجات)
        brand: {
          DEFAULT: "#4169E1", // Royal Blue - الأساسي
          dark: "#2C4AB8", // hover والأزرار اللي عليها نص أبيض
          50: "#EEF2FD", // خلفيات فاتحة
          100: "#DCE4FA",
        },
        navy: {
          DEFAULT: "#00008B", // Dark Blue - العناوين والفوتر
          dark: "#000066",
        },
        surface: "#F4F6FB",
        slate: "#6A5ACD", // Slate Blue - بادجات ولمسات
        primary: "#4169E1",
        gray: { 50: "#F4F6FB" }, // خلفيات الأقسام بميلة خفيفة للأزرق
      },
      // أوزان أخف: bold و black بقوا 600 عشان الخط يبان نظيف مش تخين
      fontWeight: {
        bold: "600",
        black: "600",
      },
      fontFamily: {
        sans: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};