import type { Config } from 'tailwindcss'
import { colors } from './lib/constants'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:             colors.bg,
        surface:        colors.surface,
        'surface-hover': colors.surfaceHover,
        border:         colors.border,
        'border-hover':  colors.borderHover,
        muted:          colors.muted,
        text:           colors.text,
        'text-bright':   colors.textBright,
        dim:            colors.dim,
        accent:         colors.accent,
        'accent-hover':  colors.accentHover,
        glow:           colors.glow,
        purple:         colors.purple,
        green:          colors.green,
        red:            colors.red,
        yellow:         colors.yellow,
        cyan:           colors.cyan,
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
