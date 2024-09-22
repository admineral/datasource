import React, { useRef, useEffect } from 'react'

interface TrainingLogsProps {
  logs: string[]
}

const TrainingLogs: React.FC<TrainingLogsProps> = ({ logs }) => {
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-4 h-64 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-2">Training Logs</h3>
      {logs.map((log, index) => (
        <div key={index} className="text-sm text-gray-300 font-mono">
          {log}
        </div>
      ))}
      <div ref={logsEndRef} />
    </div>
  )
}

export default TrainingLogs