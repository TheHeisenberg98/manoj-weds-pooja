/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        royal: {
          bg: '#1A0A0A',
          red: '#8B1C1C',
          'red-light': '#A52A2A',
          gold: '#D4A853',
          'gold-light': '#F5D998',
          'gold-dark': '#B8860B',
          cream: '#F5E6D0',
          muted: '#C4A882',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease forwards',
        'slide-up': 'slideUp 0.6s ease forwards',
        'scale-in': 'scaleIn 0.6s ease forwards',
        'spin-slow': 'spin 0.8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 1.5s infinite',
        'shake': 'shake 0.5s ease',
        'confetti-fall': 'confettiFall 3s ease-in forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 168, 83, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 168, 83, 0.4), 0 0 60px rgba(212, 168, 83, 0.1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-8px)' },
          '75%': { transform: 'translateX(8px)' },
        },
      },
    },
  },
  plugins: [],
};
