'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Use interval-based progress (more reliable than rAF in all environments)
    let current = 0
    const interval = setInterval(() => {
      current += 4
      if (current >= 100) {
        current = 100
        clearInterval(interval)
        // Start fade-out after reaching 100%
        setTimeout(() => setVisible(false), 300)
      }
      setProgress(current)
    }, 50) // 25 steps × 50ms = 1.25s total

    // Safety: force hide after 2.5s no matter what
    const safety = setTimeout(() => {
      clearInterval(interval)
      setVisible(false)
    }, 2500)

    return () => {
      clearInterval(interval)
      clearTimeout(safety)
    }
  }, [])

  if (!visible) return null

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: '#060A0F' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      animate={{ opacity: progress >= 100 ? 0 : 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Logo mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
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
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
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

      {/* Progress bar */}
      <div className="w-32 h-[1px] rounded-full mb-4" style={{ background: '#1A2235' }}>
        <div
          className="h-full rounded-full transition-all duration-100"
          style={{
            background: 'linear-gradient(90deg, #5B8DEF, #A78BFA)',
            width: `${progress}%`,
          }}
        />
      </div>

      {/* Progress text */}
      <p className="text-xs font-mono" style={{ color: '#3E4A63' }}>
        {progress}%
      </p>
    </motion.div>
  )
}
