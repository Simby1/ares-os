/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ares-orange': '#ff5f1f',
        'ares-red': '#ff3131',
      },
    },
  },
  plugins: [],
}