// src/charts/TotalSalesChart.tsx

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

interface TotalSalesChartProps {
  data: any[];
  chartType: string;
  isByYear: boolean;
  selectedYears: number[];
  yearColors: { [key: number]: string };
  isInRow: boolean;
  totalColor: string;
}

const TotalSalesChart: React.FC<TotalSalesChartProps> = ({
  data,
  chartType,
  isByYear,
  selectedYears,
  yearColors,
  isInRow,
  totalColor,
}) => {
  if (chartType === 'Bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="period" stroke="#9CA3AF" />
          <YAxis
            tickFormatter={(value: number) => value.toString()}
            stroke="#9CA3AF"
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value}`,
              isInRow
                ? 'Total Sales'
                : isByYear
                ? selectedYears.length > 1
                  ? `Year ${name}`
                  : 'Units Sold'
                : 'Units Sold',
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
            <Bar dataKey="total" fill="#10B981" />
          )}
          {isByYear && selectedYears.length > 1 && <Legend />}
          {isByYear && isInRow && (
            <Bar dataKey="total" fill={totalColor} />
          )}
        </BarChart>
      </ResponsiveContainer>
    );
  } else if (chartType === 'Line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="period" stroke="#9CA3AF" />
          <YAxis
            tickFormatter={(value: number) => value.toString()}
            stroke="#9CA3AF"
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value}`,
              isInRow
                ? 'Total Sales'
                : isByYear
                ? selectedYears.length > 1
                  ? `Year ${name}`
                  : 'Units Sold'
                : 'Units Sold',
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
              dataKey="total"
              stroke="#10B981"
              dot={false}
            />
          )}
          {isByYear && selectedYears.length > 1 && <Legend />}
          {isByYear && isInRow && (
            <Line
              type="monotone"
              dataKey="total"
              stroke={totalColor}
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  } else if (chartType === 'Area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="period" stroke="#9CA3AF" />
          <YAxis
            tickFormatter={(value: number) => value.toString()}
            stroke="#9CA3AF"
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value}`,
              'Units Sold',
            ]}
            contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorSales)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  } else {
    return null;
  }
};

export default TotalSalesChart;
