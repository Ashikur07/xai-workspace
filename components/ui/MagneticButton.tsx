'use client'
import { useEffect, useRef } from 'react'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  strength?: number
}

/**
 * Wraps children in a magnetic hover effect — the element subtly
 * follows the cursor when hovered, then snaps back.
 */
export default function MagneticButton({
  children,
  className = '',
  onClick,
  strength = 0.3,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) * strength
      const dy = (e.clientY - cy) * strength
      el.style.transform = `translate(${dx}px, ${dy}px)`
    }

    const onLeave = () => {
      el.style.transform = 'translate(0px, 0px)'
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [strength])

  return (
    <div
      ref={ref}
      className={`inline-block cursor-pointer ${className}`}
      style={{ transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)' }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
