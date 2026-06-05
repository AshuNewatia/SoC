/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-light': '#F8FAFC',
        'surface': '#FFFFFF',
        'primary': '#0EA5E9',
        'primary-hover': '#0284C7',
        'text-primary': '#0F172A',
        'text-secondary': '#475569',
        'border-light': '#E2E8F0',
        'success': '#10B981',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'], // modern font
      },
      borderRadius: {
        'xl': '1rem', // for cards
      }
    },
  },
  plugins: [],
}