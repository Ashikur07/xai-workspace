'use client'
import { useEffect, useRef, useState, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DashboardAnimContext = createContext(true)
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  BarChart2, Bell, ChevronDown, Database, Home, Layers, Settings, Zap,
  Search, Plus, ArrowUpRight, ArrowDownRight, TrendingUp, CheckCircle2,
  XCircle, Clock, Filter, RefreshCw, Activity, Cpu,
} from 'lucide-react'
import {
  CHART_DATA, TABLE_ROWS, SIGNALS, AUTOMATIONS, NAV_ITEMS,
  VIEW_METRICS, VIEW_TITLES,
  INSIGHTS_FEED, ANALYTICS_BREAKDOWN, PERFORMANCE_DATA, PIPELINE_STAGES, PIPELINE_RUNS,
} from '@/lib/data'
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter'
import Card from '@/components/ui/Card'
import SectionHeader from '@/components/ui/SectionHeader'
import { easings, colors } from '@/lib/constants'
import SourcesTable from '@/components/ui/SourcesTable'
import { useIsExport } from '@/hooks/useIsExport'

const ICON_MAP: Record<string, React.ReactNode> = {
  home:     <Home size={14} />,
  zap:      <Zap size={14} />,
  database: <Database size={14} />,
  barchart: <BarChart2 size={14} />,
  layers:   <Layers size={14} />,
}

/* ── Sparkline ── */
function Sparkline({ data, color, height = 24 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 60
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={height} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity={0.15} />
    </svg>
  )
}

/* ── Dynamic Metric Card ── */
function MetricCard({
  metric, visible, index,
}: {
  metric: { label: string; value: number; delta: string; up: boolean; decimals?: number; suffix?: string }
  visible: boolean
  index: number
}) {
  const isScrollingDown = useContext(DashboardAnimContext)
  const animatedValue = useAnimatedCounter(metric.value, visible, {
    duration: isScrollingDown ? (1800 + index * 150) : 0,
    decimals: metric.decimals ?? 0,
    suffix: metric.suffix ?? '',
    separator: ',',
  })
  const sparkData = [30, 45, 38, 52, 48, 65, 58, 72, 68, 80, 75, metric.value]
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ delay: isScrollingDown ? (0.2 + index * 0.08) : 0, duration: isScrollingDown ? 0.5 : 0, ease: easings.smooth }}
    >
      <Card glass padding="md" className="cursor-default group">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs text-dim">{metric.label}</p>
          <Sparkline data={sparkData} color={metric.up ? colors.green : colors.red} />
        </div>
        <p className="text-2xl font-semibold font-mono tracking-tight text-text">
          {animatedValue}
        </p>
        <div className="flex items-center gap-1 mt-1.5">
          {metric.up
            ? <ArrowUpRight size={12} className="text-green" />
            : <ArrowDownRight size={12} className="text-red" />
          }
          <p className="text-xs font-mono text-green" style={{ color: metric.up ? colors.green : colors.red }}>
            {metric.delta}
          </p>
        </div>
      </Card>
    </motion.div>
  )
}

