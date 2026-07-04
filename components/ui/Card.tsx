'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  glass?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

const paddingMap = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export default function Card({
  children,
  className = '',
  hover = true,
  glow = false,
  glass = false,
  padding = 'md',
}: CardProps) {
  return (
    <motion.div
      className={`rounded-xl border transition-colors duration-200 ${paddingMap[padding]} ${className}`}
      style={{
        background: glass
          ? 'rgba(12,17,24,0.7)'
          : '#0A0F16',
        borderColor: '#1A2235',
        backdropFilter: glass ? 'blur(12px)' : undefined,
        boxShadow: glow
          ? '0 0 40px rgba(91,141,239,0.06), inset 0 1px 0 rgba(255,255,255,0.03)'
          : 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
      whileHover={hover ? {
        y: -2,
        borderColor: '#253350',
        boxShadow: glow
          ? '0 0 50px rgba(91,141,239,0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 8px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}
