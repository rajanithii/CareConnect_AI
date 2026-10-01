/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        ink2: '#334155',
        muted: '#64748B',
        line: '#E2E8F0',
        surface: '#F8FAFC',
        white: '#FFFFFF',
        bg: '#FDFBF9',
        red: {
          50: '#FDF1F1',
          100: '#FADBDD',
          300: '#EF8791',
          500: '#DB2142',
          600: '#C41638',
          700: '#9C0F2C',
          800: '#7A0E26',
          900: '#4E0A1B',
        },
        cyan: {
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
        },
      },
      fontFamily: {
        display: ['"Manrope"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 10px 28px -16px rgba(15, 23, 42, 0.12)',
        lift: '0 4px 8px rgba(15, 23, 42, 0.04), 0 24px 48px -18px rgba(196, 22, 56, 0.18)',
        glow: '0 0 0 1px rgba(6, 182, 212, 0.25), 0 0 32px rgba(6, 182, 212, 0.2)',
      },
      backgroundImage: {
        'gradient-red': 'linear-gradient(135deg, #C41638, #9C0F2C)',
        'gradient-ai': 'linear-gradient(135deg, #06B6D4, #22D3EE)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(3deg)' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        floatSlow: 'floatSlow 9s ease-in-out infinite',
        blink: 'blink 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
