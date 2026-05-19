'use client'

import { useMemo, type ReactNode } from 'react'
import type { LayersModel } from '@tensorflow/tfjs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts'
import { Sparkles, Calendar } from 'lucide-react'
import { DataType, ModelPrediction, CombinedDataPoint } from '../types'
import LoadingIndicator from './LoadingIndicator'
import PredictChartBox from './PredictChartBox'
import { PredictPanel, SectionHeader, CHART, chartTooltipStyle } from './predict-ui'
import { cn } from '@/lib/utils'

interface FuturePredictionTabProps {
  dataType: DataType
  forecastDays: number
  setForecastDays: (days: number) => void
  handlePredictFuture: () => Promise<void>
  model: LayersModel | null
  combinedData: CombinedDataPoint[]
  futurePredictions: ModelPrediction[]
  isPredictingFuture: boolean
  predictStatus: string | null
  isActive?: boolean
}

export default function FuturePredictionTab({
  dataType,
  forecastDays,
  setForecastDays,
  handlePredictFuture,
  model,
  combinedData,
  futurePredictions,
  isPredictingFuture,
  predictStatus,
  isActive = true,
}: FuturePredictionTabProps) {
  const chartData = useMemo(
    () => [...combinedData, ...futurePredictions],
    [combinedData, futurePredictions]
  )

  const label = dataType.charAt(0).toUpperCase() + dataType.slice(1)

  return (
    <PredictPanel accent="cyan">
      <SectionHeader
        title={`Future ${label}`}
        description="Autoregressive multi-day LSTM forecast"
        icon={<Sparkles className="h-5 w-5" />}
      />
      <div className="space-y-5 p-6 pt-2">
        <div className="flex flex-wrap items-end gap-4 rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-zinc-500" />
            <FieldGroup label="Horizon (days)">
              <Input
                type="number"
                value={forecastDays}
                onChange={(e) =>
                  setForecastDays(Math.max(1, Math.min(365, parseInt(e.target.value, 10) || 1)))
                }
                className="h-10 w-24 rounded-xl border-white/10 bg-zinc-950 font-mono"
                min={1}
                max={365}
                disabled={isPredictingFuture}
              />
            </FieldGroup>
          </div>
          <Button
            onClick={() => void handlePredictFuture()}
            disabled={!model || isPredictingFuture}
            aria-busy={isPredictingFuture}
            className={cn(
              'gap-2 rounded-xl px-6 font-semibold',
              model
                ? 'bg-gradient-to-r from-cyan-600 to-violet-600 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-violet-500'
                : 'bg-zinc-800 text-zinc-500'
            )}
          >
            <Sparkles className="h-4 w-4" />
            {isPredictingFuture ? 'Forecasting…' : 'Run forecast'}
          </Button>
          {!model && (
            <p className="text-sm text-zinc-500">Train a model first to unlock forecasting</p>
          )}
        </div>

        {isPredictingFuture && predictStatus && (
          <LoadingIndicator message={predictStatus} variant="inline" />
        )}

        {predictStatus && !isPredictingFuture && predictStatus.includes('failed') && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
            {predictStatus}
          </p>
        )}

        {futurePredictions.length > 0 && (
          <p className="text-sm text-emerald-400/90">
            Showing {futurePredictions.length} day forecast
            {futurePredictions.length > 1 ? 's' : ''} beyond historical data
          </p>
        )}

        <PredictChartBox height={420} active={isActive} dataRevision={chartData.length}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" stroke={CHART.axis} tick={{ fontSize: 11 }} minTickGap={40} />
            <YAxis
              stroke={CHART.axis}
              tick={{ fontSize: 11 }}
              width={56}
              label={{
                value: label,
                angle: -90,
                position: 'insideLeft',
                fill: CHART.axis,
                fontSize: 11,
              }}
            />
            <RechartsTooltip contentStyle={chartTooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            <Line
              type="monotone"
              dataKey="actual"
              stroke={CHART.actual}
              name="Historical"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke={CHART.predicted}
              name="LSTM"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </LineChart>
        </PredictChartBox>
      </div>
    </PredictPanel>
  )
}

function FieldGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-zinc-500">{label}</p>
      {children}
    </div>
  )
}
