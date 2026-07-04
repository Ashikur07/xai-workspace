'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { INSIGHT_STAGES } from '@/lib/data'
import { easings } from '@/lib/constants'

/* ═══════════════════════════════════════════════════════════════
   Animated SVG visuals for each stage
   ═══════════════════════════════════════════════════════════════ */

function IngestVisual({ progress }: { progress: number }) {
  return (
    <svg viewBox="0 0 320 320" className="w-full h-full" fill="none">
      {/* Data stream lines flowing inward */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const r = 140
        const x1 = 160 + r * Math.cos(angle)
        const y1 = 160 + r * Math.sin(angle)
        const dashOffset = 200 - progress * 200
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={160} y2={160}
            stroke="#5B8DEF"
            strokeWidth="1"
            strokeDasharray="4 8"
            strokeDashoffset={dashOffset}
            opacity={0.3 + progress * 0.4}
          />
        )
      })}
      {/* Incoming data dots */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2 + progress * 0.5
        const r = 130 - progress * 90
        const x = 160 + r * Math.cos(angle)
        const y = 160 + r * Math.sin(angle)
        const size = 2 + Math.sin(i * 1.3) * 1.5
        return (
          <circle
            key={i}
            cx={x} cy={y} r={size}
            fill="#5B8DEF"
            opacity={0.3 + (Math.sin(progress * Math.PI * 2 + i) * 0.3)}
          />
        )
      })}
      {/* Center collection point */}
      <circle cx={160} cy={160} r={8 + progress * 12} fill="#5B8DEF" opacity={0.08 + progress * 0.08} />
      <circle cx={160} cy={160} r={4 + progress * 4} fill="#5B8DEF" opacity={0.4 + progress * 0.3} />
      {/* Outer ring */}
      <circle
        cx={160} cy={160} r={100}
        stroke="#5B8DEF" strokeWidth="0.5"
        strokeDasharray={`${progress * 628} ${628}`}
        opacity={0.3}
        fill="none"
        transform="rotate(-90 160 160)"
      />
      {/* Data format labels */}
      {['JSON', 'SQL', 'CSV', 'API'].map((label, i) => {
        const angle = (i / 4) * Math.PI * 2 - Math.PI / 4
        const r = 120
        const x = 160 + r * Math.cos(angle)
        const y = 160 + r * Math.sin(angle)
        return (
          <text
            key={label} x={x} y={y}
            textAnchor="middle" dominantBaseline="middle"
            fill="#5B8DEF" fontSize="9" fontFamily="JetBrains Mono, monospace"
            opacity={progress > 0.3 ? Math.min((progress - 0.3) * 3, 0.5) : 0}
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}

function AnalyzeVisual({ progress }: { progress: number }) {
  return (
    <svg viewBox="0 0 320 320" className="w-full h-full" fill="none">
      {/* Neural network nodes */}
      {Array.from({ length: 3 }).map((_, layer) =>
        Array.from({ length: 4 }).map((_, node) => {
          const x = 80 + layer * 80
          const y = 100 + node * 40
          const nodeProgress = Math.max(0, Math.min((progress - layer * 0.2) * 3, 1))
          return (
            <g key={`${layer}-${node}`}>
              <circle
                cx={x} cy={y} r={5 * nodeProgress}
                fill="#A78BFA"
                opacity={0.5 * nodeProgress}
              />
              <circle
                cx={x} cy={y} r={12 * nodeProgress}
                fill="none" stroke="#A78BFA"
                strokeWidth="0.5"
                opacity={0.2 * nodeProgress}
              />
              {/* Connections to next layer */}
              {layer < 2 && Array.from({ length: 4 }).map((_, nextNode) => {
                const x2 = 80 + (layer + 1) * 80
                const y2 = 100 + nextNode * 40
                const lineProgress = Math.max(0, Math.min((progress - layer * 0.25 - 0.1) * 3, 1))
                return (
                  <line
                    key={nextNode}
                    x1={x} y1={y} x2={x + (x2 - x) * lineProgress} y2={y + (y2 - y) * lineProgress}
                    stroke="#A78BFA"
                    strokeWidth="0.5"
                    opacity={0.15 * lineProgress}
                  />
                )
              })}
            </g>
          )
        })
      )}
      {/* Scanning ring */}
      <circle
        cx={160} cy={160} r={80}
        stroke="#A78BFA" strokeWidth="1"
        strokeDasharray="6 4"
        fill="none"
        opacity={0.3}
        transform={`rotate(${progress * 360} 160 160)`}
      />
      <circle
        cx={160} cy={160} r={55}
        stroke="#A78BFA" strokeWidth="0.5"
        strokeDasharray="3 6"
        fill="none"
        opacity={0.2}
        transform={`rotate(${-progress * 180} 160 160)`}
      />
      {/* Confidence indicator */}
      <text
        x={160} y={280}
        textAnchor="middle" fill="#A78BFA"
        fontSize="10" fontFamily="JetBrains Mono, monospace"
        opacity={progress > 0.5 ? (progress - 0.5) * 2 : 0}
      >
        {`Confidence: ${Math.round(progress * 94.2)}%`}
      </text>
    </svg>
  )
}

function InsightVisual({ progress }: { progress: number }) {
  return (
    <svg viewBox="0 0 320 320" className="w-full h-full" fill="none">
      {/* Chart bars growing */}
      {[40, 65, 50, 82, 70, 95, 60, 88].map((h, i) => {
        const barProgress = Math.max(0, Math.min((progress - i * 0.05) * 2.5, 1))
        const x = 60 + i * 28
        const height = h * 1.5 * barProgress
        return (
          <g key={i}>
            <rect
              x={x} y={260 - height} width={18} height={height}
              rx={3}
              fill={i === 7 ? '#34D399' : '#1A2235'}
              opacity={i === 7 ? 0.8 : 0.5}
            />
            {i === 7 && (
              <rect
                x={x} y={260 - height} width={18} height={height}
                rx={3}
                fill="#34D399"
                opacity={0.3 * barProgress}
                filter="url(#barGlow)"
              />
            )}
          </g>
        )
      })}
      {/* Trend line */}
      <path
        d={`M 69 ${260 - 40 * 1.5 * progress} 
            L 97 ${260 - 65 * 1.5 * progress}
            L 125 ${260 - 50 * 1.5 * progress}
            L 153 ${260 - 82 * 1.5 * progress}
            L 181 ${260 - 70 * 1.5 * progress}
            L 209 ${260 - 95 * 1.5 * progress}
            L 237 ${260 - 60 * 1.5 * progress}
            L 265 ${260 - 88 * 1.5 * progress}`}
        stroke="#34D399"
        strokeWidth="1.5"
        fill="none"
        opacity={progress > 0.4 ? (progress - 0.4) * 1.6 : 0}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Insight badges appearing */}
      {progress > 0.6 && (
        <>
          <rect x={60} y={60} width={90} height={28} rx={6} fill="#34D399" opacity={0.1 * Math.min((progress - 0.6) * 4, 1)} />
          <text x={105} y={78} textAnchor="middle" fill="#34D399" fontSize="9" fontFamily="JetBrains Mono, monospace" opacity={Math.min((progress - 0.6) * 4, 0.7)}>
            +22% Revenue
          </text>
        </>
      )}
      {progress > 0.75 && (
        <>
          <rect x={170} y={50} width={95} height={28} rx={6} fill="#5B8DEF" opacity={0.1 * Math.min((progress - 0.75) * 4, 1)} />
          <text x={217} y={68} textAnchor="middle" fill="#5B8DEF" fontSize="9" fontFamily="JetBrains Mono, monospace" opacity={Math.min((progress - 0.75) * 4, 0.7)}>
            3 Anomalies
          </text>
        </>
      )}
      {/* Glow filter */}
      <defs>
        <filter id="barGlow">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
    </svg>
  )
}

const STAGE_VISUALS = [IngestVisual, AnalyzeVisual, InsightVisual]

// Custom crossfade opacity function helper for seamless morphing
function getStageOpacity(stageIndex: number, p: number) {
  if (stageIndex === 0) {
    if (p <= 0.28) return 1
    if (p >= 0.38) return 0
    return 1 - (p - 0.28) / 0.1
  }
  if (stageIndex === 1) {
    if (p <= 0.28) return 0
    if (p >= 0.72) return 0
    if (p > 0.28 && p < 0.38) return (p - 0.28) / 0.1
    if (p >= 0.38 && p <= 0.62) return 1
    return 1 - (p - 0.62) / 0.1
  }
  if (stageIndex === 2) {
    if (p <= 0.62) return 0
    if (p >= 0.72) return 1
    return (p - 0.62) / 0.1
  }
  return 0
}

/* ═══════════════════════════════════════════════════════════════
   Main InsightFlow — Optimized GSAP scroll tracking + LERP + interactive tabs
   ═══════════════════════════════════════════════════════════════ */
export default function InsightFlow() {
  const outerRef = useRef<HTMLDivElement>(null)   // full scroll height wrapper
  const innerRef = useRef<HTMLDivElement>(null)   // sticky content panel
  const [smoothProgress, setSmoothProgress] = useState(0)
  
  const targetProgressRef = useRef(0)
  const currentProgressRef = useRef(0)
  const isRunningRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const triggerRef = useRef<ScrollTrigger | null>(null)

  // Physics animation update logic using a responsive LERP (0.12 factor)
  const updatePhysics = useCallback(() => {
    const diff = targetProgressRef.current - currentProgressRef.current
    if (Math.abs(diff) < 0.0002) {
      currentProgressRef.current = targetProgressRef.current
      setSmoothProgress(currentProgressRef.current)
      isRunningRef.current = false
      return
    }

    currentProgressRef.current += diff * 0.12
    setSmoothProgress(currentProgressRef.current)
    rafRef.current = requestAnimationFrame(updatePhysics)
  }, [])

  // Use ScrollTrigger to calculate progress reliably across all browsers/layouts
  useEffect(() => {
    if (!outerRef.current) return

    gsap.registerPlugin(ScrollTrigger)

    const trigger = ScrollTrigger.create({
      trigger: outerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        targetProgressRef.current = self.progress
        if (!isRunningRef.current) {
          isRunningRef.current = true
          rafRef.current = requestAnimationFrame(updatePhysics)
        }
      }
    })

    triggerRef.current = trigger

    return () => {
      trigger.kill()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [updatePhysics])

  // Derive active stage from smoothProgress
  const activeStage = Math.min(Math.floor(smoothProgress * 3), 2)
  const stageProgress = Math.min(smoothProgress * 3 - activeStage, 1)
  
  const activeData = INSIGHT_STAGES[activeStage]

  // Interactive tab click handler - scrolls cleanly to stage height using ScrollTrigger positions
  const scrollToStage = (stageIndex: number) => {
    const trigger = triggerRef.current
    if (!trigger) return

    const start = trigger.start
    const end = trigger.end

    // Map stages to distinct target progress points in scroll area (safely within the pinned range)
    const targetP = stageIndex === 0 ? 0.16 : stageIndex === 1 ? 0.5 : 0.84
    const targetScroll = start + targetP * (end - start)

    // Animate scroll smoothly using GSAP to bypass browser/custom scroll conflicts
    const scrollObj = { y: window.scrollY }
    gsap.to(scrollObj, {
      y: targetScroll,
      duration: 0.85,
      ease: 'power3.out',
      onUpdate: () => {
        window.scrollTo(0, scrollObj.y)
      }
    })
  }

  return (
    /* Outer: gives 4 "screens" of scroll space for slow smooth transitions */
    <div ref={outerRef} style={{ height: '400vh', position: 'relative' }}>
      {/* Inner: sticks to viewport top as we scroll */}
      <div
        ref={innerRef}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          background: '#060A0F',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient matching stage color */}
        <div
          className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${activeData.color}06 0%, transparent 70%)`,
          }}
        />

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-10 h-full flex flex-col gap-6" style={{ zIndex: 10 }}>
          {/* Header, progress and tabs grouped together for perfect spacing control */}
          <div className="flex flex-col gap-6 text-center">
            {/* Section header */}
            <div className="pt-2">
              <p className="text-xs font-mono tracking-[0.2em] uppercase mb-2" style={{ color: '#5B8DEF' }}>
                How it works
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] leading-[1.1]" style={{ color: '#E2E8F0' }}>
                Three steps to clarity
              </h2>
              <p className="mt-3 text-sm md:text-base max-w-lg mx-auto" style={{ color: '#6B7A99' }}>
                A complete intelligence pipeline from ingestion to action — automated and observable.
              </p>
            </div>

            {/* Continuous premium timeline progress bar */}
            <div className="relative max-w-md mx-auto w-full h-8 flex items-center px-2 select-none pointer-events-none">
              {/* The background track */}
              <div className="absolute left-2 right-2 h-[2px]" style={{ background: '#1A2235' }} />
              
              {/* The filled progress track */}
              <div
                className="absolute left-2 h-[2px]"
                style={{
                  width: `calc(${smoothProgress * 100}% - ${smoothProgress * 8}px)`,
                  background: `linear-gradient(90deg, #5B8DEF 0%, ${activeData.color} 100%)`,
                  boxShadow: `0 0 10px ${activeData.color}50`,
                }}
              />

              {/* Timeline nodes */}
              <div className="absolute left-2 right-2 flex justify-between w-[calc(100%-16px)] mx-auto">
                {INSIGHT_STAGES.map((stage, i) => {
                  const active = activeStage >= i
                  return (
                    <div
                      key={stage.id}
                      className="w-4 h-4 rounded-full border-2 transition-all duration-300 flex items-center justify-center"
                      style={{
                        background: activeStage === i ? '#060A0F' : active ? stage.color : '#060A0F',
                        borderColor: active ? stage.color : '#1A2235',
                        boxShadow: activeStage === i ? `0 0 12px ${stage.color}` : 'none',
                        transform: activeStage === i ? 'scale(1.15)' : 'none',
                        zIndex: 10,
                      }}
                    >
                      {activeStage === i && (
                        <motion.div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: stage.color }}
                          layoutId="activeProgressDot"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Stage tabs - fully interactive */}
            <div className="flex justify-center gap-2 flex-wrap">
              {INSIGHT_STAGES.map((stage, i) => (
                <button
                  key={stage.id}
                  onClick={() => scrollToStage(i)}
                  className="relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer outline-none select-none hover:bg-[#111927]"
                  style={{
                    color: activeStage === i ? stage.color : '#4A5B7C',
                    background: activeStage === i ? `${stage.color}10` : 'transparent',
                    border: `1px solid ${activeStage === i ? stage.color + '30' : '#1A2235'}`,
                    boxShadow: activeStage === i ? `0 0 20px ${stage.color}10` : 'none',
                    zIndex: 20,
                  }}
                >
                  <span className="font-mono text-xs mr-2 opacity-50">{stage.tag}</span>
                  {stage.label}
                  {activeStage === i && (
                    <motion.div
                      className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                      style={{ background: stage.color }}
                      layoutId="insightUnderline"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 grid md:grid-cols-2 gap-8 items-center min-h-0">
            {/* Left: Animated SVG visual (Seamless dynamic crossfade layers) */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square flex items-center justify-center">
                {/* Dynamic radial glow halo backing the visual */}
                <div
                  className="absolute inset-0 rounded-full transition-all duration-500 blur-[80px] opacity-15 pointer-events-none"
                  style={{
                    background: activeData.color,
                  }}
                />

                <div className="w-full h-full relative">
                  {STAGE_VISUALS.map((Visual, idx) => {
                    const opacity = getStageOpacity(idx, smoothProgress)
                    const scale = 0.92 + opacity * 0.08
                    const progressForStage = idx === 0 
                      ? Math.min(smoothProgress * 3, 1)
                      : idx === 1 
                        ? Math.max(0, Math.min((smoothProgress - 0.33) * 3, 1))
                        : Math.max(0, Math.min((smoothProgress - 0.66) * 3, 1))
                    
                    return (
                      <div
                        key={idx}
                        className="absolute inset-0 flex items-center justify-center transition-all duration-200"
                        style={{
                          opacity: opacity,
                          transform: `scale(${scale})`,
                          pointerEvents: opacity > 0.15 ? 'auto' : 'none',
                          willChange: 'transform, opacity',
                        }}
                      >
                        <Visual progress={progressForStage} />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right: Stage info (popLayout transition for parallel fade & shift) */}
            <div className="relative min-h-[320px] flex flex-col justify-center overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={activeStage}
                  initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="flex flex-col justify-center"
                >
                  <p className="font-mono text-xs tracking-[0.15em] uppercase mb-3" style={{ color: activeData.color }}>
                    Step {activeData.tag}
                  </p>
                  <h3 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] mb-4" style={{ color: '#E2E8F0' }}>
                    {activeData.headline}
                  </h3>
                  <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: '#6B7A99' }}>
                    {activeData.desc}
                  </p>
                  <ul className="space-y-3">
                    {activeData.details.map((detail, i) => (
                      <motion.li
                        key={detail}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.04, duration: 0.3 }}
                        className="flex items-center gap-3 text-sm"
                        style={{ color: '#8892A4' }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: activeData.color, boxShadow: `0 0 6px ${activeData.color}50` }}
                        />
                        {detail}
                      </motion.li>
                    ))}
                  </ul>

                  {/* Stage metric */}
                  <div
                    className="mt-6 inline-flex items-center gap-4 px-5 py-2.5 rounded-xl border w-fit"
                    style={{
                      background: `${activeData.color}06`,
                      borderColor: `${activeData.color}15`,
                    }}
                  >
                    <div className="font-mono text-xl md:text-2xl font-semibold" style={{ color: activeData.color }}>
                      {activeStage === 0 ? '24' : activeStage === 1 ? '94.2%' : '1,284'}
                    </div>
                    <div className="text-xs" style={{ color: '#6B7A99' }}>
                      {activeStage === 0 ? 'Sources connected' : activeStage === 1 ? 'Avg confidence' : 'Insights generated'}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="text-center pb-2">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase" style={{ color: '#3E4A63' }}>
              {activeStage < 2 ? 'Keep scrolling' : 'Continue →'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
