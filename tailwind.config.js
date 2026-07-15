/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        board: {
          DEFAULT: '#1F4D3A',   // Deep chalkboard green
          dark: '#172E24',      // Darker blackboard
          light: '#254F42',     // Secondary background
          border: '#2E6B52',    // Dividers / border
          wood: '#8B5A2B',      // Wooden brown
          'wood-dark': '#5E3A1A', // Darker wood
          'wood-light': '#A0703A', // Lighter wood highlight
        },
        chalk: {
          white: '#F8F8F2',     // Chalk white
          yellow: '#F8E16C',    // Chalk yellow
          pink: '#FF9CCF',      // Chalk pink
          blue: '#7FD6FF',      // Chalk blue
          muted: '#A8B5A0',     // Muted chalk
          green: '#88D9A8',     // Chalk green
        },
      },
      fontFamily: {
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
        display: ['var(--font-caveat)', 'Caveat', 'cursive'],
        handwritten: ['var(--font-kalam)', 'Kalam', 'cursive'],
        mono: ['var(--font-inter)', 'monospace'],
      },
      boxShadow: {
        chalk: '0 0 12px rgba(248,248,242,0.12)',
        'chalk-lg': '0 0 24px rgba(248,248,242,0.18)',
        wood: '4px 4px 0px #5E3A1A, inset 0 1px 0 rgba(255,255,255,0.12)',
        'wood-sm': '2px 2px 0px #5E3A1A',
        'inset-chalk': 'inset 0 0 30px rgba(0,0,0,0.4)',
      },
      borderRadius: {
        chalk: '2px',
      },
      backgroundImage: {
        'chalk-dust': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'chalk-write': 'chalkWrite 1.2s ease-out forwards',
        'dust-float': 'dustFloat 8s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'slide-in': 'slideIn 0.4s ease-out forwards',
      },
      keyframes: {
        chalkWrite: {
          '0%': { opacity: '0', letterSpacing: '-0.1em' },
          '100%': { opacity: '1', letterSpacing: '0.04em' },
        },
        dustFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)', opacity: '0.3' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)', opacity: '0.1' },
        },
        glowPulse: {
          '0%, 100%': { textShadow: '0 0 4px rgba(248,225,108,0.4)' },
          '50%': { textShadow: '0 0 12px rgba(248,225,108,0.8), 0 0 20px rgba(248,225,108,0.4)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
