'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * Returns a ref-based scroll progress (0-1) for a given element.
 * Uses IntersectionObserver + scroll listener for performance.
 */
export function useScrollProgress(offset: { start?: number; end?: number } = {}) {
  const elementRef = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    // Track when element is in viewport
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0, rootMargin: '100px 0px 100px 0px' }
    )
    observer.observe(el)

    const onScroll = () => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const start = offset.start ?? 0
      const end = offset.end ?? 0
      const viewH = window.innerHeight
      const totalScroll = rect.height + viewH - start - end
      const scrolled = viewH - rect.top - start
      progress.current = Math.min(Math.max(scrolled / totalScroll, 0), 1)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [offset.start, offset.end])

  return { ref: elementRef, progress, isInView }
}