/* ── 0: Overview ── */
function OverviewView({ visible }: { visible: boolean }) {
  const isScrollingDown = useContext(DashboardAnimContext)
  const [hoverBar, setHoverBar] = useState<number | null>(null)
  return (
    <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
      <Card glass padding="md" hover={false} className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-dim">Insight Volume</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-xl font-semibold font-mono text-text">38,204</p>
              <span className="flex items-center gap-0.5 text-xs font-mono text-green">
                <TrendingUp size={10} /> +22%
              </span>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-dim">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" />Insights</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple" />Signals</span>
          </div>
        </div>
        <div className="flex items-end gap-1.5 h-28">
          {CHART_DATA.map((bar, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t cursor-pointer"
              style={{
                height: `${bar.value}%`,
                background: hoverBar === i ? colors.accent : i === CHART_DATA.length - 1 ? colors.accent : colors.border,
                transformOrigin: 'bottom',
                boxShadow: (hoverBar === i || i === CHART_DATA.length - 1) ? '0 0 12px rgba(91,141,239,0.3)' : 'none',
              }}
              initial={{ scaleY: 0 }}
              animate={visible ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ delay: isScrollingDown ? (0.4 + i * 0.04) : 0, duration: isScrollingDown ? 0.6 : 0, ease: easings.bounce }}
              onHoverStart={() => setHoverBar(i)}
              onHoverEnd={() => setHoverBar(null)}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] mt-2 font-mono text-muted">
          {CHART_DATA.map(d => <span key={d.month}>{d.month}</span>)}
        </div>
      </Card>
      <Card glass padding="sm" hover={false}>
        <div className="flex items-center justify-between px-3 py-3 border-b border-border">
          <p className="text-sm font-medium text-text">Connected Sources</p>
          <p className="text-xs font-mono text-muted">{TABLE_ROWS.length} sources</p>
        </div>
        <SourcesTable visible={visible} />
      </Card>
    </motion.div>
  )
}

/* â”€â”€ 1: Insights â”€â”€ */
function InsightsView({ visible }: { visible: boolean }) {
  const isScrollingDown = useContext(DashboardAnimContext)
  const severityColor: Record<string, string> = {
    critical: '#F87171', high: '#FBBF24', medium: '#5B8DEF', low: '#6B7A99',
  }
  const severityBg: Record<string, string> = {
    critical: '#F8717115', high: '#FBBF2415', medium: '#5B8DEF15', low: '#6B7A9915',
  }
  return (
    <motion.div key="insights-view" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-2">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border" style={{ color: '#6B7A99', borderColor: '#1A2235', background: '#0A0F16' }}>
          <Filter size={11} /> All Categories
        </button>
        {(['critical', 'high', 'medium'] as const).map(s => (
          <button key={s} className="text-xs px-3 py-1.5 rounded-lg border capitalize"
            style={{ color: severityColor[s], borderColor: `${severityColor[s]}30`, background: severityBg[s] }}>
            {s}
          </button>
        ))}
        <button className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border" style={{ color: '#6B7A99', borderColor: '#1A2235', background: '#0A0F16' }}>
          <RefreshCw size={11} /> Refresh
        </button>
      </div>
      {INSIGHTS_FEED.map((item, i) => (
        <motion.div
          key={item.title}
          className="flex items-center gap-4 rounded-xl border p-4 cursor-pointer"
          style={{ background: '#0A0F16', borderColor: '#1A2235' }}
          initial={{ opacity: 0, x: -12 }}
          animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
          transition={{ delay: isScrollingDown ? (i * 0.07) : 0, duration: isScrollingDown ? 0.3 : 0 }}
          whileHover={{ x: 4, borderColor: '#253350' }}
        >
          <motion.span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: severityColor[item.severity] }}
            animate={item.severity === 'critical' ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate" style={{ color: '#E2E8F0' }}>{item.title}</p>
            <p className="text-xs mt-0.5" style={{ color: '#3E4A63' }}>{item.category} · {item.time}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 w-28">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#1A2235' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: item.color }}
                initial={{ width: 0 }}
                animate={visible ? { width: `${item.confidence}%` } : { width: 0 }}
                transition={{ duration: isScrollingDown ? 1 : 0, delay: isScrollingDown ? (0.3 + i * 0.05) : 0 }}
              />
            </div>
            <span className="text-xs font-mono w-8 text-right" style={{ color: '#6B7A99' }}>{item.confidence}%</span>
          </div>
          <span
            className="text-xs font-mono px-2.5 py-1 rounded-md border capitalize flex-shrink-0"
            style={{ color: severityColor[item.severity], borderColor: `${severityColor[item.severity]}30`, background: severityBg[item.severity] }}
          >
            {item.severity}
          </span>
        </motion.div>
      ))}
    </motion.div>
  )
}

