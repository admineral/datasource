'use client'

import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

export const CHART = {
  grid: 'rgba(255,255,255,0.06)',
  axis: '#71717a',
  actual: '#38bdf8',
  predicted: '#34d399',
  future: '#fbbf24',
  train: '#a78bfa',
  validation: '#2dd4bf',
  tooltipBg: 'rgba(9, 9, 11, 0.92)',
  tooltipBorder: 'rgba(255,255,255,0.1)',
} as const

export const chartTooltipStyle = {
  backgroundColor: CHART.tooltipBg,
  border: `1px solid ${CHART.tooltipBorder}`,
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  padding: '10px 14px',
}

interface PredictPanelProps {
  children: ReactNode
  className?: string
  accent?: 'violet' | 'cyan' | 'none'
}

export function PredictPanel({ children, className, accent = 'none' }: PredictPanelProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/60 shadow-xl shadow-black/30 backdrop-blur-xl',
        accent === 'violet' &&
          'ring-1 ring-violet-500/20 before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-violet-500/[0.07] before:to-transparent',
        accent === 'cyan' &&
          'ring-1 ring-cyan-500/20 before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-cyan-500/[0.07] before:to-transparent',
        className
      )}
    >
      <div className="relative">{children}</div>
    </div>
  )
}

interface SectionHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export function SectionHeader({ title, description, icon, action }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-6 py-5">
      <div className="flex gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-cyan-400">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-50">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-zinc-500">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

interface StatBadgeProps {
  label: string
  value: string | number
  variant?: 'default' | 'success' | 'warning' | 'accent'
}

export function StatBadge({ label, value, variant = 'default' }: StatBadgeProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p
        className={cn(
          'mt-1 font-mono text-lg font-semibold tabular-nums',
          variant === 'default' && 'text-zinc-100',
          variant === 'success' && 'text-emerald-400',
          variant === 'warning' && 'text-amber-400',
          variant === 'accent' &&
            'bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent'
        )}
      >
        {value}
      </p>
    </div>
  )
}

interface FieldLabelProps {
  label: string
  hint?: string
  children: ReactNode
}

export function FieldLabel({ label, hint, children }: FieldLabelProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-zinc-300">{label}</label>
        {hint && <span className="text-xs text-zinc-500">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

export const predictInputClass =
  'h-10 rounded-xl border-white/10 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-500/40'

export const predictSelectTriggerClass =
  'h-10 rounded-xl border-white/10 bg-zinc-900/80 text-zinc-100 focus:ring-cyan-500/40'

interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface CollapseSectionProps {
  open: boolean
  children: ReactNode
}

export function CollapseSection({ open, children }: CollapseSectionProps) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <motion.div className="space-y-4 border-t border-white/[0.06] pt-4">{children}</motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
