/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Premium Desaturated Navy (Sidebar / Dark Surfaces) ───
        navy: {
          50:  '#f4f6f9',
          100: '#e8ecf1',
          200: '#cdd4e0',
          300: '#a3b0c6',
          400: '#7289a7',
          500: '#506a8e',
          600: '#3d5376',
          700: '#334562',
          800: '#2c3a52',
          900: '#1e2a3a',
          950: '#131c28',
        },
        // ─── Premium Accent Teal (Sparingly Used) ───
        accent: {
          50:  '#eefcf8',
          100: '#d5f7ed',
          200: '#aeefde',
          300: '#79e2c8',
          400: '#43ceaf',
          500: '#22b598',
          600: '#16927c',
          700: '#157565',
          800: '#155d52',
          900: '#154d44',
          950: '#062e29',
        },
        // ─── Soft Emerald (Primary Actions) ───
        primary: {
          50:  '#f0fdf6',
          100: '#dbfdeb',
          200: '#b9f9d7',
          300: '#83f2b8',
          400: '#46e291',
          500: '#1ec96f',
          600: '#12a759',
          700: '#128349',
          800: '#14673c',
          900: '#125534',
          950: '#042f1b',
        },
        // ─── Status: Success ───
        success: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        // ─── Status: Warning ───
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // ─── Status: Danger ───
        danger: {
          50:  '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        // ─── Refined Neutrals (Surfaces / Text) ───
        surface: {
          50:  '#fafbfc',
          100: '#f4f6f8',
          200: '#edf0f4',
          300: '#e2e6ec',
          400: '#c8cfd9',
          500: '#9aa5b4',
          600: '#6b7a8d',
          700: '#4a5668',
          800: '#2d3748',
          900: '#1a2332',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        // Layered, soft premium shadows
        'soft-xs':  '0 1px 2px 0 rgba(0,0,0,0.03)',
        'soft-sm':  '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.03)',
        'soft':     '0 4px 6px -1px rgba(0,0,0,0.04), 0 2px 4px -2px rgba(0,0,0,0.03)',
        'soft-md':  '0 6px 16px -4px rgba(0,0,0,0.06), 0 2px 6px -2px rgba(0,0,0,0.03)',
        'soft-lg':  '0 10px 30px -6px rgba(0,0,0,0.08), 0 4px 10px -4px rgba(0,0,0,0.03)',
        'soft-xl':  '0 20px 50px -12px rgba(0,0,0,0.10), 0 8px 20px -8px rgba(0,0,0,0.04)',
        'soft-2xl': '0 25px 65px -15px rgba(0,0,0,0.14)',
        // Glow shadows for accent states
        'glow-accent': '0 0 20px -4px rgba(34,181,152,0.25)',
        'glow-primary': '0 0 20px -4px rgba(30,201,111,0.25)',
        'glow-danger':  '0 0 20px -4px rgba(239,68,68,0.20)',
        // Inner shadow for depth
        'inner-soft': 'inset 0 2px 4px 0 rgba(0,0,0,0.04)',
      },
      animation: {
        'fade-in':       'fadeIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-up':      'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-down':    'slideDown 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        'scale-in':      'scaleIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'shimmer':       'shimmer 2s linear infinite',
        'pulse-soft':    'pulseSoft 2s ease-in-out infinite',
        'float':         'float 6s ease-in-out infinite',
        'glow':          'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 12px -2px rgba(34,181,152,0.15)' },
          '100%': { boxShadow: '0 0 24px -2px rgba(34,181,152,0.30)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
