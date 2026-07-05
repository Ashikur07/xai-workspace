'use client'
import { motion } from 'framer-motion'
import { motionVariants } from '@/lib/constants'

import { useIsExport } from '@/hooks/useIsExport'

export default function Footer() {
  const isExport = useIsExport()

  return (
    <footer id="pricing" className="border-t py-20 px-6 relative" style={{ borderColor: '#1A2235' }}>
      {/* Subtle top gradient */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(91,141,239,0.2), transparent)' }} />

      <motion.div
        className="max-w-6xl mx-auto"
        initial="hidden"
        animate={isExport ? "show" : undefined}
        whileInView={isExport ? undefined : "show"}
        viewport={isExport ? undefined : { once: false, margin: '-50px' }}
        variants={motionVariants.container}
      >
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <motion.div variants={motionVariants.fadeUp} transition={isExport ? { duration: 0 } : undefined}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #4338CA, #5B8DEF)' }}>
                <span className="text-white font-bold text-sm font-mono">X</span>
              </div>
              <span className="font-semibold" style={{ color: '#E2E8F0' }}>Xai</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#6B7A99' }}>
              Intelligence infrastructure for modern teams. Transform raw data into actionable insight.
            </p>
          </motion.div>
          {[
            { title: 'Product', links: ['Platform', 'Insights', 'Automations', 'API'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Status'] },
          ].map((col) => (
            <motion.div key={col.title} variants={motionVariants.fadeUp} transition={isExport ? { duration: 0 } : undefined}>
              <p className="text-sm font-medium mb-5" style={{ color: '#E2E8F0' }}>{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm transition-colors duration-150 hover:text-[#E2E8F0]"
                      style={{ color: '#6B7A99' }}>
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <motion.div
          variants={motionVariants.fadeUp}
          transition={isExport ? { duration: 0 } : undefined}
          className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: '#1A2235' }}
        >
          <p className="text-xs font-mono" style={{ color: '#3E4A63' }}>
            © 2025 Xai, Inc. All rights reserved.
          </p>
          <p className="text-xs font-mono" style={{ color: '#3E4A63' }}>
            Built with Next.js · Three.js · GSAP · Framer Motion
          </p>
        </motion.div>
      </motion.div>
    </footer>
  )
}
