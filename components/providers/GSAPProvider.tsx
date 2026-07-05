'use client'
import { useEffect, useState, createContext, useContext } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
  return useContext(LenisContext)
}

/**
 * Registers GSAP plugins once at app level.
 * Configures ScrollTrigger and integrates Lenis smooth kinetic scrolling.
 */
export default function GSAPProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Global GSAP defaults
    gsap.defaults({
      ease: 'power3.out',
      duration: 0.8,
    })

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const params = new URLSearchParams(window.location.search)
    const isExport = params.get('export') === 'true' || params.get('figma') === 'true'

    let lenisInst: Lenis | null = null
    let tickerUpdate: ((time: number) => void) | null = null

    if (!prefersReducedMotion && !isExport) {
      // Initialize Lenis smooth scroll
      lenisInst = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential easing
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
      })

      setLenis(lenisInst)

      // Synchronize ScrollTrigger update events on scroll
      lenisInst.on('scroll', ScrollTrigger.update)

      // Hook Lenis raf loops to the GSAP ticker for performance
      tickerUpdate = (time: number) => {
        lenisInst?.raf(time * 1000)
      }
      gsap.ticker.add(tickerUpdate)
    }

    // Disable lag smoothing to keep ticker and scroll aligned perfectly
    gsap.ticker.lagSmoothing(0)

    // ScrollTrigger configuration for fluid layout transitions
    ScrollTrigger.config({
      ignoreMobileResize: true,     // prevent jank from mobile address-bar resize
      autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load', // minimal refresh triggers
    })

    // Debounced refresh to avoid layout thrash
    let rafId: number
    const onResize = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => ScrollTrigger.refresh())
    }
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(rafId)
      ScrollTrigger.getAll().forEach(t => t.kill())
      if (tickerUpdate) {
        gsap.ticker.remove(tickerUpdate)
      }
      if (lenisInst) {
        lenisInst.destroy()
      }
    }
  }, [])

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  )
}
