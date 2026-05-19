'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingIndicatorProps {
  message: string
  detail?: string
  className?: string
  variant?: 'default' | 'inline'
}

export default function LoadingIndicator({
  message,
  detail,
  className = '',
  variant = 'default',
}: LoadingIndicatorProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3',
        variant === 'default' &&
          'rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 shadow-inner shadow-cyan-500/5',
        variant === 'inline' && 'py-1',
        className
      )}
    >
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/20" />
        <Loader2 className="relative h-5 w-5 animate-spin text-cyan-400" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-100">{message}</p>
        {detail && <p className="mt-0.5 text-sm text-zinc-500">{detail}</p>}
      </div>
    </div>
  )
}
