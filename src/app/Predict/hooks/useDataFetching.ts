import { useState, useEffect, useCallback } from 'react'
import { DataPoint, DataType } from '../types'

export const useDataFetching = (dataType: DataType) => {
  const [data, setData] = useState<DataPoint[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/data?type=${dataType}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      if (!Array.isArray(result.data) || result.data.length === 0) {
        throw new Error('Invalid or empty data received')
      }
      setData(result.data)
      setError(null)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(`Error fetching data: ${(error as Error).message}`)
    }
  }, [dataType])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, error, refetch: fetchData }
}