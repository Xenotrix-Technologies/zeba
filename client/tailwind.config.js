/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zeba: {
          // Exact Packaging Orchid Magenta / Mauve Pink
          magenta: '#A83B8F',
          hotPink: '#BA4C9E',
          deepMagenta: '#8A2574',
          softPink: '#F7E5F3',
          blush: '#FCF6FB',

          // Exact Packaging Deep Plum / Dark Violet Banner
          navy: '#3C1B50',
          darkNavy: '#260E36',
          deepNavy: '#4F266A',
          navyMuted: '#623482',
          plumText: '#241133',

          // Exact Packaging Gold Foil Wordmark & 100% Safe Seal
          gold: '#F3C948',
          lightGold: '#FDF4D4',
          darkGold: '#C99718',

          // Exact Packaging Lavender Speckled Heating Pad Patch
          lavender: '#7E63B6',
          lightLavender: '#EEE8FA',
          waffleLilac: '#D9CCF4',
          deepPurple: '#5C3FA0',

          // Backgrounds
          bgRose: '#FAF5FA',
          surfaceWhite: '#FFFFFF'
        },
        brand: {
          navy: '#3C1B50',
          darkNavy: '#260E36',
          deepNavy: '#4F266A',
          pink: '#A83B8F',
          deepPink: '#8A2574',
          magenta: '#A83B8F',
          softPink: '#F7E5F3',
          blush: '#FCF6FB',
          gold: '#F3C948',
          lightGold: '#FDF4D4',
          accentGold: '#C99718',
          lavender: '#7E63B6',
          plum: '#3C1B50',
          roseBg: '#FAF5FA'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
        brand: ['"Cinzel"', 'serif']
      },
      boxShadow: {
        'brand': '0 10px 30px -10px rgba(168, 59, 143, 0.25)',
        'brand-lg': '0 20px 40px -15px rgba(60, 27, 80, 0.20)',
        'magenta-glow': '0 0 25px rgba(168, 59, 143, 0.35)',
        'gold-glow': '0 0 20px rgba(243, 201, 72, 0.35)',
        'lavender-glow': '0 0 20px rgba(126, 99, 182, 0.25)'
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      }
    },
  },
  plugins: [],
}
