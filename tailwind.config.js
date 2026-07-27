/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefdf5',
          100: '#d6fae6',
          200: '#aef2cf',
          300: '#76e4b3',
          400: '#3ecd92',
          500: '#18b077',
          600: '#0d8f61',
          700: '#0c7250',
          800: '#0c5a42',
          900: '#0b4a37',
          950: '#04291f',
        },
        accent: {
          50: '#f1f0ff',
          100: '#e4e1ff',
          200: '#cdc7ff',
          300: '#aa9dff',
          400: '#8570ff',
          500: '#6a47f8',
          600: '#5c2fec',
          700: '#4d22d0',
          800: '#401ea9',
          900: '#361d85',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(15, 23, 42, 0.08), 0 8px 24px -6px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
