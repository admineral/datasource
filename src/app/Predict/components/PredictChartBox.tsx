'use client'

import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from 'react'

interface PredictChartBoxProps {
  height: number
  children: ReactElement<{ width?: number; height?: number }>
  /** Skip rendering when the parent tab/panel is hidden */
  active?: boolean
  /** Bump to re-measure after data/layout changes (e.g. new training epoch) */
  dataRevision?: number
}

/**
 * Measures its container and passes explicit width/height to Recharts.
 * ResponsiveContainer often stays at -1×-1 when mounted during layout shifts
 * (e.g. while training UI is updating).
 */
export default function PredictChartBox({
  height,
  children,
  active = true,
  dataRevision = 0,
}: PredictChartBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    if (!active) {
      setSize(null)
      return
    }

    const node = containerRef.current
    if (!node) return

    const measure = () => {
      const { width } = node.getBoundingClientRect()
      if (width > 0) {
        setSize({ width: Math.floor(width), height })
      }
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [active, height, dataRevision])

  if (!active) {
    return <div className="w-full min-w-0" style={{ height }} aria-hidden />
  }

  return (
    <div ref={containerRef} className="w-full min-w-0" style={{ height }}>
      {size && isValidElement(children)
        ? cloneElement(children, { width: size.width, height: size.height })
        : null}
    </div>
  )
}
