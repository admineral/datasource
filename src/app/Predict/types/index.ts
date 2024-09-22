export type DataType = 'sales' | 'price'

export interface DataPoint {
  date: string
  value: number
}

export interface ModelPrediction {
  date: string
  actual?: number
  predicted: number
  modelName: string
}

export interface HistoricalDataPoint {
  date: string
  actual: number
}

export type CombinedDataPoint = ModelPrediction | HistoricalDataPoint