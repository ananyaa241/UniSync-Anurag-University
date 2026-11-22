/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          sidebar: '#382044',
          sidebarHover: '#50305F',
          primary: '#7051C8',
          accent: '#159A91',
          bg: '#F7F8FA',
          card: '#FFFFFF',
          text: '#24232B',
          muted: '#737784',
          border: '#E6E8ED',
          completed: '#219653',
          inProgress: '#3578D4',
          pending: '#D99A22',
          overdue: '#D94B4B',
          high: '#E47B32',
          low: '#77808D',
          announcements: '#7654B8',
        }
      },
      fontSize: {
        'xs': ['0.9rem', { lineHeight: '1.4rem' }],
        'sm': ['1.025rem', { lineHeight: '1.55rem' }],
        'base': ['1.15rem', { lineHeight: '1.7rem' }],
        'lg': ['1.3rem', { lineHeight: '1.85rem' }],
        'xl': ['1.55rem', { lineHeight: '2.1rem' }],
        '2xl': ['1.85rem', { lineHeight: '2.4rem' }],
        '3xl': ['2.25rem', { lineHeight: '2.75rem' }],
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
