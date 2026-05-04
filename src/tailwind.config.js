// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'fashion': {
          'primary': '#e11d48',
          'secondary': '#f59e0b',
          'accent': '#8b5cf6',
          'neutral': '#fef7ed',
        }
      },
      backgroundImage: {
        'fashion-gradient': 'linear-gradient(135deg, #fef7ed 0%, #fdf2f8 50%, #f3e8ff 100%)',
      }
    }
  },
  plugins: [],
};
