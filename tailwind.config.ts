import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:         '#060A0F',
        surface:    '#0C1118',
        'surface-hover': '#111820',
        border:     '#1A2235',
        'border-hover': '#253350',
        muted:      '#3E4A63',
        text:       '#E2E8F0',
        'text-bright': '#F8FAFC',
        dim:        '#6B7A99',
        accent:     '#5B8DEF',
        'accent-hover': '#7BA3F7',
        glow:       '#3B6FD4',
        purple:     '#A78BFA',
        green:      '#34D399',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)', filter: 'blur(4px)' },
          to: { opacity: '1', transform: 'translateY(0)', filter: 'blur(0px)' },
        },
        fadeIn: {
          from: { opacity: '0', filter: 'blur(4px)' },
          to: { opacity: '1', filter: 'blur(0px)' },
        },
      },
      letterSpacing: {
        'tight-2': '-0.03em',
        'tight-1': '-0.02em',
        'wide-1': '0.15em',
        'wide-2': '0.2em',
      },
    },
  },
  plugins: [],
}
export default config
