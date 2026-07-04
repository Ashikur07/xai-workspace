/* ── Centralized Mock Data ── */

export const METRICS = [
  { label: 'Data Sources',   value: 24,     display: '24',     delta: '+3',    up: true  },
  { label: 'Insights Today', value: 1284,   display: '1,284',  delta: '+18%',  up: true  },
  { label: 'Automations',    value: 9,      display: '9',      delta: 'active',up: true  },
  { label: 'Avg Confidence', value: 94.2,   display: '94.2%',  delta: '-0.3%', up: false },
] as const

export const CHART_DATA = [
  { month: 'Jan', value: 42 },
  { month: 'Feb', value: 68 },
  { month: 'Mar', value: 55 },
  { month: 'Apr', value: 80 },
  { month: 'May', value: 72 },
  { month: 'Jun', value: 91 },
  { month: 'Jul', value: 65 },
  { month: 'Aug', value: 88 },
  { month: 'Sep', value: 74 },
  { month: 'Oct', value: 95 },
  { month: 'Nov', value: 82 },
  { month: 'Dec', value: 100 },
]

export interface TableRow {
  source: string
  type: string
  records: string
  status: 'Active' | 'Syncing' | 'Paused'
  confidence: number
}

export const TABLE_ROWS: TableRow[] = [
  { source: 'Salesforce CRM',   type: 'Structured',   records: '48,220',  status: 'Active',   confidence: 98 },
  { source: 'Slack Messages',   type: 'Unstructured', records: '122,041', status: 'Active',   confidence: 87 },
  { source: 'Postgres DB',      type: 'Structured',   records: '9,800',   status: 'Syncing',  confidence: 95 },
  { source: 'S3 Logs',          type: 'Semi-struct',  records: '2.4M',    status: 'Active',   confidence: 91 },
  { source: 'Zendesk Tickets',  type: 'Unstructured', records: '34,100',  status: 'Paused',   confidence: 79 },
]

export const NAV_ITEMS = [
  { label: 'Overview',  icon: 'home' },
  { label: 'Insights',  icon: 'zap' },
  { label: 'Sources',   icon: 'database' },
  { label: 'Analytics', icon: 'barchart' },
  { label: 'Pipeline',  icon: 'layers' },
] as const

export const SIGNALS = [
  { title: 'Revenue signal detected',  time: '2m ago',  level: 'High',   color: '#34D399' },
  { title: 'Churn risk: 3 accounts',   time: '14m ago', level: 'Alert',  color: '#F87171' },
  { title: 'Support volume spike',     time: '1h ago',  level: 'Medium', color: '#FBBF24' },
  { title: 'New data pattern found',   time: '3h ago',  level: 'Low',    color: '#5B8DEF' },
] as const

export const AUTOMATIONS = [
  { name: 'Churn prevention alert',  trigger: 'Confidence > 85%', runs: 42,  enabled: true  },
  { name: 'Weekly insight digest',   trigger: 'Every Monday 9am', runs: 12,  enabled: true  },
  { name: 'Anomaly Slack notify',    trigger: 'Signal detected',  runs: 8,   enabled: true  },
  { name: 'Data quality report',     trigger: 'Daily 6am',        runs: 30,  enabled: false },
] as const

export interface InsightStage {
  id: number
  tag: string
  label: string
  headline: string
  desc: string
  details: string[]
  color: string
}

export const INSIGHT_STAGES: InsightStage[] = [
  {
    id: 0,
    tag: '01',
    label: 'Ingest',
    headline: 'Ingest Data',
    desc: 'Connect any data source — structured, unstructured, streaming or static. Xai ingests with zero configuration.',
    details: ['CSV / JSON / APIs', 'Real-time streams', 'SQL & NoSQL databases', 'Document stores'],
    color: '#5B8DEF',
  },
  {
    id: 1,
    tag: '02',
    label: 'Analyze',
    headline: 'Analyze with AI',
    desc: 'Our intelligence layer classifies, embeds, and patterns your data — extracting signal from noise automatically.',
    details: ['Semantic classification', 'Anomaly detection', 'Pattern recognition', 'Confidence scoring'],
    color: '#A78BFA',
  },
  {
    id: 2,
    tag: '03',
    label: 'Insight',
    headline: 'Generate Insight',
    desc: 'Structured intelligence surfaces as actionable insights, visual summaries, and AI-driven automation triggers.',
    details: ['Executive summaries', 'Trend forecasting', 'Automated alerts', 'Action recommendations'],
    color: '#34D399',
  },
]

/* ── View-specific metric interface ── */
export interface ViewMetric {
  label: string
  value: number
  delta: string
  up: boolean
  decimals?: number
  suffix?: string
}

