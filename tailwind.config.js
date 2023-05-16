/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    backgroundImage: {
      'pack-train': "url('background.gif')",
      'pack-train2': "url('black.gif')",
    },
    extend: {},
  },
  plugins: [],
}

