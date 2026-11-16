/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#08090B',
        coal: '#111318',
        slate: '#1A1D24',
        bone: '#F4F4F0',
        mist: '#9A9EA8',
        dim: '#5D626D',
        volt: { DEFAULT: '#537BFF', soft: '#8BA4FF', deep: '#2E52D9' },
        iris: { DEFAULT: '#8B5CF6', soft: '#B79CFF' },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      transitionTimingFunction: { expo: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    },
  },
  plugins: [],
}
