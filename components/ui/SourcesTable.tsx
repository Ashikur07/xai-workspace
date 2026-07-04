'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { colors } from '@/lib/constants'
import { TABLE_ROWS } from '@/lib/data'

interface SourcesTableProps {
  visible: boolean
  showAvatar?: boolean
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    Active: colors.green,
    Syncing: colors.yellow,
    Paused: colors.muted,
  }
  const color = colorMap[status] ?? colors.dim
  return (
    <span className="flex items-center gap-1.5 text-xs font-mono" style={{ color }}>
      <motion.span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: color }}
        animate={status === 'Active' ? { opacity: [1, 0.4, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {status}
    </span>
  )
}

function ConfBar({ value, visible }: { value: number; visible: boolean }) {
  const color = value > 90 ? colors.green : value > 80 ? colors.accent : colors.yellow
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-border/40">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={visible ? { width: `${value}%` } : { width: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] font-mono w-7 text-right text-dim">{value}%</span>
    </div>
  )
}

export default function SourcesTable({ visible, showAvatar = false }: SourcesTableProps) {
  const [hoverRow, setHoverRow] = useState<number | null>(null)

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          {['Source', 'Type', 'Records', 'Status', 'Confidence'].map(h => (
            <th key={h} className="text-left px-3 py-2.5 text-xs font-medium text-muted">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {TABLE_ROWS.map((row, i) => (
          <motion.tr
            key={row.source}
            className="border-b border-border/25 cursor-pointer"
            style={{ background: hoverRow === i ? 'rgba(26, 34, 53, 0.38)' : 'transparent' }}
            onHoverStart={() => setHoverRow(i)}
            onHoverEnd={() => setHoverRow(null)}
            initial={{ opacity: 0, x: -8 }}
            animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
            transition={{ delay: (showAvatar ? 0.2 : 0.6) + i * 0.06, duration: 0.4 }}
          >
            <td className="px-3 py-3">
              {showAvatar ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-mono font-bold bg-border text-accent">
                    {row.source.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-medium text-xs text-text">{row.source}</span>
                </div>
              ) : (
                <span className="font-medium text-xs text-text">{row.source}</span>
              )}
            </td>
            <td className="px-3 py-3">
              <span className="text-xs font-mono px-2 py-0.5 rounded text-dim bg-border/50">{row.type}</span>
            </td>
            <td className="px-3 py-3 text-xs font-mono text-dim">{row.records}</td>
            <td className="px-3 py-3"><StatusBadge status={row.status} /></td>
            <td className="px-3 py-3 w-36"><ConfBar value={row.confidence} visible={visible} /></td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  )
}
