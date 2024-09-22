import React from "react";
import styles from "./chart-widget.module.css";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ChartData {
  label: string;
  value: number;
}

interface ChartWidgetProps {
  chartData: ChartData[];
  isEmpty: boolean;
  isDarkTheme?: boolean;
  chartType: 'line' | 'bar' | 'pie';
  title?: string;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({
  chartData = [],
  isEmpty = true,
  isDarkTheme = false,
  chartType = 'line',
  title = '',
}) => {
  const themeClass = isDarkTheme ? styles.darkTheme : styles.lightTheme;

  if (isEmpty) {
    return (
      <div className={`${styles.chartWidget} ${styles.chartEmptyState} ${themeClass}`}>
        <div className={styles.chartWidgetData}>
          <p>No chart data available</p>
          <p>Try: &ldquo;Show me sales data for the last 30 days&rdquo;</p>
        </div>
      </div>
    );
  }

  const chartColors = isDarkTheme
    ? { grid: "#374151", text: "#9CA3AF", line: "#3B82F6" }
    : { grid: "#e5e7eb", text: "#6b7280", line: "#3b82f6" };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="label" stroke={chartColors.text} />
            <YAxis stroke={chartColors.text} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkTheme ? '#1F2937' : 'white', 
                border: `1px solid ${chartColors.grid}`,
                color: isDarkTheme ? 'white' : '#111827'
              }}
              itemStyle={{ color: isDarkTheme ? 'white' : '#111827' }}
            />
            <Line type="monotone" dataKey="value" stroke={chartColors.line} strokeWidth={2} dot={false} />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="label" stroke={chartColors.text} />
            <YAxis stroke={chartColors.text} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkTheme ? '#1F2937' : 'white', 
                border: `1px solid ${chartColors.grid}`,
                color: isDarkTheme ? 'white' : '#111827'
              }}
              itemStyle={{ color: isDarkTheme ? 'white' : '#111827' }}
            />
            <Bar dataKey="value" fill={chartColors.line} />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkTheme ? '#1F2937' : 'white', 
                border: `1px solid ${chartColors.grid}`,
                color: isDarkTheme ? 'white' : '#111827'
              }}
              itemStyle={{ color: isDarkTheme ? 'white' : '#111827' }}
            />
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.chartWidget} ${themeClass}`}>
      {title && <h2 className={styles.chartTitle}>{title}</h2>}
      <div className={styles.chartWidgetData}>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart() || <div>No chart data available</div>}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartWidget;