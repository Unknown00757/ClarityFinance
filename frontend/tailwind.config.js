/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkbg: '#0F1117',
        darkcard: '#171A23',
        darkborder: '#292D38',
        darktext: '#F8FAFC',
        darkmuted: '#94A3B8',
        darksuccess: '#10B981',
        darkdanger: '#F43F5E',
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        }
      }
    },
  },
  plugins: [],
}
