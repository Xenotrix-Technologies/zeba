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
          // Exact Packaging Feminine Pink + Purple Palette with Gold
          primaryPink: '#E58BC2',
          brightPink: '#E84FA5',
          deepPink: '#D94696',
          pink: '#E58BC2',
          hotPink: '#E84FA5',
          magenta: '#E84FA5',
          deepMagenta: '#D94696',
          softPink: '#FFEAF4',
          blush: '#FFF5FA',

          // Packaging Plum & Deep Purple
          purple: '#805A82',
          plum: '#805A82',
          deepPurple: '#5F3F68',
          darkPurple: '#38283D',
          darkText: '#38283D',
          mutedPlum: '#735275',
          lightPurple: '#F4EDF6',
          softPurple: '#EFE7F2',

          // Backward compatibility mappings
          navy: '#5F3F68',
          darkNavy: '#38283D',
          deepNavy: '#4A2F52',
          navyMuted: '#805A82',
          lavender: '#805A82',
          lightLavender: '#F4EDF6',
          waffleLilac: '#EFE7F2',

          // Packaging Gold Foil Wordmark & Accents
          gold: '#D9B62F',
          lightGold: '#FDF5D6',
          darkGold: '#B5941E',

          // Backgrounds & Surfaces
          bgRose: '#FFF5FA',
          bgSoft: '#FFF5FA',
          surfaceWhite: '#FFFFFF'
        },
        brand: {
          pink: '#E84FA5',
          primaryPink: '#E58BC2',
          brightPink: '#E84FA5',
          deepPink: '#D94696',
          softPink: '#FFEAF4',
          blush: '#FFF5FA',
          roseBg: '#FFF5FA',

          purple: '#805A82',
          plum: '#805A82',
          deepPurple: '#5F3F68',
          darkPurple: '#38283D',
          darkText: '#38283D',
          mutedPlum: '#735275',
          lightPurple: '#F4EDF6',

          gold: '#D9B62F',
          lightGold: '#FDF5D6',
          accentGold: '#B5941E',

          // Aliases
          navy: '#5F3F68',
          darkNavy: '#38283D',
          deepNavy: '#4A2F52',
          lavender: '#805A82'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
        brand: ['"Cinzel"', 'serif']
      },
      boxShadow: {
        'brand': '0 10px 30px -10px rgba(232, 79, 165, 0.25)',
        'brand-lg': '0 20px 40px -15px rgba(95, 63, 104, 0.20)',
        'magenta-glow': '0 0 25px rgba(232, 79, 165, 0.35)',
        'gold-glow': '0 0 20px rgba(217, 182, 47, 0.35)',
        'purple-glow': '0 0 20px rgba(95, 63, 104, 0.25)',
        'lavender-glow': '0 0 20px rgba(128, 90, 130, 0.25)'
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
