'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * Animates a number from 0 to `target` when `trigger` becomes true.
 * Returns the current animated value as a formatted string.
 */
export function useAnimatedCounter(
  target: number,
  trigger: boolean,
  options: {
    duration?: number
    decimals?: number
    prefix?: string
    suffix?: string
    separator?: string
  } = {}
) {
  const { duration = 2000, decimals = 0, prefix = '', suffix = '', separator = ',' } = options
  const [displayValue, setDisplayValue] = useState('0')
  const startTime = useRef<number | null>(null)
  const rafId = useRef<number>(0)

  useEffect(() => {
    if (!trigger) return

    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

    const animate = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const progress = duration <= 0 ? 1 : Math.min(elapsed / duration, 1)
      const eased = easeOutExpo(progress)
      const current = eased * target

      // Format with separator
      const fixed = current.toFixed(decimals)
      const [whole, decimal] = fixed.split('.')
      const formatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
      const result = decimal ? `${formatted}.${decimal}` : formatted

      setDisplayValue(`${prefix}${result}${suffix}`)

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate)
      }
    }

    startTime.current = null
    rafId.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(rafId.current)
  }, [trigger, target, duration, decimals, prefix, suffix, separator])

  return displayValue
}
