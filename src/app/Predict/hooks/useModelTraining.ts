import { useState, useRef } from 'react'
import type { LayersModel } from '@tensorflow/tfjs'
import { DataPoint, ModelPrediction } from '../types'
import { loadTensorFlow, type TfModule } from '../utils/tensorflow'
import {
  createModel,
  preprocessData,
  createSequences,
  predictFuture,
  runHistoricalPredictions,
} from '../utils/modelUtils'

export type TrainingStatus =
  | 'idle'
  | 'loading_ml'
  | 'preparing'
  | 'preprocessing'
  | 'creating_model'
  | 'training'
  | 'completed'
  | 'error'

/** Update prediction charts every N epochs (plus the final epoch). */
const CHART_UPDATE_INTERVAL = 5

function metricNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

/** Let the browser paint metric charts between epochs. */
function yieldToBrowser() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

export const useModelTraining = () => {
  const [model, setModel] = useState<LayersModel | null>(null)
  const [tfModule, setTfModule] = useState<TfModule | null>(null)
  const [isTraining, setIsTraining] = useState(false)
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [lossHistory, setLossHistory] = useState<number[]>([])
  const [validationLossHistory, setValidationLossHistory] = useState<number[]>([])
  const [maeHistory, setMAEHistory] = useState<number[]>([])
  const [validationMAEHistory, setValidationMAEHistory] = useState<number[]>([])
  const [trainingLogs, setTrainingLogs] = useState<string[]>([])
  const [currentPredictions, setCurrentPredictions] = useState<ModelPrediction[]>([])
  const [futurePredictions, setFuturePredictions] = useState<ModelPrediction[]>([])
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>('idle')
  const [statusDetail, setStatusDetail] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)

  const addLog = (log: string) => setTrainingLogs((prev) => [...prev, log])

  const trainModel = async (
    data: DataPoint[],
    trainPercentage: number,
    epochs: number,
    lookBack: number,
    learningRate: number,
    complexity: number,
    dropoutRate: number,
    forecastDays: number
  ) => {
    if (data.length === 0) {
      addLog('No data available — load a dataset first')
      setTrainingStatus('error')
      return
    }

    setTrainingStatus('loading_ml')
    setStatusDetail('First run downloads TensorFlow.js (~2–5 MB)')
    setIsTraining(true)
    setTrainingLogs([])
    setLossHistory([])
    setValidationLossHistory([])
    setMAEHistory([])
    setValidationMAEHistory([])
    setCurrentPredictions([])
    setFuturePredictions([])
    setCurrentEpoch(0)
    addLog('Starting…')

    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    let X: ReturnType<TfModule['tensor3d']> | null = null
    let y: ReturnType<TfModule['tensor2d']> | null = null

    try {
      const tf = await loadTensorFlow((message) => {
        setStatusDetail(message)
        addLog(message)
      })
      if (signal.aborted) throw new Error('Training aborted')

      setTfModule(tf)
      setTrainingStatus('preparing')
      setStatusDetail('Setting up training run')
      addLog('TensorFlow.js loaded')

      setTrainingStatus('preprocessing')
      setStatusDetail('Normalizing values and building sequences')
      addLog('Preprocessing data…')

      const { normalizedData } = preprocessData(data)
      ;[X, y] = createSequences(tf, normalizedData, lookBack)
      addLog(`Created ${X.shape[0]} training sequences`)

      const trainSize = Math.floor(X.shape[0] * (trainPercentage / 100))
      const XTrain = X.slice([0, 0, 0], [trainSize, -1, -1])
      const yTrain = y.slice([0, 0], [trainSize, -1])

      setTrainingStatus('creating_model')
      setStatusDetail('Building 2-layer LSTM')
      const newModel = createModel(tf, lookBack, complexity, dropoutRate, learningRate)
      addLog('Model created')

      setTrainingStatus('training')
      setStatusDetail(`Training for up to ${epochs} epochs`)
      addLog('Training started…')

      await newModel.fit(XTrain, yTrain, {
        epochs,
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: false,
        callbacks: {
          onEpochBegin: async () => {
            if (signal.aborted) {
              newModel.stopTraining = true
              addLog('Training stopped by user')
              throw new Error('Training aborted')
            }
          },
          onEpochEnd: async (epoch, logs) => {
            const epochNum = epoch + 1
            setCurrentEpoch(epochNum)
            addLog(`Epoch ${epochNum}/${epochs} completed`)

            if (logs?.loss != null)
              setLossHistory((prev) => [...prev, metricNumber(logs.loss)])
            if (logs?.val_loss != null)
              setValidationLossHistory((prev) => [...prev, metricNumber(logs.val_loss)])
            if (logs?.mae != null)
              setMAEHistory((prev) => [...prev, metricNumber(logs.mae)])
            if (logs?.val_mae != null)
              setValidationMAEHistory((prev) => [...prev, metricNumber(logs.val_mae)])

            await yieldToBrowser()

            const isLastEpoch = epochNum === epochs
            const shouldUpdateCharts =
              isLastEpoch || epochNum % CHART_UPDATE_INTERVAL === 0

            if (shouldUpdateCharts) {
              setStatusDetail(
                isLastEpoch
                  ? 'Finalizing predictions…'
                  : `Updating charts (epoch ${epochNum})`
              )
              const historical = runHistoricalPredictions(
                tf,
                newModel,
                data,
                lookBack,
                X,
                y
              )
              setCurrentPredictions(historical)
              const futurePreds = await predictFuture(
                tf,
                newModel,
                data,
                lookBack,
                forecastDays
              )
              setFuturePredictions(futurePreds)
            }
          },
        },
      })

      XTrain.dispose()
      yTrain.dispose()

      setModel(newModel)
      addLog('Training completed')
      setTrainingStatus('completed')
      setStatusDetail('Model ready — view charts below')
    } catch (error) {
      if ((error as Error).message === 'Training aborted') {
        addLog('Training stopped')
        setTrainingStatus('idle')
        setStatusDetail('Stopped by user')
      } else {
        addLog(`Error: ${(error as Error).message}`)
        setTrainingStatus('error')
        setStatusDetail((error as Error).message)
      }
    } finally {
      X?.dispose()
      y?.dispose()
      setIsTraining(false)
      abortControllerRef.current = null
    }
  }

  const handleStopTraining = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      addLog('Stop requested — finishing current step…')
    }
  }

  const resetTraining = () => {
    setModel(null)
    setIsTraining(false)
    setCurrentEpoch(0)
    setLossHistory([])
    setValidationLossHistory([])
    setMAEHistory([])
    setValidationMAEHistory([])
    setTrainingLogs([])
    setCurrentPredictions([])
    setFuturePredictions([])
    setTrainingStatus('idle')
    setStatusDetail(null)
  }

  return {
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
  }
}
