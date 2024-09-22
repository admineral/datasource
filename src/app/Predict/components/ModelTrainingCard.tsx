'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ModelTrainingCardProps {
  isTraining: boolean
  currentEpoch: number
  epochs: number
  lossHistory: number[]
  validationLossHistory: number[]
  maeHistory: number[]
  validationMAEHistory: number[]
  handleTrainModel: () => void
  handleStopTraining: () => void
  trainingStatus: 'idle' | 'preparing' | 'preprocessing' | 'creating_model' | 'training' | 'completed' | 'error'
  trainingLogs: string[]
}

export default function ModelTrainingCard({
  isTraining,
  currentEpoch,
  epochs,
  lossHistory,
  validationLossHistory,
  maeHistory,
  validationMAEHistory,
  handleTrainModel,
  handleStopTraining,
  trainingStatus,
  trainingLogs,
}: ModelTrainingCardProps) {
  const chartData = lossHistory.map((loss, index) => ({
    epoch: index + 1,
    loss,
    validationLoss: validationLossHistory[index],
    mae: maeHistory[index],
    validationMAE: validationMAEHistory[index]
  }))

  const renderStatusMessage = () => {
    switch (trainingStatus) {
      case 'preparing':
        return <p className="text-yellow-400">Preparing for training...</p>
      case 'preprocessing':
        return <p className="text-yellow-400">Preprocessing data...</p>
      case 'creating_model':
        return <p className="text-yellow-400">Creating model architecture...</p>
      case 'training':
        return <p className="text-green-400">Training in progress...</p>
      case 'completed':
        return <p className="text-green-500">Training completed!</p>
      case 'error':
        return <p className="text-red-500">An error occurred during training.</p>
      default:
        return null
    }
  }

  return (
    <Card className="bg-gray-800 text-white">
      <CardHeader>
        <CardTitle>Model Training</CardTitle>
      </CardHeader>
      <CardContent>
        {trainingStatus === 'idle' && (
          <Button onClick={handleTrainModel} className="bg-blue-500 hover:bg-blue-600">
            Train Model
          </Button>
        )}
        {renderStatusMessage()}
        {trainingStatus === 'training' && (
          <>
            <Button onClick={handleStopTraining} className="bg-red-500 hover:bg-red-600 mt-2">
              Stop Training
            </Button>
            <div className="mt-4">
              <p>Progress: {currentEpoch} / {epochs} epochs</p>
              <Progress value={(currentEpoch / epochs) * 100} className="mt-2" />
            </div>
          </>
        )}
        {chartData.length > 0 && (
          <>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Loss</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="epoch" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="loss" stroke="#8884d8" />
                  <Line type="monotone" dataKey="validationLoss" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Mean Absolute Error</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="epoch" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="mae" stroke="#8884d8" />
                  <Line type="monotone" dataKey="validationMAE" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        {trainingStatus !== 'idle' && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Training Logs:</h3>
            <div className="bg-gray-700 p-4 rounded-lg max-h-60 overflow-y-auto">
              {trainingLogs.map((log, index) => (
                <p key={index} className="text-sm">{log}</p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}