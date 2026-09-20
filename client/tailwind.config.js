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
          // Exact Packaging Midnight Navy
          navy: '#0E1B4D',
          darkNavy: '#081033',
          deepNavy: '#172A6B',
          navyMuted: '#1E3170',

          // Exact Packaging Vibrant Magenta / Hot Pink
          magenta: '#FF2D78',
          hotPink: '#F51E6E',
          deepMagenta: '#D00A52',
          softPink: '#FFE4EF',
          blush: '#FFF0F6',

          // Exact Packaging Gold Foil Wordmark
          gold: '#E5C06E',
          lightGold: '#FDF1C7',
          darkGold: '#B88B2A',

          // Exact Packaging Lavender / Lilac Heating Pad Patch
          lavender: '#9F7AEA',
          lightLavender: '#EDE9FE',
          waffleLilac: '#DDD6FE',
          deepPurple: '#6D28D9',

          // Backgrounds
          bgRose: '#FAF8FB',
          surfaceWhite: '#FFFFFF'
        },
        brand: {
          navy: '#0E1B4D',
          darkNavy: '#081033',
          deepNavy: '#172A6B',
          pink: '#FF2D78',
          deepPink: '#D00A52',
          softPink: '#FFE4EF',
          blush: '#FFF0F6',
          gold: '#E5C06E',
          lightGold: '#FDF1C7',
          accentGold: '#B88B2A',
          lavender: '#9F7AEA',
          roseBg: '#FAF8FB'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
        brand: ['"Cinzel"', 'serif']
      },
      boxShadow: {
        'brand': '0 10px 30px -10px rgba(255, 45, 120, 0.25)',
        'brand-lg': '0 20px 40px -15px rgba(14, 27, 77, 0.18)',
        'magenta-glow': '0 0 25px rgba(255, 45, 120, 0.35)',
        'gold-glow': '0 0 20px rgba(229, 192, 110, 0.30)',
        'lavender-glow': '0 0 20px rgba(159, 122, 234, 0.25)'
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
