import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── CalcHub Design Tokens ──
        bg:     'var(--bg)',
        sf:     'var(--sf)',
        card:   'var(--card)',
        card2:  'var(--card2)',
        inp:    'var(--inp)',
        b1:     'var(--b1)',
        b2:     'var(--b2)',
        tx:     'var(--tx)',
        mu:     'var(--mu)',
        acc:    'var(--acc)',
        acc2:   'var(--acc2)',

        // Named palette
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#4f83e3',
          600: '#3b6fd4',
          700: '#2a6dd0',
          900: '#1e3a5f',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
        },
      },
      fontFamily: {
        sans:  ['var(--font-syne)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-dm-mono)', 'monospace'],
      },
      borderRadius: {
        sm:   '7px',
        DEFAULT: '12px',
        lg:   '18px',
        xl:   '24px',
      },
      boxShadow: {
        sm:   '0 4px 20px rgba(0,0,0,.45)',
        DEFAULT: '0 8px 32px rgba(0,0,0,.5)',
        lg:   '0 12px 40px rgba(0,0,0,.55)',
        glow: '0 0 24px rgba(79,131,227,.25)',
      },
      animation: {
        'fade-in':    'fadeIn .18s ease',
        'fade-up':    'fadeUp .28s cubic-bezier(.22,1,.36,1)',
        'slide-in':   'slideIn .28s cubic-bezier(.22,1,.36,1)',
        'shimmer':    'shimmer 1.6s ease-in-out infinite',
        'pulse-dot':  'pulseDot 1.8s ease-in-out infinite',
        'marquee':    'marquee 24s linear infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp:   { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'none' } },
        slideIn:  { from: { opacity: '0', transform: 'translateX(16px)' }, to: { opacity: '1', transform: 'none' } },
        shimmer:  { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        pulseDot: { '0%,100%': { boxShadow: '0 0 0 3px rgba(34,197,94,.2)' }, '50%': { boxShadow: '0 0 0 6px rgba(34,197,94,0)' } },
        marquee:  { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
    },
  },
  plugins: [],
}

export default config
