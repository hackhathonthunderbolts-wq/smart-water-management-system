/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: '#0d2b3e',
        aqua: '#0077b6',
        teal: '#a9c9ca',
        mist: '#eaf4f4',
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 50px -12px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}