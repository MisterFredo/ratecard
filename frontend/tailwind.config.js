/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",   // ✅ AJOUT OBLIGATOIRE
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ratecard: {
          green: "#99C221",
          blue: "#10323d",
          gray: "#2C2C2C",
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
