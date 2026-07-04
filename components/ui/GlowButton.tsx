'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlowButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
  onClick?: () => void
}

export default function GlowButton({ children, variant = 'primary', className = '', onClick }: GlowButtonProps) {
  if (variant === 'secondary') {
    return (
      <motion.button
        className={`relative px-7 py-3.5 rounded-xl font-medium text-sm border overflow-hidden group ${className}`}
        style={{
          color: '#8892A4',
          background: 'rgba(255,255,255,0.02)',
          borderColor: '#1A2235',
        }}
        whileHover={{
          scale: 1.03,
          borderColor: 'rgba(91,141,239,0.4)',
          color: '#E2E8F0',
        }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        <motion.div
          className="absolute inset-0 opacity-0"
          style={{ background: 'linear-gradient(135deg, rgba(91,141,239,0.08), rgba(167,139,250,0.05))' }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    )
  }

  return (
    <motion.button
      className={`relative px-7 py-3.5 rounded-xl font-medium text-sm text-white overflow-hidden group ${className}`}
      style={{ background: 'linear-gradient(135deg, #4338CA, #5B8DEF)' }}
      whileHover={{
        scale: 1.03,
        boxShadow: '0 0 40px rgba(91,141,239,0.5), 0 0 80px rgba(91,141,239,0.2)',
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['200% center', '-200% center'],
        }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
      />
      {/* Gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 opacity-0"
        style={{ background: 'linear-gradient(135deg, #5B8DEF, #A78BFA)' }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  )
}
