/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        luxury: {
          black: '#080808',
          charcoal: '#111111',
          slate: '#1a1a1a',
          gold: '#c9a962',
          'gold-light': '#e2d4a8',
          'gold-muted': '#8a7a5a',
          cream: '#f0ebe3',
          smoke: '#9a9590',
        },
      },
      letterSpacing: {
        luxury: '0.25em',
        wideish: '0.12em',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slow-zoom': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.06)' },
        },
        'scroll-hint': {
          '0%, 100%': { opacity: '0.4', transform: 'translateY(0)' },
          '50%': { opacity: '1', transform: 'translateY(6px)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'hero-slide-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'hero-bg-fade': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'fade-in': 'fade-in 1s ease-out forwards',
        'slow-zoom': 'slow-zoom 20s ease-out forwards',
        'scroll-hint': 'scroll-hint 2s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'toast-in': 'toast-in 0.22s ease-out forwards',
        'hero-slide-in': 'hero-slide-in 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'hero-bg-fade': 'hero-bg-fade 1.2s ease-out forwards',
      },
    },
  },
  plugins: [],
};
