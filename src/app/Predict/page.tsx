'use client'

import React, { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DataSelectionCard from './components/DataSelectionCard'
import ModelTrainingCard from './components/ModelTrainingCard'
import HistoricalComparisonTab from './components/HistoricalComparisonTab'
import FuturePredictionTab from './components/FuturePredictionTab'
import { useDataFetching } from './hooks/useDataFetching'
import { useModelTraining } from './hooks/useModelTraining'
import { DataType, ModelPrediction, CombinedDataPoint } from './types'
import { predictFuture } from './utils/modelUtils'
import { track } from '@vercel/analytics'

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

  const { data, error } = useDataFetching(dataType)
  const { 
    model, 
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
  } = useModelTraining()

  const handleTrainModel = () => {
    setFuturePredictions([])
    trainModel(data, trainPercentage, epochs, lookBack, learningRate, complexity, dropoutRate, forecastDays)
    track('Model Training Started', {
      dataType,
      trainPercentage,
      epochs,
      lookBack,
      learningRate,
      complexity,
      dropoutRate,
      forecastDays
    })
  }

  const handleStopAndResetTraining = () => {
    handleStopTraining();
    setFuturePredictions([]);
    track('Model Training Stopped')
  }

  const handlePredictFuture = async () => {
    if (!model) return;
    try {
      const newFuturePredictions = await predictFuture(model, data, lookBack, forecastDays);
      setFuturePredictions(newFuturePredictions);
      track('Future Prediction Made', { forecastDays })
    } catch (error) {
      console.error('Error predicting future:', error);
      track('Future Prediction Error', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const combinedData: CombinedDataPoint[] = useMemo(() => [
    ...data.map(d => ({ date: d.date, actual: d.value })),
    ...currentPredictions.map(p => ({
      date: p.date,
      actual: p.actual,
      predicted: p.predicted,
      modelName: 'LSTM'
    }))
  ], [data, currentPredictions])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Time Series Prediction Dashboard</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
        />
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
          trainingStatus={trainingStatus}
          trainingLogs={trainingLogs}
        />
      </div>
      <Tabs defaultValue="historical" className="mb-6" onValueChange={(value) => track('Tab Changed', { tab: value })}>
        <TabsList className="bg-gray-800">
          <TabsTrigger value="historical">Historical Comparison</TabsTrigger>
          <TabsTrigger value="future">Future Prediction</TabsTrigger>
        </TabsList>
        <TabsContent value="historical">
          <HistoricalComparisonTab
            dataType={dataType}
            combinedData={combinedData}
            futurePredictions={futurePredictions}
          />
        </TabsContent>
        <TabsContent value="future">
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
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}