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
        // الهوية البصرية: سماوي (الأساسي) + كحلي (الدعم) + أبيض
        brand: {
          DEFAULT: "#00ADEF", // الأساسي
          dark: "#0077B6", // hover والأزرار اللي عليها نص أبيض
          50: "#E6F7FD", // خلفيات فاتحة
          100: "#CDEEFB",
        },
        navy: {
          DEFAULT: "#224251", // النصوص والعناوين والفوتر
          dark: "#172F3B",
        },
        surface: "#F4F8FA",
        primary: "#00ADEF",
      },
      // أوزان أخف: bold و black بقوا 600 عشان الخط يبان نظيف مش تخين
      fontWeight: {
        bold: "600",
        black: "600",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-arabic)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};