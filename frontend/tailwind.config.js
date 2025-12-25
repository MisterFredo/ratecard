/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ratecard: {
          primary: "#000000",
          secondary: "#444444",
          accent: "#e63946"
        }
      }
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
