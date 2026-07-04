'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const handleLoad = () => {
      // Small delay to ensure smooth transition and allow branding to be seen
      setTimeout(() => setVisible(false), 800)
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
      // Safety: force hide after 2.5 seconds max
      const safety = setTimeout(handleLoad, 2500)
      
      return () => {
        window.removeEventListener('load', handleLoad)
        clearTimeout(safety)
      }
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: '#060A0F' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo mark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6"
          >
            <div className="relative w-14 h-14">
              {/* Outer rotating ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '1px solid rgba(91,141,239,0.3)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              {/* Inner pulsing ring */}
              <motion.div
                className="absolute inset-2 rounded-full"
                style={{ border: '1px solid rgba(91,141,239,0.15)' }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Logo */}
              <div
                className="absolute inset-0 flex items-center justify-center rounded-full"
                style={{ background: 'rgba(91,141,239,0.1)' }}
              >
                <span className="text-xl font-bold font-mono" style={{ color: '#5B8DEF' }}>X</span>
              </div>
            </div>
          </motion.div>

          {/* Branded Pulse Text */}
          <motion.p
            className="text-xs font-mono tracking-[0.2em] uppercase"
            style={{ color: '#6B7A99' }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            Initializing Workspace
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
