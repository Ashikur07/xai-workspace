'use client'
import { motion } from 'framer-motion'
import { motionVariants } from '@/lib/constants'

import { useIsExport } from '@/hooks/useIsExport'

interface SectionHeaderProps {
  tag: string
  title: string
  description?: string
  align?: 'center' | 'left'
}

export default function SectionHeader({ tag, title, description, align = 'center' }: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left'
  const isExport = useIsExport()

  return (
    <motion.div
      className={`${alignClass} mb-20`}
      variants={motionVariants.container}
      initial="hidden"
      animate={isExport ? "show" : undefined}
      whileInView={isExport ? undefined : "show"}
      viewport={isExport ? undefined : { once: false, margin: '-80px' }}
    >
      <motion.p
        variants={motionVariants.fadeUp}
        transition={isExport ? { duration: 0 } : undefined}
        className="text-xs font-mono tracking-[0.2em] uppercase mb-4"
        style={{ color: '#5B8DEF' }}
      >
        {tag}
      </motion.p>
      <motion.h2
        variants={motionVariants.fadeUp}
        transition={isExport ? { duration: 0 } : undefined}
        className="text-4xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.1]"
        style={{ color: '#E2E8F0' }}
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          variants={motionVariants.fadeUp}
          transition={isExport ? { duration: 0 } : undefined}
          className="mt-5 text-base md:text-lg max-w-lg leading-relaxed"
          style={{
            color: '#6B7A99',
            marginLeft: align === 'center' ? 'auto' : undefined,
            marginRight: align === 'center' ? 'auto' : undefined,
          }}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  )
}
