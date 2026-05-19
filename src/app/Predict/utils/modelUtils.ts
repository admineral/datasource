import type { LayersModel } from '@tensorflow/tfjs'
import type { TfModule } from './tensorflow'
import { DataPoint, ModelPrediction } from '../types'

export const createModel = (
  tf: TfModule,
  lookBack: number,
  complexity: number,
  dropoutRate: number,
  learningRate: number
) => {
  const model = tf.sequential()
  model.add(
    tf.layers.lstm({
      units: complexity,
      inputShape: [lookBack, 1],
      returnSequences: true,
      activation: 'tanh',
    })
  )
  model.add(tf.layers.dropout({ rate: dropoutRate }))
  model.add(
    tf.layers.lstm({
      units: Math.floor(complexity / 2),
      returnSequences: false,
      activation: 'tanh',
    })
  )
  model.add(tf.layers.dropout({ rate: dropoutRate }))
  model.add(tf.layers.dense({ units: 1 }))

  const optimizer = tf.train.adam(learningRate)
  model.compile({
    optimizer,
    loss: 'meanSquaredError',
    metrics: ['mae'],
  })
  return model
}

export const createSequences = (tf: TfModule, data: number[], lookBack: number) => {
  const X: number[][][] = []
  const y: number[][] = []
  for (let i = lookBack; i < data.length; i++) {
    X.push(data.slice(i - lookBack, i).map((value) => [value]))
    y.push([data[i]!])
  }
  return [tf.tensor3d(X), tf.tensor2d(y)] as const
}

export const predictFuture = async (
  tf: TfModule,
  model: LayersModel,
  data: DataPoint[],
  lookBack: number,
  forecastDays: number
): Promise<ModelPrediction[]> => {
  const { normalizedData, minValue, maxValue } = preprocessData(data)
  let input = normalizedData.slice(-lookBack).map((value) => [value])

  const futurePreds: ModelPrediction[] = []

  tf.tidy(() => {
    for (let i = 0; i < forecastDays; i++) {
      const inputTensor = tf.tensor3d([input])
      const prediction = model.predict(inputTensor) as ReturnType<TfModule['tensor']>
      const predValue = prediction.dataSync()[0]!

      const date = new Date(data[data.length - 1]!.date)
      date.setDate(date.getDate() + i + 1)

      futurePreds.push({
        date: date.toISOString().split('T')[0]!,
        predicted: denormalizeValue(predValue, minValue, maxValue),
        modelName: 'LSTM',
      })

      input = [...input.slice(1), [predValue]]
    }
  })

  return futurePreds
}

export const runHistoricalPredictions = (
  tf: TfModule,
  model: LayersModel,
  data: DataPoint[],
  lookBack: number,
  X: ReturnType<TfModule['tensor3d']>,
  y: ReturnType<TfModule['tensor2d']>
): ModelPrediction[] => {
  return tf.tidy(() => {
    const predictions = model.predict(X) as ReturnType<TfModule['tensor']>
    const allPredictions = predictions.arraySync() as number[][]
    const allActuals = y.arraySync() as number[][]
    const { minValue, maxValue } = preprocessData(data)

    return allPredictions.map((pred, i) => ({
      date: data[lookBack + i]!.date,
      actual: denormalizeValue(allActuals[i]![0]!, minValue, maxValue),
      predicted: denormalizeValue(pred[0]!, minValue, maxValue),
      modelName: 'LSTM',
    }))
  })
}

export const preprocessData = (data: DataPoint[]) => {
  const values = data.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  return {
    normalizedData: values.map((v) => (v - minValue) / (maxValue - minValue)),
    minValue,
    maxValue,
  }
}

export const denormalizeValue = (
  normalizedValue: number,
  minValue: number,
  maxValue: number
) => normalizedValue * (maxValue - minValue) + minValue
