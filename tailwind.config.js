// DESIGN SYSTEM APPLIED
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xs':   ['0.75rem',  { lineHeight: '1.25rem', letterSpacing: '0.02em'  }],
        'sm':   ['0.875rem', { lineHeight: '1.5rem',  letterSpacing: '0.01em'  }],
        'base': ['1rem',     { lineHeight: '1.5rem',  letterSpacing: '0'       }],
        'lg':   ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'xl':   ['1.25rem',  { lineHeight: '1.75rem', letterSpacing: '-0.02em' }],
        '2xl':  ['1.5rem',   { lineHeight: '2rem',    letterSpacing: '-0.02em' }],
        '4xl':  ['2.25rem',  { lineHeight: '2.5rem',  letterSpacing: '-0.03em' }],
        // 3xl / 5xl / 6xl removed — outside design system allowed sizes
      },
      fontWeight: {
        normal:   '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
      },
      colors: {
        // Tailwind zinc scale is used by default
      },
      borderRadius: {
        'full': '9999px',
        'xl':   '0.75rem',
        'lg':   '0.5rem',
        'md':   '0.375rem',
      },
      spacing: {
        '0':  '0',
        '1':  '0.25rem',
        '2':  '0.5rem',
        '3':  '0.75rem',
        '4':  '1rem',
        '6':  '1.5rem',
        '8':  '2rem',
        '12': '3rem',
        '16': '4rem',
        '24': '6rem',
        '32': '8rem',
        '48': '12rem',
        '64': '16rem',
        '96': '24rem',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fadeSlideUp': 'fadeSlideUp 0.3s ease-out forwards',
        'fadeIn':      'fadeIn 0.2s ease-out forwards',
      },
      keyframes: {
        fadeSlideUp: {
          'from': { opacity: '0', transform: 'translateY(8px)' },
          'to':   { opacity: '1', transform: 'translateY(0)'   },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to':   { opacity: '1' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
