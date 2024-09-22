import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DataType } from '../types'

interface DataSelectionCardProps {
  dataType: DataType
  setDataType: (value: DataType) => void
  trainPercentage: number
  setTrainPercentage: (value: number) => void
  epochs: number
  setEpochs: (value: number) => void
  lookBack: number
  setLookBack: (value: number) => void
  learningRate: number
  setLearningRate: (value: number) => void
  complexity: number
  setComplexity: (value: number) => void
  dropoutRate: number
  setDropoutRate: (value: number) => void
  showAdvancedOptions: boolean
  setShowAdvancedOptions: (value: boolean) => void
}

const DataSelectionCard: React.FC<DataSelectionCardProps> = ({
  dataType,
  setDataType,
  trainPercentage,
  setTrainPercentage,
  epochs,
  setEpochs,
  lookBack,
  setLookBack,
  learningRate,
  setLearningRate,
  complexity,
  setComplexity,
  dropoutRate,
  setDropoutRate,
  showAdvancedOptions,
  setShowAdvancedOptions
}) => {
  return (
    <Card className="bg-gray-800">
      <CardHeader>
        <CardTitle>Data Selection and Model Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Data Type</label>
            <Select onValueChange={(value: DataType) => setDataType(value)} defaultValue={dataType}>
              <SelectTrigger className="bg-gray-700">
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700">
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="price">Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Training Data Percentage</label>
            <Slider
              value={[trainPercentage]}
              onValueChange={(value) => setTrainPercentage(value[0] ?? trainPercentage)}
              max={95}
              min={50}
              step={5}
            />
            <span>{trainPercentage}%</span>
          </div>
          
          <TooltipProvider>
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <label className="block text-sm font-medium mb-2 cursor-help">Epochs</label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of complete passes through the training dataset. More epochs can lead to better learning but may cause overfitting.</p>
                  <p className="mt-2 font-semibold">Recommended range: 10-200</p>
                </TooltipContent>
              </Tooltip>
              <Input 
                type="number" 
                value={epochs} 
                onChange={(e) => setEpochs(parseInt(e.target.value))}
                min="10"
                max="200"
                className="bg-gray-700"
              />
            </div>

            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <label className="block text-sm font-medium mb-2 cursor-help">Look Back (days)</label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of previous time steps to consider for making a prediction. Affects the model&apos;s ability to capture long-term dependencies.</p>
                  <p className="mt-2 font-semibold">Recommended range: 1-30 days</p>
                </TooltipContent>
              </Tooltip>
              <Input 
                type="number" 
                value={lookBack} 
                onChange={(e) => setLookBack(parseInt(e.target.value))}
                min="1"
                max="30"
                className="bg-gray-700"
              />
            </div>

            <Button 
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              variant="outline"
              className="w-full"
            >
              {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </Button>

            {showAdvancedOptions && (
              <>
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label className="block text-sm font-medium mb-2 cursor-help">Learning Rate</label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Step size at each iteration while moving toward a minimum of the loss function. Smaller values may lead to more precise optimization but slower training.</p>
                      <p className="mt-2 font-semibold">Recommended range: 0.0001-0.1</p>
                    </TooltipContent>
                  </Tooltip>
                  <Input 
                    type="number" 
                    value={learningRate} 
                    onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                    step="0.0001"
                    min="0.0001"
                    max="0.1"
                    className="bg-gray-700"
                  />
                </div>

                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label className="block text-sm font-medium mb-2 cursor-help">Model Complexity (LSTM units)</label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Number of units in the LSTM layer. Higher values increase the model&apos;s capacity to learn complex patterns but may lead to overfitting.</p>
                      <p className="mt-2 font-semibold">Recommended range: 16-256</p>
                    </TooltipContent>
                  </Tooltip>
                  <Input 
                    type="number" 
                    value={complexity} 
                    onChange={(e) => setComplexity(parseInt(e.target.value))}
                    min="16"
                    max="256"
                    step="16"
                    className="bg-gray-700"
                  />
                </div>

                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label className="block text-sm font-medium mb-2 cursor-help">Dropout Rate</label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Fraction of input units to drop during training. Helps prevent overfitting by reducing interdependent learning between neurons.</p>
                      <p className="mt-2 font-semibold">Recommended range: 0-0.5</p>
                    </TooltipContent>
                  </Tooltip>
                  <Input 
                    type="number" 
                    value={dropoutRate} 
                    onChange={(e) => setDropoutRate(parseFloat(e.target.value))}
                    step="0.1"
                    min="0"
                    max="0.5"
                    className="bg-gray-700"
                  />
                </div>
              </>
            )}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  )
}

export default DataSelectionCard