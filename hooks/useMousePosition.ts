'use client'
import { useEffect, useRef } from 'react'

interface MousePosition {
  x: number
  y: number
  clientX: number
  clientY: number
}

/**
 * Tracks normalized mouse position via ref (no re-renders).
 * x/y are normalized to [-1, 1] range.
 */
export function useMousePosition() {
  const mouse = useRef<MousePosition>({ x: 0, y: 0, clientX: 0, clientY: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
      mouse.current.clientX = e.clientX
      mouse.current.clientY = e.clientY
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return mouse
}
