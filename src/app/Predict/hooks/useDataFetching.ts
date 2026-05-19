import { useState, useEffect, useCallback } from 'react'
import { DataPoint, DataType } from '../types'

export const useDataFetching = (dataType: DataType) => {
  const [data, setData] = useState<DataPoint[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
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
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(`Error fetching data: ${(err as Error).message}`)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [dataType])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return { data, error, isLoading, refetch: fetchData }
}
