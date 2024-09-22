import { DataPoint } from '../types'

export const smoothData = (data: DataPoint[], windowSize: number): DataPoint[] => {
  const smoothedData: DataPoint[] = []
  for (let i = 0; i < data.length; i++) {
    const window = data.slice(Math.max(0, i - windowSize + 1), i + 1)
    const sum = window.reduce((acc, curr) => acc + curr.value, 0)
    const average = sum / window.length
    smoothedData.push({ date: data[i].date, value: average })
  }
  return smoothedData
}

export const removeOutliers = (data: DataPoint[], threshold: number): DataPoint[] => {
  const values = data.map(d => d.value)
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length)
  
  return data.filter(d => Math.abs(d.value - mean) <= threshold * stdDev)
}

export const interpolateMissingData = (data: DataPoint[]): DataPoint[] => {
  const interpolatedData: DataPoint[] = []
  for (let i = 0; i < data.length; i++) {
    interpolatedData.push(data[i])
    if (i < data.length - 1) {
      const currentDate = new Date(data[i].date)
      const nextDate = new Date(data[i + 1].date)
      const daysDiff = (nextDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
      
      if (daysDiff > 1) {
        for (let j = 1; j < daysDiff; j++) {
          const interpolatedDate = new Date(currentDate.getTime() + j * 24 * 60 * 60 * 1000)
          const interpolatedValue = data[i].value + (data[i + 1].value - data[i].value) * (j / daysDiff)
          interpolatedData.push({
            date: interpolatedDate.toISOString().split('T')[0],
            value: interpolatedValue
          })
        }
      }
    }
  }
  return interpolatedData
}

export const calculateReturns = (data: DataPoint[]): DataPoint[] => {
  const returns: DataPoint[] = []
  for (let i = 1; i < data.length; i++) {
    const returnValue = (data[i].value - data[i - 1].value) / data[i - 1].value
    returns.push({ date: data[i].date, value: returnValue })
  }
  return returns
}

export const normalizeData = (data: DataPoint[]): { normalizedData: DataPoint[], min: number, max: number } => {
  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const normalizedData = data.map(d => ({
    date: d.date,
    value: (d.value - min) / (max - min)
  }))
  return { normalizedData, min, max }
}

export const denormalizeData = (normalizedData: DataPoint[], min: number, max: number): DataPoint[] => {
  return normalizedData.map(d => ({
    date: d.date,
    value: d.value * (max - min) + min
  }))
}