// @ts-ignore

import { useState, useEffect, useRef } from 'react'
import * as tf from '@tensorflow/tfjs'
import { DataPoint, ModelPrediction } from '../types'
import { createModel, preprocessData, createSequences, denormalizeValue, predictFuture } from '../utils/modelUtils'

export type TrainingStatus = 'idle' | 'preparing' | 'preprocessing' | 'creating_model' | 'training' | 'completed' | 'error';

export const useModelTraining = () => {
  const [model, setModel] = useState<tf.LayersModel | null>(null)
  const [isTraining, setIsTraining] = useState(false)
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [lossHistory, setLossHistory] = useState<number[]>([])
  const [validationLossHistory, setValidationLossHistory] = useState<number[]>([])
  const [maeHistory, setMAEHistory] = useState<number[]>([])
  const [validationMAEHistory, setValidationMAEHistory] = useState<number[]>([])
  const [trainingLogs, setTrainingLogs] = useState<string[]>([])
  const [predictions, setPredictions] = useState<ModelPrediction[]>([])
  const [currentPredictions, setCurrentPredictions] = useState<ModelPrediction[]>([])
  const [futurePredictions, setFuturePredictions] = useState<ModelPrediction[]>([])
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>('idle')

  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    async function setupTf() {
      if (tf.getBackend() !== 'webgl') {
        try {
          await tf.setBackend('webgl')
          console.log('Using WebGL backend')
        } catch (e) {
          console.warn('WebGL backend not available, falling back to default', e)
        }
      }
    }
    setupTf()
  }, [])

  const addLog = (log: string) => setTrainingLogs(prev => [...prev, log])

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
    setTrainingStatus('preparing')
    setIsTraining(true)
    setTrainingLogs([])
    addLog('Initializing...')
    
    // Use setTimeout to allow the UI to update before starting the intensive computation
    setTimeout(async () => {
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      try {
        setTrainingStatus('preprocessing')
        const { normalizedData, minValue, maxValue } = preprocessData(data)
        addLog('Preprocessing data...')
        
        const [X, y] = createSequences(normalizedData, lookBack)
        addLog('Creating sequences...')

        const trainSize = Math.floor(X.shape[0] * (trainPercentage / 100))
        const XTrain = X.slice([0, 0, 0], [trainSize, -1, -1])
        const yTrain = y.slice([0, 0], [trainSize, -1])

        setTrainingStatus('creating_model')
        const newModel = createModel(lookBack, complexity, dropoutRate, learningRate)
        addLog('🏗️ Model created')

        setTrainingStatus('training')
        addLog('Starting model training...')
        await newModel.fit(XTrain, yTrain, {
          epochs: epochs,
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
              setCurrentEpoch(epoch + 1)
              addLog(`Epoch ${epoch + 1}/${epochs} completed`)
              if (logs?.loss) setLossHistory(prev => [...prev, logs.loss])
              if (logs?.val_loss) setValidationLossHistory(prev => [...prev, logs.val_loss])
              if (logs?.mae) setMAEHistory(prev => [...prev, logs.mae])
              if (logs?.val_mae) setValidationMAEHistory(prev => [...prev, logs.val_mae])

              tf.tidy(() => {
                const predictions = newModel.predict(X) as tf.Tensor
                const allPredictions = predictions.arraySync() as number[][]
                const allActuals = y.arraySync() as number[][]
                
                const newPredictions = allPredictions.map((pred, i) => ({
                  date: data[lookBack + i].date,
                  actual: denormalizeValue(allActuals[i][0], minValue, maxValue),
                  predicted: denormalizeValue(pred[0], minValue, maxValue),
                  modelName: 'LSTM'
                }))
                
                setCurrentPredictions(newPredictions)
              })

              // Update future predictions after each epoch
              const futurePreds = await predictFuture(newModel, data, lookBack, forecastDays)
              setFuturePredictions(futurePreds)
            }
          }
        })

        addLog('Training completed')
        setModel(newModel)
        setPredictions(currentPredictions)
        addLog('✨ Training process completed')
        setTrainingStatus('completed')
      } catch (error) {
        if ((error as Error).message !== 'Training aborted') {
          addLog(`❌ Error during training: ${(error as Error).message}`)
        }
        setTrainingStatus('error')
      } finally {
        setIsTraining(false)
        abortControllerRef.current = null
      }
    }, 0)
  }

  const handleStopTraining = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      addLog('Training stop requested by user')
    }
    resetTraining()
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
    setPredictions([])
    setCurrentPredictions([])
    setFuturePredictions([])
  }

  return {
    model,
    isTraining,
    currentEpoch,
    lossHistory,
    validationLossHistory,
    maeHistory,
    validationMAEHistory,
    trainingLogs, // Make sure this is included
    trainModel,
    handleStopTraining,
    currentPredictions,
    resetTraining,
    futurePredictions,
    setFuturePredictions,
    trainingStatus,
  }
}