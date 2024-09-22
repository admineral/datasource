import React from 'react'
import { Progress } from "@/components/ui/progress"

interface TrainingProgressProps {
  currentEpoch: number
  totalEpochs: number
}

const TrainingProgress: React.FC<TrainingProgressProps> = ({ currentEpoch, totalEpochs }) => (
  <div className="bg-gray-800 p-4 rounded-lg mt-4">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium">Training Progress</span>
      <span className="text-sm text-gray-400">{currentEpoch} / {totalEpochs} epochs</span>
    </div>
    <Progress value={(currentEpoch / totalEpochs) * 100} className="w-full" />
  </div>
)

export default TrainingProgress