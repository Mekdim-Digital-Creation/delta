/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep-space base surfaces
        space: '#0B0F19',
        panel: 'rgba(17, 25, 43, 0.55)',
        line: 'rgba(255, 255, 255, 0.08)',
        // NOTE: `extend.colors` REPLACES a nested scale rather than merging into
        // it, so cyan/violet are declared in full — each adds a `soft` key on
        // top of the stock Tailwind ramp for pastel accent text.
        cyan: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
          soft: '#67e8f9',
          DEFAULT: '#06b6d4',
        },
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
          soft: '#c4b5fd',
          DEFAULT: '#8b5cf6',
        },
      },
      fontFamily: {
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glowCyan: '0 0 30px -6px rgba(34, 211, 238, 0.55)',
        glowViolet: '0 0 30px -6px rgba(139, 92, 246, 0.55)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 9s ease-in-out infinite',
        marquee: 'marquee 26s linear infinite',
      },
    },
  },
  plugins: [],
};