/* ── Metrics per sidebar view ── */
export const VIEW_METRICS: ViewMetric[][] = [
  // Overview
  [
    { label: 'Data Sources',   value: 24,   delta: '+3',    up: true  },
    { label: 'Insights Today', value: 1284, delta: '+18%',  up: true  },
    { label: 'Automations',    value: 9,    delta: 'active',up: true  },
    { label: 'Avg Confidence', value: 94.2, delta: '-0.3%', up: false, decimals: 1, suffix: '%' },
  ],
  // Insights
  [
    { label: 'Total Insights',  value: 1284, delta: '+18%',  up: true  },
    { label: 'Critical Alerts', value: 12,   delta: '+2',    up: false },
    { label: 'Resolved',        value: 847,  delta: '+34',   up: true  },
    { label: 'Pending Review',  value: 425,  delta: '-12',   up: true  },
  ],
  // Sources
  [
    { label: 'Total Sources', value: 24, delta: '+3',  up: true },
    { label: 'Active',        value: 18, delta: '+2',  up: true },
    { label: 'Syncing',       value: 3,  delta: '0',   up: true },
    { label: 'Paused',        value: 3,  delta: '-1',  up: true },
  ],
  // Analytics
  [
    { label: 'Queries / hr', value: 2400, delta: '+340',  up: true },
    { label: 'Accuracy',     value: 96.1, delta: '+1.2%', up: true, decimals: 1, suffix: '%' },
    { label: 'Avg Latency',  value: 48,   delta: '-8ms',  up: true, suffix: 'ms' },
    { label: 'Uptime',       value: 99.9, delta: '0.0%',  up: true, decimals: 1, suffix: '%' },
  ],
  // Pipeline
  [
    { label: 'Active Flows', value: 9,    delta: '+1',  up: true },
    { label: 'Completed',    value: 1247, delta: '+86', up: true },
    { label: 'Failed',       value: 3,    delta: '-2',  up: true },
    { label: 'Avg Duration', value: 2.4,  delta: '-0.3s', up: true, decimals: 1, suffix: 's' },
  ],
]

/* ── Insights feed ── */
export const INSIGHTS_FEED = [
  { title: 'Revenue signal detected in Q4 data',          category: 'Revenue',    severity: 'high'     as const, time: '2m ago',  confidence: 94, color: '#34D399' },
  { title: 'Churn risk identified: 3 enterprise accounts', category: 'Retention',  severity: 'critical' as const, time: '14m ago', confidence: 89, color: '#F87171' },
  { title: 'Support ticket volume up 34% this week',       category: 'Operations', severity: 'medium'   as const, time: '1h ago',  confidence: 91, color: '#FBBF24' },
  { title: 'New user acquisition pattern in APAC region',  category: 'Growth',     severity: 'low'      as const, time: '3h ago',  confidence: 78, color: '#5B8DEF' },
  { title: 'Product usage spike: Feature X adoption +22%', category: 'Product',    severity: 'high'     as const, time: '4h ago',  confidence: 96, color: '#34D399' },
  { title: 'Competitor pricing change detected',           category: 'Market',     severity: 'medium'   as const, time: '6h ago',  confidence: 82, color: '#A78BFA' },
]

/* ── Analytics breakdown ── */
export const ANALYTICS_BREAKDOWN = [
  { label: 'Classification',    value: 38, color: '#5B8DEF' },
  { label: 'Anomaly Detection', value: 24, color: '#A78BFA' },
  { label: 'Trend Analysis',    value: 18, color: '#34D399' },
  { label: 'Forecasting',       value: 12, color: '#FBBF24' },
  { label: 'Clustering',        value: 8,  color: '#22D3EE' },
]

export const PERFORMANCE_DATA = [
  { hour: '00:00', queries: 120, latency: 45 },
  { hour: '04:00', queries: 80,  latency: 38 },
  { hour: '08:00', queries: 340, latency: 52 },
  { hour: '12:00', queries: 520, latency: 58 },
  { hour: '16:00', queries: 480, latency: 55 },
  { hour: '20:00', queries: 280, latency: 42 },
  { hour: '23:59', queries: 160, latency: 40 },
]

/* ── Pipeline stages ── */
export const PIPELINE_STAGES = [
  { name: 'Ingestion',       status: 'running' as const, progress: 78, throughput: '12.4K/hr', color: '#5B8DEF' },
  { name: 'Validation',      status: 'running' as const, progress: 92, throughput: '11.8K/hr', color: '#A78BFA' },
  { name: 'Transformation',  status: 'running' as const, progress: 65, throughput: '10.2K/hr', color: '#34D399' },
  { name: 'Enrichment',      status: 'idle'    as const, progress: 0,  throughput: '—',        color: '#3E4A63' },
  { name: 'Output',          status: 'running' as const, progress: 88, throughput: '9.8K/hr',  color: '#FBBF24' },
]

export const PIPELINE_RUNS = [
  { id: 'RUN-2847', pipeline: 'Churn prevention alert', status: 'success' as const, duration: '2.1s', time: '3m ago' },
  { id: 'RUN-2846', pipeline: 'Weekly insight digest',  status: 'success' as const, duration: '4.8s', time: '12m ago' },
  { id: 'RUN-2845', pipeline: 'Anomaly Slack notify',   status: 'failed'  as const, duration: '1.2s', time: '28m ago' },
  { id: 'RUN-2844', pipeline: 'Data quality report',    status: 'success' as const, duration: '3.4s', time: '1h ago' },
  { id: 'RUN-2843', pipeline: 'Churn prevention alert', status: 'success' as const, duration: '1.9s', time: '2h ago' },
]

/* ── View titles for dashboard top bar ── */
export const VIEW_TITLES = [
  { title: 'Intelligence Overview',  subtitle: 'Last synced 2 minutes ago' },
  { title: 'Insights Feed',          subtitle: '6 new insights detected' },
  { title: 'Connected Sources',      subtitle: '5 sources configured' },
  { title: 'Analytics Dashboard',    subtitle: 'Tracking 12 metrics' },
  { title: 'Data Pipeline',          subtitle: '3 active automations' },
]
