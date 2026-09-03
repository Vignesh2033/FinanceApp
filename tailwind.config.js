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
        forest: {
          50: '#f2f9f4',
          100: '#e1f2e6',
          200: '#c5e4cf',
          300: '#99d0ab',
          400: '#64b480',
          500: '#3e975c',
          600: '#2c6e49', // FinBoom Primary
          700: '#24593c',
          800: '#1f4731',
          900: '#1a3b2a',
          950: '#0c1f15',
        },
        canvas: {
          50: '#fbfcf9',
          100: '#f5f7f2',
          200: '#ebefe5',
          300: '#dce3d2',
          800: '#181e1b',
          900: '#111614',
          950: '#0a0d0c',
        }
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
