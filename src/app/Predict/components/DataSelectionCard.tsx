'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Settings2, TrendingUp, DollarSign, ChevronDown } from 'lucide-react'
import { DataType } from '../types'
import {
  PredictPanel,
  SectionHeader,
  FieldLabel,
  CollapseSection,
  predictInputClass,
} from './predict-ui'

interface DataSelectionCardProps {
  dataType: DataType
  setDataType: (value: DataType) => void
  trainPercentage: number
  setTrainPercentage: (value: number) => void
  epochs: number
  setEpochs: (value: number) => void
  lookBack: number
  setLookBack: (value: number) => void
  learningRate: number
  setLearningRate: (value: number) => void
  complexity: number
  setComplexity: (value: number) => void
  dropoutRate: number
  setDropoutRate: (value: number) => void
  showAdvancedOptions: boolean
  setShowAdvancedOptions: (value: boolean) => void
  isDataLoading?: boolean
  isTraining?: boolean
}

const DATA_TYPES: { value: DataType; label: string; icon: typeof TrendingUp }[] = [
  { value: 'sales', label: 'Sales', icon: TrendingUp },
  { value: 'price', label: 'Price', icon: DollarSign },
]

function ParamField({
  label,
  tooltip,
  children,
}: {
  label: string
  tooltip: string
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <FieldLabel label={label}>{children}</FieldLabel>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs border-white/10 bg-zinc-900 text-zinc-200">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export default function DataSelectionCard({
  dataType,
  setDataType,
  trainPercentage,
  setTrainPercentage,
  epochs,
  setEpochs,
  lookBack,
  setLookBack,
  learningRate,
  setLearningRate,
  complexity,
  setComplexity,
  dropoutRate,
  setDropoutRate,
  showAdvancedOptions,
  setShowAdvancedOptions,
  isDataLoading = false,
  isTraining = false,
}: DataSelectionCardProps) {
  const disabled = isDataLoading || isTraining

  return (
    <PredictPanel accent="cyan" className={cn(disabled && 'pointer-events-none opacity-50')}>
      <SectionHeader
        title="Configuration"
        description="Dataset & LSTM hyperparameters"
        icon={<Settings2 className="h-5 w-5" />}
      />
      <div className="space-y-6 p-6">
        {isDataLoading && (
          <p className="text-sm text-cyan-400/90">Loading dataset — controls unlock shortly…</p>
        )}
        {isTraining && !isDataLoading && (
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200/90">
            Training in progress — parameters locked
          </p>
        )}

        <FieldLabel label="Dataset">
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-zinc-900/80 p-1">
            {DATA_TYPES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                disabled={disabled}
                onClick={() => setDataType(value)}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                  dataType === value
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-500/25'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </FieldLabel>

        <FieldLabel label="Training split" hint={`${trainPercentage}% for training`}>
          <Slider
            value={[trainPercentage]}
            onValueChange={(v) => setTrainPercentage(v[0] ?? trainPercentage)}
            max={95}
            min={50}
            step={5}
            disabled={disabled}
            className="py-2"
          />
        </FieldLabel>

        <TooltipProvider delayDuration={200}>
          <div className="grid gap-4 sm:grid-cols-2">
            <ParamField label="Epochs" tooltip="Training passes. Recommended: 10–200">
              <Input
                type="number"
                value={epochs}
                onChange={(e) => setEpochs(parseInt(e.target.value, 10) || 10)}
                min={10}
                max={200}
                disabled={disabled}
                className={predictInputClass}
              />
            </ParamField>
            <ParamField label="Lookback (days)" tooltip="History window. Recommended: 1–30">
              <Input
                type="number"
                value={lookBack}
                onChange={(e) => setLookBack(parseInt(e.target.value, 10) || 1)}
                min={1}
                max={30}
                disabled={disabled}
                className={predictInputClass}
              />
            </ParamField>
          </div>

          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="mt-2 w-full justify-between rounded-xl border border-white/10 bg-zinc-900/50 text-zinc-300 hover:bg-white/5 hover:text-white"
          >
            Advanced hyperparameters
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', showAdvancedOptions && 'rotate-180')}
            />
          </Button>

          <CollapseSection open={showAdvancedOptions}>
            <div className="grid gap-4 sm:grid-cols-2">
              <ParamField label="Learning rate" tooltip="Adam step size. Recommended: 0.0001–0.1">
                <Input
                  type="number"
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value) || 0.001)}
                  step={0.0001}
                  min={0.0001}
                  max={0.1}
                  disabled={disabled}
                  className={predictInputClass}
                />
              </ParamField>
              <ParamField label="LSTM units" tooltip="Model width. Recommended: 16–256">
                <Input
                  type="number"
                  value={complexity}
                  onChange={(e) => setComplexity(parseInt(e.target.value, 10) || 16)}
                  min={16}
                  max={256}
                  step={16}
                  disabled={disabled}
                  className={predictInputClass}
                />
              </ParamField>
              <ParamField label="Dropout" tooltip="Regularization. Recommended: 0–0.5">
                <Input
                  type="number"
                  value={dropoutRate}
                  onChange={(e) => setDropoutRate(parseFloat(e.target.value) || 0)}
                  step={0.1}
                  min={0}
                  max={0.5}
                  disabled={disabled}
                  className={predictInputClass}
                />
              </ParamField>
            </div>
          </CollapseSection>
        </TooltipProvider>
      </div>
    </PredictPanel>
  )
}
