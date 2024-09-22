// src/charts/AvgPriceChart.tsx

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AvgPriceChartProps {
  data: any[];
  chartType: string;
  isByYear: boolean;
  selectedYears: number[];
  yearColors: { [key: number]: string };
  isInRow: boolean;
  totalColor: string;
}

const AvgPriceChart: React.FC<AvgPriceChartProps> = ({
  data,
  chartType,
  isByYear,
  selectedYears,
  yearColors,
  isInRow,
  totalColor,
}) => {
  if (chartType === 'Line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="period" stroke="#9CA3AF" />
          <YAxis
            tickFormatter={(value: number) => `$${value.toFixed(2)}`}
            stroke="#9CA3AF"
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `$${value.toFixed(2)}`,
              isInRow
                ? 'Total Price'
                : isByYear
                ? selectedYears.length > 1
                  ? `Year ${name}`
                  : 'Avg Price'
                : 'Avg Price',
            ]}
            contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
          />
          {isByYear ? (
            selectedYears.map((year) => (
              <Line
                key={year}
                type="monotone"
                dataKey={year.toString()}
                stroke={yearColors[year]}
                dot={false}
              />
            ))
          ) : (
            <Line
              type="monotone"
              dataKey="average"
              stroke="#3B82F6"
              dot={false}
            />
          )}
          {isByYear && selectedYears.length > 1 && <Legend />}
          {isByYear && isInRow && (
            <Line
              type="monotone"
              dataKey="average"
              stroke={totalColor}
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  } else if (chartType === 'Bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="period" stroke="#9CA3AF" />
          <YAxis
            tickFormatter={(value: number) => `$${value.toFixed(2)}`}
            stroke="#9CA3AF"
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `$${value.toFixed(2)}`,
              isInRow
                ? 'Total Price'
                : isByYear
                ? selectedYears.length > 1
                  ? `Year ${name}`
                  : 'Avg Price'
                : 'Avg Price',
            ]}
            contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
          />
          {isByYear ? (
            selectedYears.map((year) => (
              <Bar
                key={year}
                dataKey={year.toString()}
                fill={yearColors[year]}
              />
            ))
          ) : (
            <Bar dataKey="average" fill="#3B82F6" />
          )}
          {isByYear && selectedYears.length > 1 && <Legend />}
          {isByYear && isInRow && (
            <Bar dataKey="average" fill={totalColor} />
          )}
        </BarChart>
      </ResponsiveContainer>
    );
  } else if (chartType === 'Area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient
              id="colorAvgPrice"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="period" stroke="#9CA3AF" />
          <YAxis
            tickFormatter={(value: number) => `$${value.toFixed(2)}`}
            stroke="#9CA3AF"
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `$${value.toFixed(2)}`,
              'Avg Price',
            ]}
            contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
          />
          <Area
            type="monotone"
            dataKey="average"
            stroke="#82ca9d"
            fillOpacity={1}
            fill="url(#colorAvgPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  } else {
    return null;
  }
};

export default AvgPriceChart;
