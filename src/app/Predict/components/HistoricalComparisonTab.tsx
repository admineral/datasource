'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts'
import { LineChart as LineChartIcon } from 'lucide-react'
import { DataType, CombinedDataPoint, ModelPrediction } from '../types'
import LoadingIndicator from './LoadingIndicator'
import PredictChartBox from './PredictChartBox'
import { PredictPanel, SectionHeader, CHART, chartTooltipStyle } from './predict-ui'
import type { TrainingStatus } from '../hooks/useModelTraining'

interface HistoricalComparisonTabProps {
  dataType: DataType
  combinedData: CombinedDataPoint[]
  futurePredictions: ModelPrediction[]
  isTraining?: boolean
  trainingStatus?: TrainingStatus
  isActive?: boolean
}

export default function HistoricalComparisonTab({
  dataType,
  combinedData,
  futurePredictions,
  isTraining,
  trainingStatus,
  isActive = true,
}: HistoricalComparisonTabProps) {
  const chartData = [
    ...combinedData,
    ...futurePredictions.map((fp) => ({
      date: fp.date,
      futurePredicted: fp.predicted,
    })),
  ]

  const label = dataType.charAt(0).toUpperCase() + dataType.slice(1)

  return (
    <PredictPanel>
      <SectionHeader
        title="Historical comparison"
        description={`Actual vs LSTM fit on ${label.toLowerCase()} data`}
        icon={<LineChartIcon className="h-5 w-5" />}
      />
      <div className="p-6 pt-2">
        {isTraining && trainingStatus === 'training' && (
          <LoadingIndicator
            message="Chart updating as training progresses"
            detail="Refreshes every 5 epochs"
            className="mb-4"
            variant="inline"
          />
        )}
        <PredictChartBox height={420} active={isActive} dataRevision={chartData.length}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              stroke={CHART.axis}
              tick={{ fontSize: 11 }}
              tickMargin={8}
              minTickGap={40}
            />
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
              name="Actual"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke={CHART.predicted}
              name="LSTM fit"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="futurePredicted"
              stroke={CHART.future}
              name="Forecast overlay"
              dot={false}
              strokeWidth={2}
              strokeDasharray="6 4"
              isAnimationActive={false}
            />
          </LineChart>
        </PredictChartBox>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-sky-400" /> Actual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-emerald-400" /> In-sample prediction
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-amber-400" /> Future (if generated)
          </span>
        </div>
      </div>
    </PredictPanel>
  )
}