/* ── 2: Sources ── */
function SourcesView({ visible }: { visible: boolean }) {
  return (
    <motion.div key="sources-view" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { label: 'Active', count: 18, color: colors.green },
          { label: 'Syncing', count: 3, color: colors.yellow },
          { label: 'Paused', count: 3, color: colors.muted },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-[#0A0F16]">
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            <span className="text-xs font-mono text-dim">{s.label}</span>
            <span className="text-xs font-semibold font-mono" style={{ color: s.color }}>{s.count}</span>
          </div>
        ))}
        <motion.button
          className="ml-auto flex items-center gap-1.5 text-xs text-white px-3.5 py-1.5 rounded-lg font-medium bg-accent outline-none focus-visible:ring-1 focus-visible:ring-accent"
          whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(91,141,239,0.3)' }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus size={12} /> Add Source
        </motion.button>
      </div>
      <Card glass padding="sm" hover={false}>
        <SourcesTable visible={visible} showAvatar={true} />
      </Card>
    </motion.div>
  )
}

/* ── 3: Analytics ── */
function AnalyticsView({ visible }: { visible: boolean }) {
  const isScrollingDown = useContext(DashboardAnimContext)
  const maxQ = Math.max(...PERFORMANCE_DATA.map(d => d.queries))
  return (
    <motion.div key="analytics-view" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Card glass padding="md" hover={false}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs" style={{ color: '#6B7A99' }}>Query Volume / 24h</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <p className="text-lg font-semibold font-mono" style={{ color: '#E2E8F0' }}>2,400</p>
                <span className="text-xs font-mono" style={{ color: '#34D399' }}>+340 /hr</span>
              </div>
            </div>
            <Activity size={14} style={{ color: '#5B8DEF' }} />
          </div>
          <div className="flex items-end gap-1 h-20">
            {PERFORMANCE_DATA.map((d, i) => (
              <motion.div
                key={d.hour}
                className="flex-1 rounded-t"
                style={{ height: `${(d.queries / maxQ) * 100}%`, background: '#5B8DEF', transformOrigin: 'bottom', opacity: 0.5 + (d.queries / maxQ) * 0.5 }}
                initial={{ scaleY: 0 }}
                animate={visible ? { scaleY: 1 } : { scaleY: 0 }}
                transition={{ delay: isScrollingDown ? (0.2 + i * 0.05) : 0, duration: isScrollingDown ? 0.5 : 0, ease: easings.bounce }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[9px] mt-1.5 font-mono" style={{ color: '#3E4A63' }}>
            {PERFORMANCE_DATA.map(d => <span key={d.hour}>{d.hour.split(':')[0]}h</span>)}
          </div>
        </Card>
        <Card glass padding="md" hover={false}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs" style={{ color: '#6B7A99' }}>Model Usage Breakdown</p>
            <Cpu size={14} style={{ color: '#A78BFA' }} />
          </div>
          <div className="space-y-2.5">
            {ANALYTICS_BREAKDOWN.map((item, i) => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs" style={{ color: '#8892A4' }}>{item.label}</span>
                  <span className="text-xs font-mono" style={{ color: item.color }}>{item.value}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1A2235' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                    initial={{ width: 0 }}
                    animate={visible ? { width: `${item.value}%` } : { width: 0 }}
                    transition={{ duration: isScrollingDown ? 1 : 0, delay: isScrollingDown ? (0.3 + i * 0.08) : 0 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card glass padding="sm" hover={false}>
        <div className="flex items-center justify-between px-3 py-3 border-b" style={{ borderColor: '#1A2235' }}>
          <p className="text-sm font-medium" style={{ color: '#E2E8F0' }}>Active Signals</p>
          <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ color: '#34D399', background: '#34D39915' }}>{SIGNALS.length} signals</span>
        </div>
        <div>
          {SIGNALS.map((s, i) => (
            <motion.div
              key={s.title}
              className="flex items-center gap-4 px-3 py-3 border-b cursor-pointer"
              style={{ borderColor: '#1A223540' }}
              initial={{ opacity: 0, x: -8 }}
              animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
              transition={{ delay: isScrollingDown ? (0.4 + i * 0.06) : 0, duration: isScrollingDown ? 0.3 : 0 }}
              whileHover={{ x: 3 }}
            >
              <motion.span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }}
                animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
              <span className="text-sm flex-1" style={{ color: '#E2E8F0' }}>{s.title}</span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md border"
                style={{ color: s.color, borderColor: `${s.color}30`, background: `${s.color}08` }}>{s.level}</span>
              <span className="text-xs font-mono" style={{ color: '#3E4A63' }}>{s.time}</span>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}

/* ── 4: Pipeline ── */
function PipelineView({ visible }: { visible: boolean }) {
  const isScrollingDown = useContext(DashboardAnimContext)
  return (
    <motion.div key="pipeline-view" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
      <Card glass padding="md" hover={false} className="mb-4">
        <p className="text-xs mb-4" style={{ color: '#6B7A99' }}>Active Pipeline Stages</p>
        <div className="space-y-3">
          {PIPELINE_STAGES.map((stage, i) => (
            <motion.div key={stage.name}
              initial={{ opacity: 0, x: -10 }}
              animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ delay: isScrollingDown ? (0.15 + i * 0.08) : 0, duration: isScrollingDown ? 0.4 : 0 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs w-28 flex-shrink-0" style={{ color: '#8892A4' }}>{stage.name}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#1A2235' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: stage.color, boxShadow: stage.status === 'running' ? `0 0 8px ${stage.color}60` : 'none' }}
                    initial={{ width: 0 }}
                    animate={visible ? { width: `${stage.progress}%` } : { width: 0 }}
                    transition={{ duration: isScrollingDown ? 1.2 : 0, delay: isScrollingDown ? (0.3 + i * 0.1) : 0 }}
                  />
                </div>
                <span className="text-xs font-mono w-9 text-right" style={{ color: stage.color }}>
                  {stage.progress ? `${stage.progress}%` : '—'}
                </span>
                <span className="text-xs font-mono w-20 text-right hidden sm:block" style={{ color: '#3E4A63' }}>{stage.throughput}</span>
                <div className="flex items-center gap-1.5">
                  {stage.status === 'running'
                    ? <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full" style={{ background: stage.color }} />
                    : <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#3E4A63' }} />
                  }
                  <span className="text-[10px] font-mono capitalize" style={{ color: stage.status === 'running' ? stage.color : '#3E4A63' }}>
                    {stage.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card glass padding="sm" hover={false}>
          <div className="flex items-center justify-between px-3 py-3 border-b" style={{ borderColor: '#1A2235' }}>
            <p className="text-sm font-medium" style={{ color: '#E2E8F0' }}>Automations</p>
            <span className="text-xs font-mono" style={{ color: '#5B8DEF' }}>3 active</span>
          </div>
          {AUTOMATIONS.map((a, i) => (
            <motion.div key={a.name}
              className="flex items-center gap-3 px-3 py-2.5 border-b"
              style={{ borderColor: '#1A223540' }}
              initial={{ opacity: 0 }}
              animate={visible ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: isScrollingDown ? (0.3 + i * 0.06) : 0, duration: isScrollingDown ? 0.3 : 0 }}
            >
              <Zap size={12} style={{ color: a.enabled ? '#5B8DEF' : '#3E4A63', flexShrink: 0 }} />
              <span className="text-xs flex-1 truncate" style={{ color: '#E2E8F0' }}>{a.name}</span>
              <div className="w-8 h-4 rounded-full relative flex-shrink-0 cursor-pointer" style={{ background: a.enabled ? '#5B8DEF' : '#1A2235' }}>
                <div className="absolute top-[3px] w-2.5 h-2.5 rounded-full transition-all duration-200"
                  style={{ background: '#E2E8F0', left: a.enabled ? '17px' : '3px' }} />
              </div>
            </motion.div>
          ))}
        </Card>
        <Card glass padding="sm" hover={false}>
          <div className="flex items-center justify-between px-3 py-3 border-b" style={{ borderColor: '#1A2235' }}>
            <p className="text-sm font-medium" style={{ color: '#E2E8F0' }}>Recent Runs</p>
            <Clock size={12} style={{ color: '#3E4A63' }} />
          </div>
          {PIPELINE_RUNS.map((run, i) => (
            <motion.div key={run.id}
              className="flex items-center gap-2 px-3 py-2.5 border-b"
              style={{ borderColor: '#1A223540' }}
              initial={{ opacity: 0 }}
              animate={visible ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: isScrollingDown ? (0.3 + i * 0.06) : 0, duration: isScrollingDown ? 0.3 : 0 }}
            >
              {run.status === 'success'
                ? <CheckCircle2 size={13} style={{ color: '#34D399', flexShrink: 0 }} />
                : <XCircle size={13} style={{ color: '#F87171', flexShrink: 0 }} />
              }
              <span className="text-[10px] font-mono flex-shrink-0" style={{ color: '#3E4A63' }}>{run.id}</span>
              <span className="text-xs flex-1 truncate" style={{ color: '#8892A4' }}>{run.pipeline}</span>
              <span className="text-[10px] font-mono" style={{ color: '#3E4A63' }}>{run.duration}</span>
            </motion.div>
          ))}
        </Card>
      </div>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────────────────
   Main Dashboard Component
   ──────────────────────────────────────────────────────────────────────────────────────────  */
export default function Dashboard() {
  const [activeNav, setActiveNav] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [isScrollingDown, setIsScrollingDown] = useState(true)
  const isExport = useIsExport()

  useEffect(() => {
    if (!sectionRef.current) return
    
    // Check if export mode is enabled
    if (isExport) {
      setVisible(true)
      return
    }

    gsap.registerPlugin(ScrollTrigger)
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => {
        setIsScrollingDown(true)
        setVisible(true)
      },
      onLeave: () => {
        setVisible(false)
      },
      onEnterBack: () => {
        setIsScrollingDown(false)
        setVisible(true)
      },
      onLeaveBack: () => {
        setVisible(false)
      },
    })
    return () => { trigger.kill() }
  }, [isExport])

  const currentMetrics = VIEW_METRICS[activeNav]
  const currentTitle   = VIEW_TITLES[activeNav]

  return (
    <DashboardAnimContext.Provider value={isScrollingDown}>
      <section ref={sectionRef} className="py-32 px-6 relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 30%, rgba(91,141,239,0.04) 0%, transparent 70%)' }}
        />
      <SectionHeader
        tag="Intelligence Dashboard"
        title="Everything in one view"
        description="A unified workspace for data intelligence, real-time signals, and automated actions."
      />
      <motion.div
        initial={isExport ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
        animate={isExport ? { opacity: 1, y: 0 } : undefined}
        whileInView={isExport ? undefined : { opacity: 1, y: 0 }}
        viewport={isExport ? undefined : { once: true, margin: '-100px' }}
        transition={isExport ? { duration: 0 } : { duration: 0.8, ease: easings.smooth }}
        className="max-w-6xl mx-auto rounded-2xl border overflow-hidden"
        style={{
          background: 'rgba(12,17,24,0.6)',
          backdropFilter: 'blur(20px)',
          borderColor: '#1A2235',
          boxShadow: '0 0 80px rgba(91,141,239,0.06), 0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: '#1A2235' }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#F87171', opacity: 0.7 }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#FBBF24', opacity: 0.7 }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#34D399', opacity: 0.7 }} />
          </div>
          <div className="flex-1 mx-4 h-7 rounded-lg flex items-center px-3" style={{ background: '#0A0F16' }}>
            <Search size={11} style={{ color: '#3E4A63' }} className="mr-2" />
            <span className="text-xs font-mono" style={{ color: '#3E4A63' }}>app.xai.io/workspace</span>
          </div>
          <Bell size={14} style={{ color: '#3E4A63' }} />
          <div className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-mono"
            style={{ background: '#5B8DEF18', borderColor: '#5B8DEF30', color: '#5B8DEF' }}>
            J
          </div>
        </div>

        <div className="flex" style={{ minHeight: 540 }}>
          {/* Sidebar */}
          <motion.div
            className="w-52 border-r flex flex-col py-4 px-3 flex-shrink-0 hidden md:flex"
            style={{ borderColor: '#1A2235' }}
            initial={{ opacity: 0, x: -16 }}
            animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
            transition={{ delay: isScrollingDown ? 0.3 : 0, duration: isScrollingDown ? 0.5 : 0, ease: easings.smooth }}
          >
            <div className="flex items-center gap-2 px-2 mb-6">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: '#5B8DEF' }}>
                <span className="text-white text-[10px] font-mono font-bold">X</span>
              </div>
              <span className="text-sm font-semibold" style={{ color: '#E2E8F0' }}>Xai</span>
              <ChevronDown size={11} className="ml-auto" style={{ color: '#3E4A63' }} />
            </div>
            <nav className="space-y-0.5 flex-1" role="tablist" aria-label="Dashboard views">
              {NAV_ITEMS.map((n, i) => (
                <motion.button
                  key={n.label}
                  onClick={() => setActiveNav(i)}
                  role="tab"
                  aria-selected={activeNav === i}
                  aria-controls={`dashboard-tabpanel-${i}`}
                  id={`dashboard-tab-${i}`}
                  className="relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 text-left outline-none focus-visible:ring-1 focus-visible:ring-accent"
                  style={{
                    color: activeNav === i ? '#E2E8F0' : colors.muted,
                    background: activeNav === i ? colors.border : 'transparent',
                  }}
                  whileHover={{ x: 2 }}
                >
                  {ICON_MAP[n.icon]}
                  {n.label}
                  {activeNav === i && (
                    <motion.div
                      className="absolute left-0 w-[2px] h-5 rounded-r bg-accent"
                      layoutId="navIndicator"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>
            <div className="pt-4 border-t" style={{ borderColor: '#1A2235' }}>
              <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm" style={{ color: '#3E4A63' }}>
                <Settings size={14} />
                Settings
              </button>
            </div>
          </motion.div>

          {/* Main panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={visible ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: isScrollingDown ? 0.4 : 0, duration: isScrollingDown ? 0.4 : 0 }}
              className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
              style={{ borderColor: '#1A2235' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`title-${activeNav}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="font-semibold text-base" style={{ color: '#E2E8F0' }}>{currentTitle.title}</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#3E4A63' }}>{currentTitle.subtitle}</p>
                </motion.div>
              </AnimatePresence>
              <div className="flex items-center gap-3">
                <select 
                  className="text-xs border rounded-lg px-3 py-1.5 outline-none cursor-pointer focus-visible:ring-1 focus-visible:ring-accent"
                  aria-label="Time range filter"
                  style={{ background: '#0A0F16', borderColor: colors.border, color: colors.dim }}
                >
                  <option>Last 30 days</option>
                  <option>Last 7 days</option>
                </select>
                <motion.button
                  className="flex items-center gap-1.5 text-xs text-white px-3.5 py-1.5 rounded-lg font-medium bg-accent outline-none focus-visible:ring-1 focus-visible:ring-accent"
                  whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(91,141,239,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Plus size={12} />
                  Add source
                </motion.button>
              </div>
            </motion.div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 flex-shrink-0">
              <AnimatePresence mode="wait">
                {currentMetrics.map((m, i) => (
                  <MetricCard key={`${activeNav}-${m.label}`} metric={m} visible={visible} index={i} />
                ))}
              </AnimatePresence>
            </div>

            {/* Content */}
            <div className="flex-1 px-5 pb-5 overflow-auto">
              <AnimatePresence mode="wait">
                <div
                  key={`panel-${activeNav}`}
                  id={`dashboard-tabpanel-${activeNav}`}
                  role="tabpanel"
                  aria-labelledby={`dashboard-tab-${activeNav}`}
                  className="h-full w-full"
                >
                  {activeNav === 0 && <OverviewView  key="ov" visible={visible} />}
                  {activeNav === 1 && <InsightsView  key="iv" visible={visible} />}
                  {activeNav === 2 && <SourcesView   key="sv" visible={visible} />}
                  {activeNav === 3 && <AnalyticsView key="av" visible={visible} />}
                  {activeNav === 4 && <PipelineView  key="pv" visible={visible} />}
                </div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
    </DashboardAnimContext.Provider>
  )
}