'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { Brain, Play, Square, RotateCcw, Sparkles } from 'lucide-react'
import LoadingIndicator from './LoadingIndicator'
import PredictChartBox from './PredictChartBox'
import {
  PredictPanel,
  SectionHeader,
  StatBadge,
  CHART,
  chartTooltipStyle,
} from './predict-ui'
import type { TrainingStatus } from '../hooks/useModelTraining'

interface ModelTrainingCardProps {
  isTraining: boolean
  currentEpoch: number
  epochs: number
  lossHistory: number[]
  validationLossHistory: number[]
  maeHistory: number[]
  validationMAEHistory: number[]
  handleTrainModel: () => void
  handleStopTraining: () => void
  onTrainAgain: () => void
  trainingStatus: TrainingStatus
  statusDetail: string | null
  trainingLogs: string[]
  isDataLoading: boolean
  isDataReady: boolean
  dataPointCount: number
}

const STATUS_LABELS: Record<TrainingStatus, string> = {
  idle: '',
  loading_ml: 'Loading TensorFlow.js',
  preparing: 'Preparing training',
  preprocessing: 'Preprocessing data',
  creating_model: 'Creating LSTM model',
  training: 'Training model',
  completed: 'Training complete',
  error: 'Training failed',
}

export default function ModelTrainingCard({
  isTraining,
  currentEpoch,
  epochs,
  lossHistory,
  validationLossHistory,
  maeHistory,
  validationMAEHistory,
  handleTrainModel,
  handleStopTraining,
  onTrainAgain,
  trainingStatus,
  statusDetail,
  trainingLogs,
  isDataLoading,
  isDataReady,
  dataPointCount,
}: ModelTrainingCardProps) {
  const chartData = lossHistory.map((loss, index) => ({
    epoch: index + 1,
    loss: Number(loss),
    validationLoss: validationLossHistory[index] ?? null,
    mae: maeHistory[index] ?? null,
    validationMAE: validationMAEHistory[index] ?? null,
  }))

  const progress = epochs > 0 ? (currentEpoch / epochs) * 100 : 0
  const showProgress = trainingStatus === 'training' && epochs > 0
  const showCancel = isTraining && trainingStatus !== 'completed'
  const showSetupLoading =
    trainingStatus !== 'idle' &&
    trainingStatus !== 'training' &&
    trainingStatus !== 'completed' &&
    trainingStatus !== 'error'

  const latestLoss = lossHistory[lossHistory.length - 1]
  const latestMae = maeHistory[maeHistory.length - 1]
  const logScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = logScrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [trainingLogs])

  return (
    <PredictPanel accent="violet" className="h-full">
      <SectionHeader
        title="Training"
        description="2-layer LSTM · in-browser TensorFlow.js"
        icon={<Brain className="h-5 w-5" />}
        action={
          trainingStatus === 'idle' && isDataReady && !isDataLoading ? (
            <Button
              onClick={handleTrainModel}
              disabled={isTraining}
              className="gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-5 font-semibold text-white shadow-lg shadow-violet-500/30 hover:from-violet-500 hover:to-cyan-500"
            >
              <Play className="h-4 w-4" />
              Train
            </Button>
          ) : null
        }
      />

      <div className="space-y-5 p-6">
        {isDataLoading && (
          <LoadingIndicator
            message="Waiting for dataset…"
            detail="Fetch completes before training"
            variant="inline"
          />
        )}

        {!isDataLoading && isDataReady && trainingStatus === 'idle' && (
          <div className="grid grid-cols-2 gap-3">
            <StatBadge label="Data points" value={dataPointCount.toLocaleString()} />
            <StatBadge label="Model" value="Ready" variant="success" />
          </div>
        )}

        {showSetupLoading && (
          <LoadingIndicator
            message={STATUS_LABELS[trainingStatus]}
            detail={statusDetail ?? undefined}
          />
        )}

        {trainingStatus === 'training' && (
          <LoadingIndicator
            message={STATUS_LABELS.training}
            detail={
              statusDetail ??
              `Epoch ${currentEpoch}/${epochs} · charts update live`
            }
          />
        )}

        {showProgress && (
          <div className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Epoch progress
                </p>
                <p className="font-mono text-2xl font-bold tabular-nums text-zinc-50">
                  {currentEpoch}
                  <span className="text-lg text-zinc-500"> / {epochs}</span>
                </p>
              </div>
              <div className="text-right">
                {latestLoss != null && (
                  <p className="text-xs text-zinc-500">
                    Loss{' '}
                    <span className="font-mono text-violet-400">{latestLoss.toFixed(4)}</span>
                  </p>
                )}
                {latestMae != null && (
                  <p className="text-xs text-zinc-500">
                    MAE <span className="font-mono text-cyan-400">{latestMae.toFixed(4)}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {showCancel && (
            <Button
              onClick={handleStopTraining}
              variant="outline"
              className="gap-2 rounded-xl border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              {trainingStatus === 'training' ? 'Stop' : 'Cancel'}
            </Button>
          )}
          {(trainingStatus === 'completed' || trainingStatus === 'error') && (
            <Button
              onClick={onTrainAgain}
              variant="outline"
              className="gap-2 rounded-xl border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" />
              {trainingStatus === 'error' ? 'Try again' : 'Train again'}
            </Button>
          )}
        </div>

        {trainingStatus === 'completed' && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <Sparkles className="h-4 w-4 shrink-0" />
            {statusDetail ?? 'Model ready — explore forecasts below'}
          </div>
        )}

        {trainingStatus === 'error' && statusDetail && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {statusDetail}
          </p>
        )}

        {chartData.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-2">
            <MetricChart
              title="Loss"
              data={chartData}
              trainKey="loss"
              valKey="validationLoss"
              revision={chartData.length}
            />
            <MetricChart
              title="Mean absolute error"
              data={chartData}
              trainKey="mae"
              valKey="validationMAE"
              revision={chartData.length}
            />
          </div>
        )}

        {trainingLogs.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Training log
            </p>
            <div
              ref={logScrollRef}
              className="max-h-36 overflow-y-auto scroll-smooth rounded-xl border border-white/[0.06] bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-zinc-400"
            >
              {trainingLogs.map((log, i) => (
                <p key={i} className="border-b border-white/[0.03] py-1 last:border-0">
                  <span className="text-zinc-600">› </span>
                  {log}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </PredictPanel>
  )
}

function MetricChart({
  title,
  data,
  trainKey,
  valKey,
  revision,
}: {
  title: string
  data: Record<string, unknown>[]
  trainKey: string
  valKey: string
  revision: number
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
      <p className="mb-2 text-sm font-medium text-zinc-400">{title}</p>
      <PredictChartBox height={180} dataRevision={revision}>
        <LineChart data={data}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="epoch" stroke={CHART.axis} tick={{ fontSize: 11 }} />
          <YAxis stroke={CHART.axis} tick={{ fontSize: 11 }} domain={['auto', 'auto']} width={48} />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey={trainKey}
            stroke={CHART.train}
            name="Train"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey={valKey}
            stroke={CHART.validation}
            name="Validation"
            dot={false}
            strokeWidth={2}
            strokeDasharray="4 4"
            isAnimationActive={false}
            connectNulls
          />
        </LineChart>
      </PredictChartBox>
    </div>
  )
}
