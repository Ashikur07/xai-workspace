/* ── Design Tokens ── */
export const colors = {
  bg:      '#060A0F',
  surface: '#0C1118',
  surfaceHover: '#111820',
  border:  '#1A2235',
  borderHover: '#253350',
  muted:   '#3E4A63',
  dim:     '#6B7A99',
  text:    '#E2E8F0',
  textBright: '#F8FAFC',

  accent:  '#5B8DEF',
  accentHover: '#7BA3F7',
  glow:    '#3B6FD4',
  purple:  '#A78BFA',
  green:   '#34D399',
  red:     '#F87171',
  yellow:  '#FBBF24',
  cyan:    '#22D3EE',
} as const

/* ── Easing Curves ── */
export const easings = {
  smooth:     [0.22, 1, 0.36, 1] as const,
  bounce:     [0.34, 1.56, 0.64, 1] as const,
  snappy:     [0.16, 1, 0.3, 1] as const,
  decel:      [0, 0.55, 0.45, 1] as const,
  dramatic:   [0.76, 0, 0.24, 1] as const,
}

/* ── Duration Scale ── */
export const durations = {
  instant: 0.15,
  fast:    0.25,
  normal:  0.45,
  slow:    0.7,
  slower:  1.0,
  dramatic: 1.5,
}

/* ── Spacing Scale (8px base) ── */
export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
  '5xl': 128,
  section: 160,
}

/* ── Shared Motion Variants ── */
export const motionVariants = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  },
  fadeUp: {
    hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
    show: {
      opacity: 1, y: 0, filter: 'blur(0px)',
      transition: { duration: durations.slow, ease: easings.smooth },
    },
  },
  fadeIn: {
    hidden: { opacity: 0, filter: 'blur(4px)' },
    show: {
      opacity: 1, filter: 'blur(0px)',
      transition: { duration: durations.normal, ease: easings.smooth },
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    show: {
      opacity: 1, scale: 1,
      transition: { duration: durations.normal, ease: easings.bounce },
    },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 30 },
    show: {
      opacity: 1, x: 0,
      transition: { duration: durations.normal, ease: easings.smooth },
    },
  },
  slideRight: {
    hidden: { opacity: 0, x: -30 },
    show: {
      opacity: 1, x: 0,
      transition: { duration: durations.normal, ease: easings.smooth },
    },
  },
}
