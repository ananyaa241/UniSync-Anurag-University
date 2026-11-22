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
        'xs': ['0.75rem', { lineHeight: '1.125rem' }],   // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],       // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
