'use client'
import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

/**
 * Registers GSAP plugins once at app level.
 * Configures ScrollTrigger and integrates Lenis smooth kinetic scrolling.
 */
export default function GSAPProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Global GSAP defaults
    gsap.defaults({
      ease: 'power3.out',
      duration: 0.8,
    })

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential easing
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    })

    // Synchronize ScrollTrigger update events on scroll
    lenis.on('scroll', ScrollTrigger.update)

    // Hook Lenis raf loops to the GSAP ticker for performance
    const tickerUpdate = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tickerUpdate)

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
      gsap.ticker.remove(tickerUpdate)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
