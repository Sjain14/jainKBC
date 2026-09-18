/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // KBC deep navy blues
        navy: {
          950: '#020818',
          900: '#050d2d',
          800: '#071240',
          700: '#0a1a55',
          600: '#0d2266',
        },
        // KBC gold palette
        gold: {
          300: '#f5d98b',
          400: '#e8c05a',
          500: '#c9a84c',
          600: '#a8882e',
          700: '#7a621a',
        },
        // Option button states
        option: {
          idle:    '#0d2260',
          hover:   '#1a3580',
          selected: '#d97706',
          correct: '#15803d',
          wrong:   '#b91c1c',
        },
      },
      fontFamily: {
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
        sans: ['"Noto Sans"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 20px rgba(201,168,76,0.4), 0 0 60px rgba(201,168,76,0.15)',
        'gold-sm': '0 0 10px rgba(201,168,76,0.3)',
        inner: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      animation: {
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'spin-slow':  'spin 8s linear infinite',
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'shake':      'shake 0.5s ease-in-out',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(201,168,76,0.3)' },
          '50%':      { boxShadow: '0 0 30px rgba(201,168,76,0.7)' },
        },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shake:   { '0%,100%': { transform: 'translateX(0)' }, '20%,60%': { transform: 'translateX(-6px)' }, '40%,80%': { transform: 'translateX(6px)' } },
      },
    },
  },
  plugins: [],
}
