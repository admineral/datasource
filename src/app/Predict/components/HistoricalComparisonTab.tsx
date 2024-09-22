import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { DataType, CombinedDataPoint, ModelPrediction } from '../types'

interface HistoricalComparisonTabProps {
  dataType: DataType;
  combinedData: CombinedDataPoint[];
  futurePredictions: ModelPrediction[];
}

const HistoricalComparisonTab: React.FC<HistoricalComparisonTabProps> = ({ dataType, combinedData, futurePredictions }) => {
  const chartData = [
    ...combinedData,
    ...futurePredictions.map(fp => ({
      date: fp.date,
      futurePredicted: fp.predicted
    }))
  ]

  return (
    <Card className="bg-gray-800">
      <CardHeader>
        <CardTitle>Historical Data and Predictions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
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
              <Line type="monotone" dataKey="actual" stroke="#3B82F6" name="Actual" dot={false} />
              <Line type="monotone" dataKey="predicted" stroke="#10B981" name="Historical Prediction" dot={false} />
              <Line type="monotone" dataKey="futurePredicted" stroke="#F59E0B" name="Future Prediction" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default HistoricalComparisonTab