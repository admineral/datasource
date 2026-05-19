'use client'

import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, LineChart, Zap } from 'lucide-react'
import DataSelectionCard from './components/DataSelectionCard'
import ModelTrainingCard from './components/ModelTrainingCard'
import HistoricalComparisonTab from './components/HistoricalComparisonTab'
import FuturePredictionTab from './components/FuturePredictionTab'
import LoadingIndicator from './components/LoadingIndicator'
import { useDataFetching } from './hooks/useDataFetching'
import { useModelTraining } from './hooks/useModelTraining'
import { DataType, CombinedDataPoint } from './types'
import { predictFuture } from './utils/modelUtils'
import { loadTensorFlow } from './utils/tensorflow'
import { FadeIn, StatBadge } from './components/predict-ui'
import { cn } from '@/lib/utils'
import { track } from '@vercel/analytics'
import type { TrainingStatus } from './hooks/useModelTraining'

function modelStatusLabel(status: TrainingStatus, hasModel: boolean): string {
  if (status === 'training' || status === 'loading_ml' || status === 'preprocessing' || status === 'creating_model' || status === 'preparing') return 'Training'
  if (status === 'completed' || hasModel) return 'Ready'
  if (status === 'error') return 'Error'
  return 'Idle'
}

export default function PredictDashboard() {
  const [dataType, setDataType] = useState<DataType>('price')
  const [trainPercentage, setTrainPercentage] = useState(80)
  const [forecastDays, setForecastDays] = useState(30)
  const [epochs, setEpochs] = useState(50)
  const [lookBack, setLookBack] = useState(7)
  const [learningRate, setLearningRate] = useState(0.001)
  const [complexity, setComplexity] = useState(64)
  const [dropoutRate, setDropoutRate] = useState(0.2)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [isPredictingFuture, setIsPredictingFuture] = useState(false)
  const [futurePredictStatus, setFuturePredictStatus] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('historical')

  const { data, error, isLoading: isDataLoading } = useDataFetching(dataType)
  const {
    model,
    tfModule,
    isTraining,
    currentEpoch,
    lossHistory,
    validationLossHistory,
    maeHistory,
    validationMAEHistory,
    trainingLogs,
    trainModel,
    handleStopTraining,
    currentPredictions,
    resetTraining,
    futurePredictions,
    setFuturePredictions,
    trainingStatus,
    statusDetail,
  } = useModelTraining()

  const isDataReady = data.length > 0 && !error

  const handleTrainModel = () => {
    setFuturePredictions([])
    void trainModel(
      data,
      trainPercentage,
      epochs,
      lookBack,
      learningRate,
      complexity,
      dropoutRate,
      forecastDays
    )
    track('Model Training Started', {
      dataType,
      trainPercentage,
      epochs,
      lookBack,
      learningRate,
      complexity,
      dropoutRate,
      forecastDays,
    })
  }

  const handleStopAndResetTraining = () => {
    handleStopTraining()
    setFuturePredictions([])
    track('Model Training Stopped')
  }

  const handlePredictFuture = async () => {
    if (!model) return
    setIsPredictingFuture(true)
    setFuturePredictStatus('Loading ML runtime…')
    try {
      const tf = tfModule ?? (await loadTensorFlow())
      setFuturePredictStatus(`Forecasting ${forecastDays} days…`)
      const newFuturePredictions = await predictFuture(
        tf,
        model,
        data,
        lookBack,
        forecastDays
      )
      setFuturePredictions(newFuturePredictions)
      setFuturePredictStatus(null)
      track('Future Prediction Made', { forecastDays })
    } catch (err) {
      console.error('Error predicting future:', err)
      setFuturePredictStatus('Prediction failed — try again')
      track('Future Prediction Error', {
        error: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setIsPredictingFuture(false)
    }
  }

  const combinedData: CombinedDataPoint[] = useMemo(
    () => [
      ...data.map((d) => ({ date: d.date, actual: d.value })),
      ...currentPredictions.map((p) => ({
        date: p.date,
        actual: p.actual,
        predicted: p.predicted,
        modelName: 'LSTM',
      })),
    ],
    [data, currentPredictions]
  )

  const statusVariant =
    trainingStatus === 'completed' || model
      ? 'success'
      : trainingStatus === 'error'
        ? 'warning'
        : isTraining
          ? 'accent'
          : 'default'

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div className="absolute -left-32 top-0 h-[480px] w-[480px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -right-32 top-1/4 h-[400px] w-[400px] rounded-full bg-cyan-600/15 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[500px] rounded-full bg-violet-900/20 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <FadeIn>
          <header className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-cyan-300/90">
              <Zap className="h-3.5 w-3.5" />
              In-browser ML · TensorFlow.js
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Time Series
              </span>{' '}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Predict
              </span>
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Train a stacked LSTM on historical price or sales data, compare in-sample fit, and
              forecast the future — all client-side.
            </p>
          </header>
        </FadeIn>

        {isDataLoading && (
          <FadeIn delay={0.05} className="mb-6">
            <LoadingIndicator
              message="Loading time series data…"
              detail={`Fetching ${dataType} from server`}
            />
          </FadeIn>
        )}

        {error && (
          <FadeIn className="mb-6">
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          </FadeIn>
        )}

        <FadeIn delay={0.1}>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBadge
              label="Dataset"
              value={isDataLoading ? '…' : dataType}
              variant={isDataReady ? 'accent' : 'default'}
            />
            <StatBadge
              label="Points"
              value={isDataReady ? data.length.toLocaleString() : '—'}
            />
            <StatBadge
              label="Model"
              value={modelStatusLabel(trainingStatus, !!model)}
              variant={statusVariant}
            />
            <StatBadge
              label="Epoch"
              value={
                isTraining || trainingStatus === 'completed'
                  ? `${currentEpoch}/${epochs}`
                  : '—'
              }
            />
          </div>
        </FadeIn>

        {!isDataLoading && isDataReady && (
          <FadeIn delay={0.12}>
            <p className="mb-6 text-sm text-zinc-500">
              Range{' '}
              <span className="font-mono text-zinc-400">
                {data[0]?.date} → {data[data.length - 1]?.date}
              </span>
            </p>
          </FadeIn>
        )}

        <div className="mb-8 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <FadeIn delay={0.15} className="lg:col-span-5">
            <DataSelectionCard
              dataType={dataType}
              setDataType={(value) => {
                setDataType(value)
                track('Data Type Changed', { newDataType: value })
              }}
              trainPercentage={trainPercentage}
              setTrainPercentage={(value) => {
                setTrainPercentage(value)
                track('Train Percentage Changed', { value })
              }}
              epochs={epochs}
              setEpochs={(value) => {
                setEpochs(value)
                track('Epochs Changed', { value })
              }}
              lookBack={lookBack}
              setLookBack={(value) => {
                setLookBack(value)
                track('Look Back Changed', { value })
              }}
              learningRate={learningRate}
              setLearningRate={(value) => {
                setLearningRate(value)
                track('Learning Rate Changed', { value })
              }}
              complexity={complexity}
              setComplexity={(value) => {
                setComplexity(value)
                track('Complexity Changed', { value })
              }}
              dropoutRate={dropoutRate}
              setDropoutRate={(value) => {
                setDropoutRate(value)
                track('Dropout Rate Changed', { value })
              }}
              showAdvancedOptions={showAdvancedOptions}
              setShowAdvancedOptions={(value) => {
                setShowAdvancedOptions(value)
                track('Advanced Options Toggled', { shown: value })
              }}
              isDataLoading={isDataLoading}
              isTraining={isTraining}
            />
          </FadeIn>

          <FadeIn delay={0.2} className="lg:col-span-7">
            <ModelTrainingCard
              isTraining={isTraining}
              currentEpoch={currentEpoch}
              epochs={epochs}
              lossHistory={lossHistory}
              validationLossHistory={validationLossHistory}
              maeHistory={maeHistory}
              validationMAEHistory={validationMAEHistory}
              handleTrainModel={handleTrainModel}
              handleStopTraining={handleStopAndResetTraining}
              onTrainAgain={resetTraining}
              trainingStatus={trainingStatus}
              statusDetail={statusDetail}
              trainingLogs={trainingLogs}
              isDataLoading={isDataLoading}
              isDataReady={isDataReady}
              dataPointCount={data.length}
            />
          </FadeIn>
        </div>

        <FadeIn delay={0.25}>
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value)
              track('Tab Changed', { tab: value })
            }}
            className="space-y-4"
          >
            <TabsList className="h-auto w-full justify-start gap-1 rounded-xl border border-white/10 bg-zinc-900/80 p-1 sm:w-auto">
              <TabsTrigger
                value="historical"
                disabled={isDataLoading}
                className={cn(
                  'gap-2 rounded-lg px-4 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/90 data-[state=active]:to-cyan-600/90 data-[state=active]:text-white data-[state=active]:shadow-md'
                )}
              >
                <LineChart className="h-4 w-4" />
                Historical
              </TabsTrigger>
              <TabsTrigger
                value="future"
                disabled={isDataLoading}
                className={cn(
                  'gap-2 rounded-lg px-4 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/90 data-[state=active]:to-cyan-600/90 data-[state=active]:text-white data-[state=active]:shadow-md'
                )}
              >
                <BarChart3 className="h-4 w-4" />
                Forecast
              </TabsTrigger>
            </TabsList>

            <TabsContent value="historical" className="mt-0 focus-visible:outline-none">
              {isDataLoading ? (
                <LoadingIndicator message="Charts appear after data loads" className="mt-2" />
              ) : (
                <HistoricalComparisonTab
                  dataType={dataType}
                  combinedData={combinedData}
                  futurePredictions={futurePredictions}
                  isTraining={isTraining}
                  trainingStatus={trainingStatus}
                  isActive={activeTab === 'historical'}
                />
              )}
            </TabsContent>

            <TabsContent value="future" className="mt-0 focus-visible:outline-none">
              {isDataLoading ? (
                <LoadingIndicator message="Charts appear after data loads" className="mt-2" />
              ) : (
                <FuturePredictionTab
                  dataType={dataType}
                  forecastDays={forecastDays}
                  setForecastDays={(value) => {
                    setForecastDays(value)
                    track('Forecast Days Changed', { value })
                  }}
                  handlePredictFuture={handlePredictFuture}
                  model={model}
                  combinedData={combinedData}
                  futurePredictions={futurePredictions}
                  isPredictingFuture={isPredictingFuture}
                  predictStatus={futurePredictStatus}
                  isActive={activeTab === 'future'}
                />
              )}
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>
    </div>
  )
}
