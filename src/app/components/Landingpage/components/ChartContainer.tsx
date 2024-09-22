// src/components/ChartContainer.tsx

import React from 'react';

interface ChartContainerProps {
  title: string;
  data: any[];
  loadingStatus: string;
  children: React.ReactNode;
  chartType: string;
  setChartType: (type: string) => void;
  availableChartTypes: string[];
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  data,
  loadingStatus,
  children,
  chartType,
  setChartType,
  availableChartTypes,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-200">{title}</h3>
        {/* Chart Type Selector */}
        {availableChartTypes.length > 1 && (
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-3 py-1 bg-gray-700 text-gray-200 rounded"
          >
            {availableChartTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        )}
      </div>
      {data.length > 0 ? (
        <div className="w-full h-96">
          {children || <div>No valid chart element provided</div>}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-400">{loadingStatus}</p>
        </div>
      )}
    </div>
  );
};

export default ChartContainer;
