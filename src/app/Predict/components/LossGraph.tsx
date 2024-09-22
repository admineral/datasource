import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'

interface LossGraphProps {
  lossHistory: number[]
  validationLossHistory: number[]
}

const LossGraph: React.FC<LossGraphProps> = ({ lossHistory, validationLossHistory }) => (
  <div className="bg-gray-800 p-4 rounded-lg mt-4">
    <h3 className="text-lg font-semibold mb-2">Training and Validation Loss</h3>
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={lossHistory.map((loss, epoch) => ({ epoch, loss, val_loss: validationLossHistory[epoch] }))}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="epoch" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <RechartsTooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
          <Legend />
          <Line type="monotone" dataKey="loss" stroke="#EF4444" name="Training Loss" dot={false} />
          <Line type="monotone" dataKey="val_loss" stroke="#3B82F6" name="Validation Loss" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
)

export default LossGraph