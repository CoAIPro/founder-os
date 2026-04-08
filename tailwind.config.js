/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",   // ✅ App Router
    "./pages/**/*.{js,ts,jsx,tsx}", // (optional)
    "./components/**/*.{js,ts,jsx,tsx}", // if you have components folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}