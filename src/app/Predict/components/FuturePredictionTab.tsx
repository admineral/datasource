'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { DataType, ModelPrediction, CombinedDataPoint } from '../types'
import * as tf from '@tensorflow/tfjs'

interface FuturePredictionTabProps {
  dataType: DataType
  forecastDays: number
  setForecastDays: (days: number) => void
  handlePredictFuture: () => Promise<void>
  model: tf.LayersModel | null
  combinedData: CombinedDataPoint[]
  futurePredictions: ModelPrediction[]
}

const FuturePredictionTab: React.FC<FuturePredictionTabProps> = ({
  dataType,
  forecastDays,
  setForecastDays,
  handlePredictFuture,
  model,
  combinedData,
  futurePredictions
}) => {
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  const handlePredictClick = async () => {
    setIsPredicting(true);
    setPredictionError(null);
    try {
      await handlePredictFuture();
    } catch (error) {
      setPredictionError('Failed to generate prediction. Please try again.');
    } finally {
      setIsPredicting(false);
    }
  };

  const chartData = useMemo(() => [...combinedData, ...futurePredictions], [combinedData, futurePredictions]);

  return (
    <Card className="bg-gray-800">
      <CardHeader>
        <CardTitle>Future {dataType.charAt(0).toUpperCase() + dataType.slice(1)} Predictions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4">
          <Input 
            type="number" 
            value={forecastDays} 
            onChange={(e) => setForecastDays(Math.max(1, Math.min(365, parseInt(e.target.value) || 1)))}
            className="bg-gray-700 w-24"
            min="1"
            max="365"
            aria-label={`Number of days to forecast, current value: ${forecastDays}`}
          />
          <span>days</span>
          <Button 
            onClick={handlePredictClick} 
            disabled={!model || isPredicting}
            aria-busy={isPredicting}
          >
            {isPredicting ? 'Predicting...' : 'Predict Future'}
          </Button>
        </div>
        {predictionError && (
          <div className="text-red-500 mb-4" role="alert">
            {predictionError}
          </div>
        )}
        <div className="h-[400px]" aria-label={`Chart showing ${dataType} predictions`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis 
                stroke="#9CA3AF" 
                label={{ value: dataType.charAt(0).toUpperCase() + dataType.slice(1), angle: -90, position: 'insideLeft' }}
              />
              <RechartsTooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="actual" stroke="#3B82F6" name="Historical" dot={false} />
              <Line type="monotone" dataKey="predicted" stroke="#10B981" name="LSTM Prediction" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default FuturePredictionTab