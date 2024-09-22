import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'

interface MAEGraphProps {
  maeHistory: number[]
  validationMAEHistory: number[]
}

const MAEGraph: React.FC<MAEGraphProps> = ({ maeHistory, validationMAEHistory }) => (
  <div className="bg-gray-800 p-4 rounded-lg mt-4">
    <h3 className="text-lg font-semibold mb-2">Training and Validation MAE</h3>
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={maeHistory.map((mae, epoch) => ({ epoch, mae, val_mae: validationMAEHistory[epoch] }))}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="epoch" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <RechartsTooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
          <Legend />
          <Line type="monotone" dataKey="mae" stroke="#10B981" name="Training MAE" dot={false} />
          <Line type="monotone" dataKey="val_mae" stroke="#F59E0B" name="Validation MAE" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
)

export default MAEGraph