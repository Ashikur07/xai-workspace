'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useTransform, useScroll } from 'framer-motion'
import { INSIGHT_STAGES } from '@/lib/data'
import { easings, colors } from '@/lib/constants'
import { useIsExport } from '@/hooks/useIsExport'

/* ═══════════════════════════════════════════════════════════════
   Animated SVG visuals for each stage
   ═══════════════════════════════════════════════════════════════ */

function IngestVisual({ progress }: { progress: number }) {
  return (
    <svg viewBox="0 0 320 320" className="w-full h-full" fill="none">
      <defs>
        {/* Continuous animation styling */}
        <style>{`
          @keyframes spin-clockwise {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes spin-counterclockwise {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          .spin-clockwise {
            transform-origin: 160px 160px;
            animation: spin-clockwise 20s linear infinite;
          }
          .spin-counterclockwise {
            transform-origin: 160px 160px;
            animation: spin-counterclockwise 25s linear infinite;
          }
        `}</style>
        {/* Glowing gradients */}
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5B8DEF" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#5B8DEF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#5B8DEF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="streamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5B8DEF" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#5B8DEF" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5B8DEF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#34D399" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Outer concentric tech rings with continuous spinning */}
      <circle cx={160} cy={160} r={140} stroke="#1A2235" strokeWidth="1" strokeDasharray="4 8" />
      <circle cx={160} cy={160} r={110} stroke="#1A2235" strokeWidth="0.75" />
      <circle cx={160} cy={160} r={80} stroke="url(#ringGrad)" strokeWidth="0.5" strokeDasharray="30 180" opacity={0.6} className="spin-clockwise" />

      {/* Grid lines background */}
      <line x1={20} y1={160} x2={300} y2={160} stroke="#1A2235" strokeWidth="0.5" opacity={0.3} />
      <line x1={160} y1={20} x2={160} y2={300} stroke="#1A2235" strokeWidth="0.5" opacity={0.3} />

      {/* Radial glow in center */}
      <circle cx={160} cy={160} r={60 + progress * 20} fill="url(#centerGlow)" />

      {/* Data stream lines flowing inward */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const r = 135
        const x1 = 160 + r * Math.cos(angle)
        const y1 = 160 + r * Math.sin(angle)
        const dashOffset = 240 - progress * 240
        return (
          <g key={i}>
            <line
              x1={x1} y1={y1} x2={160} y2={160}
              stroke="url(#streamGrad)"
              strokeWidth="1.5"
              strokeDasharray="8 12"
              strokeDashoffset={dashOffset}
              opacity={0.2 + progress * 0.6}
            />
            {/* Flowing particle along line - native infinite loop animation */}
            {progress > 0.1 && (
              <circle cx={x1} cy={y1} r="3" fill="#5B8DEF" style={{ filter: 'drop-shadow(0 0 4px #5B8DEF)' }}>
                <animate
                  attributeName="cx"
                  from={x1}
                  to={160}
                  dur={`${1.2 + (i % 3) * 0.3}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cy"
                  from={y1}
                  to={160}
                  dur={`${1.2 + (i % 3) * 0.3}s`}
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        )
      })}

      {/* Core receiver shape (futuristic hollow core with glowing orbits) */}
      <circle cx={160} cy={160} r={24} fill="#0C1118" stroke="#5B8DEF" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 8px rgba(91,141,239,0.3))' }} />
      <circle cx={160} cy={160} r={16} fill="#111820" stroke="#A78BFA" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx={160} cy={160} r={6} fill="#5B8DEF" />

      {/* Outer spinning nodes group */}
      <g className="spin-clockwise" opacity={0.3 + progress * 0.7}>
        {Array.from({ length: 4 }).map((_, i) => {
          const angle = (i / 4) * Math.PI * 2
          const r = 110
          const x = 160 + r * Math.cos(angle)
          const y = 160 + r * Math.sin(angle)
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="5" fill="#0C1118" stroke="#5B8DEF" strokeWidth="1.5" />
              <circle cx={x} cy={y} r="2" fill="#5B8DEF" />
            </g>
          )
        })}
      </g>

      {/* Data source labels inside high-tech badges */}
      {['JSON', 'SQL', 'CSV', 'API'].map((label, i) => {
        const angle = (i / 4) * Math.PI * 2 - Math.PI / 4
        const r = 135
        const x = 160 + r * Math.cos(angle)
        const y = 160 + r * Math.sin(angle)
        return (
          <g key={label} opacity={progress > 0.3 ? Math.min((progress - 0.3) * 3, 1) : 0}>
            {/* Tech tag frame */}
            <rect
              x={x - 22} y={y - 10} width={44} height={20} rx={4}
              fill="#0C1118" stroke="#5B8DEF" strokeWidth="1"
              style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}
            />
            <text
              x={x} y={y + 1}
              textAnchor="middle" dominantBaseline="middle"
              fill="#E2E8F0" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono, monospace"
            >
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function AnalyzeVisual({ progress }: { progress: number }) {
  return (
    <svg viewBox="0 0 320 320" className="w-full h-full" fill="none">
      <defs>
        {/* Continuous animation styling */}
        <style>{`
          @keyframes spin-clockwise {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes spin-counterclockwise {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          .spin-radar-slow {
            transform-origin: 160px 160px;
            animation: spin-clockwise 10s linear infinite;
          }
          .spin-radar-reverse {
            transform-origin: 160px 160px;
            animation: spin-counterclockwise 12s linear infinite;
          }
        `}</style>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="netGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5B8DEF" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#34D399" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Grid structure */}
      <circle cx={160} cy={160} r={130} stroke="#1A2235" strokeWidth="0.5" opacity={0.4} />
      <circle cx={160} cy={160} r={95} stroke="#1A2235" strokeWidth="0.5" opacity={0.4} />

      {/* Scanning Radar Lines - continuous spin */}
      <circle
        cx={160} cy={160} r={115}
        stroke="#A78BFA" strokeWidth="1"
        strokeDasharray="8 12"
        fill="none"
        opacity={0.3}
        className="spin-radar-slow"
      />
      <circle
        cx={160} cy={160} r={75}
        stroke="#A78BFA" strokeWidth="0.5"
        strokeDasharray="40 10"
        fill="none"
        opacity={0.2}
        className="spin-radar-reverse"
      />

      {/* Scanning sweep line - continuous rotation sweep */}
      {progress > 0 && (
        <g className="spin-radar-slow" style={{ opacity: Math.min(progress * 1.5, 0.4) }}>
          <line
            x1={160} y1={160}
            x2={160} y2={45}
            stroke="#A78BFA"
            strokeWidth="1.5"
          />
        </g>
      )}

      {/* Neural network nodes & connections */}
      {Array.from({ length: 3 }).map((_, layer) =>
        Array.from({ length: 4 }).map((_, node) => {
          const x = 70 + layer * 90
          const y = 90 + node * 46
          return (
            <g key={`conn-${layer}-${node}`}>
              {layer < 2 && Array.from({ length: 4 }).map((_, nextNode) => {
                const x2 = 70 + (layer + 1) * 90
                const y2 = 90 + nextNode * 46
                const lineProgress = Math.max(0, Math.min((progress - layer * 0.25 - 0.1) * 3, 1))
                return (
                  <g key={nextNode}>
                    <line
                      x1={x} y1={y} x2={x + (x2 - x) * lineProgress} y2={y + (y2 - y) * lineProgress}
                      stroke="url(#netGrad)"
                      strokeWidth="1"
                      opacity={0.25 * lineProgress}
                    />
                    {/* Active data packet flow - native loop animations along line */}
                    {progress > 0.2 && (
                      <circle cx={x} cy={y} r="2" fill="#A78BFA" opacity={lineProgress * 0.8}>
                        <animate
                          attributeName="cx"
                          from={x}
                          to={x2}
                          dur={`${1.5 + node * 0.2}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="cy"
                          from={y}
                          to={y2}
                          dur={`${1.5 + node * 0.2}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                )
              })}
            </g>
          )
        })
      )}

      {/* Draw Nodes */}
      {Array.from({ length: 3 }).map((_, layer) =>
        Array.from({ length: 4 }).map((_, node) => {
          const x = 70 + layer * 90
          const y = 90 + node * 46
          const nodeProgress = Math.max(0, Math.min((progress - layer * 0.2) * 3, 1))
          return (
            <g key={`node-${layer}-${node}`} opacity={nodeProgress}>
              <circle cx={x} cy={y} r={14} fill="url(#nodeGlow)" />
              <circle cx={x} cy={y} r={6} fill="#0C1118" stroke="#A78BFA" strokeWidth="1.5" />
              <circle cx={x} cy={y} r={2} fill="#A78BFA" />
            </g>
          )
        })
      )}

      {/* Confidence indicator / telemetry overlay */}
      <g opacity={progress > 0.4 ? (progress - 0.4) * 1.6 : 0}>
        <rect x={100} y={262} width={120} height={20} rx={4} fill="#0C1118" stroke="#A78BFA" strokeWidth="0.75" opacity={0.8} />
        <text
          x={160} y={273}
          textAnchor="middle" fill="#A78BFA"
          fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono, monospace"
        >
          {`NEURAL CONF: ${Math.round(progress * 94.2)}%`}
        </text>
      </g>
    </svg>
  )
}

function InsightVisual({ progress }: { progress: number }) {
  const chartHeight = (h: number, progressVal: number) => {
    const barProgress = Math.max(0, Math.min((progressVal - 0.1) * 2.0, 1))
    return h * 1.5 * barProgress
  }

  return (
    <svg viewBox="0 0 320 320" className="w-full h-full" fill="none">
      <defs>
        {/* Bar Gradient */}
        <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="mutedBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5B8DEF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#1A2235" stopOpacity="0.1" />
        </linearGradient>
        {/* Trend Area Gradient */}
        <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines background */}
      <line x1={50} y1={100} x2={270} y2={100} stroke="#1A2235" strokeWidth="0.5" />
      <line x1={50} y1={150} x2={270} y2={150} stroke="#1A2235" strokeWidth="0.5" />
      <line x1={50} y1={200} x2={270} y2={200} stroke="#1A2235" strokeWidth="0.5" />
      <line x1={50} y1={250} x2={270} y2={250} stroke="#1A2235" strokeWidth="1" />

      {/* Chart bars growing */}
      {[40, 65, 50, 82, 70, 95, 60, 88].map((h, i) => {
        const height = chartHeight(h, progress)
        const x = 58 + i * 26
        const active = i === 7
        return (
          <g key={i}>
            <rect
              x={x} y={250 - height} width={16} height={height}
              rx={3}
              fill={active ? 'url(#barGrad)' : 'url(#mutedBarGrad)'}
              stroke={active ? '#34D399' : '#1D2A44'}
              strokeWidth={active ? 1.5 : 0.5}
            />
            {active && height > 0 && (
              <circle cx={x + 8} cy={250 - height} r="4" fill="#34D399" style={{ filter: 'drop-shadow(0 0 6px #34D399)' }} />
            )}
          </g>
        )
      })}

      {/* Area Chart Backdrop */}
      {progress > 0.4 && (
        <path
          d={`M 66 ${250 - chartHeight(40, progress)} 
              L 92 ${250 - chartHeight(65, progress)}
              L 118 ${250 - chartHeight(50, progress)}
              L 144 ${250 - chartHeight(82, progress)}
              L 170 ${250 - chartHeight(70, progress)}
              L 196 ${250 - chartHeight(95, progress)}
              L 222 ${250 - chartHeight(60, progress)}
              L 248 ${250 - chartHeight(88, progress)}
              L 248 250 L 66 250 Z`}
          fill="url(#areaGrad)"
          opacity={(progress - 0.4) * 1.6}
        />
      )}

      {/* Trend line */}
      <path
        d={`M 66 ${250 - chartHeight(40, progress)} 
            L 92 ${250 - chartHeight(65, progress)}
            L 118 ${250 - chartHeight(50, progress)}
            L 144 ${250 - chartHeight(82, progress)}
            L 170 ${250 - chartHeight(70, progress)}
            L 196 ${250 - chartHeight(95, progress)}
            L 222 ${250 - chartHeight(60, progress)}
            L 248 ${250 - chartHeight(88, progress)}`}
        stroke="#34D399"
        strokeWidth="2.5"
        fill="none"
        opacity={progress > 0.4 ? Math.min((progress - 0.4) * 1.6, 1) : 0}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 2px 8px rgba(52,211,153,0.4))' }}
      />

      {/* Insight badges appearing */}
      {progress > 0.6 && (
        <g opacity={Math.min((progress - 0.6) * 4, 1)}>
          {/* Glass tag 1 */}
          <rect x={54} y={45} width={96} height={24} rx={6} fill="#0C1118" stroke="#34D399" strokeWidth="0.75" />
          <circle cx={64} cy={57} r="3" fill="#34D399" />
          <text x={104} y={60} textAnchor="middle" fill="#34D399" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
            +22% REVENUE
          </text>
        </g>
      )}
      {progress > 0.75 && (
        <g opacity={Math.min((progress - 0.75) * 4, 1)}>
          {/* Glass tag 2 */}
          <rect x={166} y={35} width={100} height={24} rx={6} fill="#0C1118" stroke="#5B8DEF" strokeWidth="0.75" />
          <circle cx={176} cy={47} r="3" fill="#5B8DEF" />
          <text x={220} y={50} textAnchor="middle" fill="#5B8DEF" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
            3 ANOMALIES
          </text>
        </g>
      )}
    </svg>
  )
}

const STAGE_VISUALS = [IngestVisual, AnalyzeVisual, InsightVisual]

const rowVariants = {
  hidden: {},
  active: {
    transition: { staggerChildren: 0.15 }
  }
}

const cardVariants = {
  hidden: { opacity: 0.25, y: 30, filter: 'blur(3px)' },
  active: (isExport: boolean) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: isExport ? { duration: 0 } : { duration: 0.6, ease: easings.smooth }
  })
}

const visualVariants = {
  hidden: { opacity: 0.15, scale: 0.95, filter: 'blur(4px)' },
  active: (isExport: boolean) => ({
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: isExport ? { duration: 0 } : { duration: 0.8, ease: easings.smooth }
  })
}

const nodeVariants = {
  hidden: { scale: 0.8, backgroundColor: '#060A0F', borderColor: '#1A2235', boxShadow: 'none' },
  active: (color: string) => ({
    scale: 1.15,
    backgroundColor: '#060A0F',
    borderColor: color,
    boxShadow: `0 0 16px ${color}80, inset 0 0 8px ${color}30`,
    transition: { duration: 0.5 }
  })
}

export default function InsightFlow() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isExportMode = useIsExport()

  // Track scroll progress of the container relative to the viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // Transform scroll progress to height for the glowing timeline line
  const glowingLineHeight = useTransform(scrollYProgress, [0.15, 0.85], ['0%', '100%'])

  return (
    <section ref={containerRef} className="relative py-32 px-6 overflow-hidden bg-bg">
      {/* Background radial glow */}
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-24">
          <p className="text-xs font-mono tracking-[0.2em] uppercase mb-4" style={{ color: '#5B8DEF' }}>
            How it works
          </p>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.1] text-text">
            Three steps to clarity
          </h2>
          <p className="mt-5 text-base md:text-lg max-w-lg mx-auto leading-relaxed text-dim">
            A complete intelligence pipeline from ingestion to action — automated and observable.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative flex flex-col gap-24 md:gap-36">
          
          {/* Vertical Timeline Axis Line */}
          <div className="absolute left-[24px] md:left-1/2 top-4 bottom-4 w-px bg-border -translate-x-1/2 z-0">
            {/* Dynamic Glowing Line Progress */}
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-accent via-purple to-green"
              style={{
                height: isExportMode ? '100%' : glowingLineHeight,
                boxShadow: `0 0 12px ${colors.accent}40`,
                transformOrigin: 'top',
              }}
            />
          </div>

          {/* Alternating Zigzag Steps */}
          {INSIGHT_STAGES.map((stage, idx) => {
            const Visual = STAGE_VISUALS[idx]
            return (
              <motion.div
                key={stage.id}
                variants={rowVariants}
                initial="hidden"
                whileInView="active"
                viewport={isExportMode ? undefined : { once: false, margin: '-20%' }}
                className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center relative w-full"
              >
                {/* Timeline Center Node */}
                <div className="absolute left-[24px] md:left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
                  <motion.div
                    custom={stage.color}
                    variants={nodeVariants}
                    className="w-10 h-10 rounded-full border-[3px] flex items-center justify-center font-mono text-xs font-semibold bg-bg"
                    style={{
                      color: stage.color,
                    }}
                  >
                    {stage.tag}
                  </motion.div>
                </div>

                {/* Left Side (Desktop: alternates Card or Visual | Mobile: Visual on top) */}
                <motion.div
                  variants={visualVariants}
                  custom={isExportMode}
                  className={`pl-16 md:pl-0 flex items-center justify-center order-1 ${
                    idx % 2 === 0 ? 'md:order-2' : 'md:order-1'
                  }`}
                >
                  <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square flex items-center justify-center">
                    {/* Glowing background halo backing the visual */}
                    <div
                      className="absolute inset-0 rounded-full blur-[80px] opacity-10 pointer-events-none transition-all duration-700"
                      style={{
                        background: stage.color,
                      }}
                    />
                    <div className="w-full h-full relative flex items-center justify-center">
                      <Visual progress={1.0} />
                    </div>
                  </div>
                </motion.div>

                {/* Right Side (Desktop: alternates Card or Visual | Mobile: Card on bottom) */}
                <motion.div
                  variants={cardVariants}
                  custom={isExportMode}
                  className={`pl-16 md:pl-0 flex flex-col justify-center order-2 ${
                    idx % 2 === 0 ? 'md:order-1 md:text-right md:items-end' : 'md:order-2 md:text-left md:items-start'
                  }`}
                >
                  <p className="font-mono text-xs tracking-[0.15em] uppercase mb-3" style={{ color: stage.color }}>
                    Step {stage.tag}
                  </p>
                  <h3 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] mb-4 text-text">
                    {stage.headline}
                  </h3>
                  <p className="text-sm md:text-base leading-relaxed mb-6 text-dim">
                    {stage.desc}
                  </p>

                  <ul className={`space-y-3 mb-6 flex flex-col ${idx % 2 === 0 ? 'md:items-end' : 'md:items-start'}`}>
                    {stage.details.map((detail) => (
                      <li
                        key={detail}
                        className={`flex items-center gap-3 text-sm text-[#8892A4] ${
                          idx % 2 === 0 ? 'md:flex-row-reverse' : ''
                        }`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: stage.color, boxShadow: `0 0 6px ${stage.color}50` }}
                        />
                        {detail}
                      </li>
                    ))}
                  </ul>

                  {/* Stage metric */}
                  <div
                    className="inline-flex items-center gap-4 px-5 py-2.5 rounded-xl border w-fit"
                    style={{
                      background: `${stage.color}06`,
                      borderColor: `${stage.color}15`,
                    }}
                  >
                    <div className="font-mono text-xl md:text-2xl font-semibold" style={{ color: stage.color }}>
                      {idx === 0 ? '24' : idx === 1 ? '94.2%' : '1,284'}
                    </div>
                    <div className="text-xs text-dim">
                      {idx === 0 ? 'Sources connected' : idx === 1 ? 'Avg confidence' : 'Insights generated'}
                    </div>
                  </div>
                </motion.div>

              </motion.div>
            )
          })}

        </div>
      </div>
    </section>
  )
}
