'use client'
import { motion } from 'framer-motion'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  pulse?: boolean
  variant?: 'outline' | 'filled'
}

export default function Badge({
  children,
  color = '#5B8DEF',
  pulse = false,
  variant = 'outline',
}: BadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono"
      style={{
        color,
        background: variant === 'filled' ? `${color}18` : `${color}08`,
        border: `1px solid ${color}30`,
      }}
    >
      {pulse && (
        <motion.span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: color }}
          animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {children}
    </span>
  )
}
