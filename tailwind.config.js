import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'revvo-blue': '#0070f2',
        'revvo-dark-blue': '#162D60',
        'gray-2': '#E5E7EB',
        'gray-3': '#9CA3AF',
        'error': '#DC2626'
      },
      height: {
        'input': '48px'
      },
      fontFamily: {
        'sans': ['Onest', ...defaultTheme.fontFamily.sans],
        'onest': ['Onest', 'sans-serif']
      },
      backgroundImage: {
        'gradient-left': 'linear-gradient(to bottom, #043D7F, #131E2E)'
      },
      keyframes: {
        fadeSlideIn: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        modalIn: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        overlayIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        stickyUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'modal-in': 'modalIn 180ms cubic-bezier(0.22,1,0.36,1)',
        'overlay-in': 'overlayIn 180ms ease-out',
        'sticky-up': 'stickyUp 320ms cubic-bezier(0.22,1,0.36,1)',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
