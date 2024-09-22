import React from 'react'
import { Progress } from "@/components/ui/progress"

interface TrainingSummaryProps {
  currentEpoch: number
  totalEpochs: number
  lastLoss: number | null
  lastValidationLoss: number | null
  lastMAE: number | null
  lastValidationMAE: number | null
}

const TrainingSummary: React.FC<TrainingSummaryProps> = ({
  currentEpoch,
  totalEpochs,
  lastLoss,
  lastValidationLoss,
  lastMAE,
  lastValidationMAE
}) => (
  <div className="bg-gray-800 p-4 rounded-lg mt-4">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium">Training Progress</span>
      <span className="text-sm text-gray-400">{currentEpoch} / {totalEpochs} epochs</span>
    </div>
    <Progress value={(currentEpoch / totalEpochs) * 100} className="w-full mb-4" />
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div>Loss: {lastLoss?.toFixed(4) || 'N/A'}</div>
      <div>Val Loss: {lastValidationLoss?.toFixed(4) || 'N/A'}</div>
      <div>MAE: {lastMAE?.toFixed(4) || 'N/A'}</div>
      <div>Val MAE: {lastValidationMAE?.toFixed(4) || 'N/A'}</div>
    </div>
  </div>
)

export default TrainingSummary