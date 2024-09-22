// src/components/DataInsights.tsx

'use client';

import React, { useContext, useMemo } from 'react';
import { FaChartLine, FaShoppingCart, FaChartArea } from 'react-icons/fa';
import { track } from '@vercel/analytics';
import {
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  AreaChart,
  Area,
  ReferenceLine,
  Label,
  ResponsiveContainer,
} from 'recharts';
import DashboardCard from './DashboardCard';
import ChartContainer from './ChartContainer';
import AvgPriceChart from '../charts/AvgPriceChart';
import TotalSalesChart from '../charts/TotalSalesChart';
import {
  AggregatedData,
  processTotalAverageData,
  processTotalSumData,
  processDataByYear,
  mergeTotalData,
} from '../utils/dataProcessing';
import { DashboardContext } from './DashboardContext';

// Define the custom tick component
const CustomizedAxisTick = (props: any): React.ReactElement<SVGElement> => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16} // Adjusts the vertical position
        textAnchor="end"
        fill="#9CA3AF"
        transform="rotate(-45)" // Rotates the text
      >
        {payload.value}
      </text>
    </g>
  );
};

const DataInsights: React.FC = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <p className="text-red-500 text-lg">Error loading dashboard context.</p>
      </div>
    );
  }

  const {
    priceData,
    salesData,
    availableYears,
    selectedYears,
    viewMode,
    timeGranularity,
    inRowView,
    loadingStatus,
    error,
    setTimeGranularity,
    setInRowView,
    toggleViewMode,
    toggleYear,
  } = context;

  // Chart Type States
  const [avgPriceChartType, setAvgPriceChartType] = React.useState<string>('Line');
  const [totalSalesChartType, setTotalSalesChartType] = React.useState<string>('Bar');
  const [composedChartType, setComposedChartType] = React.useState<string>('Composed');
  const [areaChartType, setAreaChartType] = React.useState<string>('Area');

  // Color Palette
  const colorPalette = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F472B6', // Pink
    '#EC4899', // Dark Pink
    '#6366F1', // Indigo
  ];

  // Assign colors to selected years
  const yearColors: { [key: number]: string } = {};
  selectedYears.forEach((year, index) => {
    yearColors[year] = colorPalette[index % colorPalette.length];
  });
  // Assign a color for Total
  const totalColor = '#FFFFFF'; // White or any desired color

  // Determine if in Total View
  const isTotalView = viewMode === 'Total';

  // Memoized Processed Data
  const processedTotalPriceData = useMemo(
    () =>
      processTotalAverageData(
        priceData,
        timeGranularity,
        availableYears,
        false // Exclude year in period in Total View
      ),
    [priceData, timeGranularity, availableYears]
  );
  const processedTotalSalesData = useMemo(
    () =>
      processTotalSumData(
        salesData,
        timeGranularity,
        false // Exclude year in period in Total View
      ),
    [salesData, timeGranularity]
  );
  const processedPriceDataByYear = useMemo(
    () => processDataByYear(priceData, timeGranularity, selectedYears, 'price'),
    [priceData, timeGranularity, selectedYears]
  );
  const processedSalesDataByYear = useMemo(
    () => processDataByYear(salesData, timeGranularity, selectedYears, 'sales'),
    [salesData, timeGranularity, selectedYears]
  );
  const processedTotalInRowPriceData = useMemo(
    () =>
      processTotalAverageData(
        priceData,
        timeGranularity,
        availableYears,
        false // Exclude year in period
      ),
    [priceData, timeGranularity, availableYears]
  );
  const processedTotalInRowSalesData = useMemo(
    () =>
      processTotalSumData(
        salesData,
        timeGranularity,
        false // Exclude year in period
      ),
    [salesData, timeGranularity]
  );

  // Combined Data for ComposedChart
  const composedChartData = useMemo(() => {
    // Merge price and sales data based on period
    return processedTotalPriceData.map((priceItem) => {
      const salesItem = processedTotalSalesData.find(
        (item) => item.period === priceItem.period
      ) || { total: 0 };
      return {
        period: priceItem.period,
        averagePrice: priceItem.average,
        totalSales: (salesItem as { total?: number }).total || 0,
      };
    });
  }, [processedTotalPriceData, processedTotalSalesData]);

  // Median of average prices for AreaChartFillByValue
  const medianPrice = useMemo(() => {
    const prices = processedTotalPriceData.map((item) => item.average);
    prices.sort((a, b) => a - b);
    const mid = Math.floor(prices.length / 2);
    return prices.length % 2 !== 0
      ? prices[mid]
      : (prices[mid - 1] + prices[mid]) / 2;
  }, [processedTotalPriceData]);

  // Calculate Overall Metrics
  const overallAveragePrice = useMemo(() => {
    const data = processedTotalPriceData;
    const total = data.reduce((acc, item) => acc + (item.average || 0), 0);
    const count = data.length;
    return count > 0 ? (total / count).toFixed(2) : '0.00';
  }, [processedTotalPriceData]);

  const overallTotalSales = useMemo(() => {
    const data = processedTotalSalesData;
    const total = data.reduce((acc, item) => acc + (item.total || 0), 0);
    return total.toString();
  }, [processedTotalSalesData]);

  // Determine Data to Display
  const isByYear = viewMode === 'ByYear';
  const isInRow = inRowView && isByYear;

  let priceDataToDisplay: AggregatedData[] = [];
  let salesDataToDisplay: AggregatedData[] = [];

  if (isByYear) {
    priceDataToDisplay = processedPriceDataByYear;
    salesDataToDisplay = processedSalesDataByYear;
    if (isInRow) {
      priceDataToDisplay = mergeTotalData(
        priceDataToDisplay,
        processedTotalInRowPriceData,
        'average'
      );
      salesDataToDisplay = mergeTotalData(
        salesDataToDisplay,
        processedTotalInRowSalesData,
        'total'
      );
    }
  } else {
    priceDataToDisplay = processedTotalPriceData;
    salesDataToDisplay = processedTotalSalesData;
  }

  // Handle Error State
  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-6 text-white">
        Data Insights Dashboard
      </h2>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          icon={<FaChartLine />}
          title="Average Price"
          value={`${
            isByYear
              ? isInRow
                ? (
                    Number(
                      processedTotalInRowPriceData[
                        processedTotalInRowPriceData.length - 1
                      ]?.average
                    ).toFixed(2) || '0.00'
                  )
                : selectedYears.length > 1
                ? 'Multiple'
                : (
                    Number(
                      processedPriceDataByYear[
                        processedPriceDataByYear.length - 1
                      ]?.[selectedYears[0]]
                    ).toFixed(2) || '0.00'
                  )
              : overallAveragePrice
          }`}
        />
        <DashboardCard
          icon={<FaShoppingCart />}
          title="Total Sales"
          value={`${
            isByYear
              ? isInRow
                ? (
                    processedTotalInRowSalesData[
                      processedTotalInRowSalesData.length - 1
                    ]?.total || '0'
                  )
                : selectedYears.length > 1
                ? 'Multiple'
                : (
                    processedSalesDataByYear[
                      processedSalesDataByYear.length - 1
                    ]?.[selectedYears[0]]?.toString() || '0'
                  )
              : overallTotalSales
          }`}
        />
        <DashboardCard
          icon={<FaChartArea />}
          title="Median Price"
          value={`$${medianPrice.toFixed(2)}`}
        />
      </div>

      {/* Interactive Controls */}
      <div className="flex flex-wrap gap-4 mb-8">
        {/* View Mode Toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => toggleViewMode('Total')}
            className={`px-4 py-2 rounded-full border ${
              viewMode === 'Total'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-gray-700 text-gray-300 border-gray-600'
            } focus:outline-none transition`}
          >
            Total View
          </button>
          <button
            onClick={() => toggleViewMode('ByYear')}
            className={`px-4 py-2 rounded-full border ${
              viewMode === 'ByYear'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-gray-700 text-gray-300 border-gray-600'
            } focus:outline-none transition`}
          >
            By Year View
          </button>
        </div>

        {/* In-Row View Toggle */}
        <div>
          <button
            onClick={() => {
              setInRowView(!inRowView);
              // Track in-row view toggle
              track('In-Row View Toggled', { enabled: !inRowView });
            }}
            disabled={!isByYear}
            className={`px-4 py-2 rounded-full border ${
              inRowView
                ? 'bg-yellow-500 text-white border-yellow-500'
                : 'bg-gray-700 text-gray-300 border-gray-600'
            } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition`}
          >
            {inRowView ? 'Hide Total In-Row' : 'Show Total In-Row'}
          </button>
        </div>

        {/* Time Granularity Toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setTimeGranularity('Monthly');
              // Track time granularity change
              track('Time Granularity Changed', { granularity: 'Monthly' });
            }}
            className={`px-4 py-2 rounded-full border ${
              timeGranularity === 'Monthly'
                ? 'bg-purple-500 text-white border-purple-500'
                : 'bg-gray-700 text-gray-300 border-gray-600'
            } focus:outline-none transition`}
          >
            Monthly
          </button>
          <button
            onClick={() => {
              setTimeGranularity('Weekly');
              // Track time granularity change
              track('Time Granularity Changed', { granularity: 'Weekly' });
            }}
            className={`px-4 py-2 rounded-full border ${
              timeGranularity === 'Weekly'
                ? 'bg-purple-500 text-white border-purple-500'
                : 'bg-gray-700 text-gray-300 border-gray-600'
            } focus:outline-none transition`}
          >
            Weekly
          </button>
          <button
            onClick={() => {
              setTimeGranularity('Daily');
              // Track time granularity change
              track('Time Granularity Changed', { granularity: 'Daily' });
            }}
            className={`px-4 py-2 rounded-full border ${
              timeGranularity === 'Daily'
                ? 'bg-purple-500 text-white border-purple-500'
                : 'bg-gray-700 text-gray-300 border-gray-600'
            } focus:outline-none transition`}
          >
            Daily
          </button>
        </div>
      </div>

      {/* Year Selection (Only in By Year Mode) */}
      {isByYear && (
        <div className="flex flex-wrap gap-2 mb-8">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => toggleYear(year)}
              className={`px-4 py-2 rounded-full border ${
                selectedYears.includes(year)
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-gray-700 text-gray-300 border-gray-600'
              } focus:outline-none transition`}
              aria-pressed={selectedYears.includes(year)}
            >
              {year}
            </button>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Price Trend - Line/Bar/Area Chart */}
        <ChartContainer
          title="Average Price Trend"
          data={priceDataToDisplay}
          loadingStatus={loadingStatus.price}
          chartType={avgPriceChartType}
          setChartType={setAvgPriceChartType}
          availableChartTypes={['Line', 'Bar', 'Area']}
        >
          <AvgPriceChart
            data={priceDataToDisplay}
            chartType={avgPriceChartType}
            isByYear={isByYear}
            selectedYears={selectedYears}
            yearColors={yearColors}
            isInRow={isInRow}
            totalColor={totalColor}
          />
        </ChartContainer>

        {/* Total Sales Over Time - Bar/Line/Area Chart */}
        <ChartContainer
          title="Total Sales Over Time"
          data={salesDataToDisplay}
          loadingStatus={loadingStatus.sales}
          chartType={totalSalesChartType}
          setChartType={setTotalSalesChartType}
          availableChartTypes={['Bar', 'Line', 'Area']}
        >
          <TotalSalesChart
            data={salesDataToDisplay}
            chartType={totalSalesChartType}
            isByYear={isByYear}
            selectedYears={selectedYears}
            yearColors={yearColors}
            isInRow={isInRow}
            totalColor={totalColor}
          />
        </ChartContainer>

        {/* Combined Metrics - ComposedChart */}
        <ChartContainer
          title="Combined Metrics"
          data={composedChartData}
          loadingStatus="Success"
          chartType={composedChartType}
          setChartType={setComposedChartType}
          availableChartTypes={['Composed']}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={composedChartData}>
              <CartesianGrid stroke="#374151" />
              <XAxis
                dataKey="period"
                stroke="#9CA3AF"
                tick={CustomizedAxisTick} // Pass the component function directly
                height={70}
              />
              <YAxis yAxisId="left" stroke="#9CA3AF" />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#9CA3AF"
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="totalSales" barSize={20} fill="#413ea0" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="averagePrice"
                stroke="#ff7300"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Deviation from Median Price - AreaChart */}
        <ChartContainer
          title="Deviation from Median Price"
          data={processedTotalPriceData}
          loadingStatus="Success"
          chartType={areaChartType}
          setChartType={setAreaChartType}
          availableChartTypes={['Area']}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processedTotalPriceData}>
              <defs>
                <linearGradient id="positive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="negative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff7300" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ff7300" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="period"
                stroke="#9CA3AF"
                tick={CustomizedAxisTick} // Pass the component function directly
                height={70}
              />
              <YAxis
                stroke="#9CA3AF"
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              />
              <ReferenceLine y={medianPrice} stroke="#000" strokeDasharray="3 3">
                <Label value="Median" position="insideTopLeft" fill="#fff" />
              </ReferenceLine>
              <Area
                type="monotone"
                dataKey="average"
                stroke="#000"
                fill="url(#positive)"
                isAnimationActive={false}
                data={processedTotalPriceData.filter(
                  (item) => item.average >= medianPrice
                )}
              />
              <Area
                type="monotone"
                dataKey="average"
                stroke="#000"
                fill="url(#negative)"
                isAnimationActive={false}
                data={processedTotalPriceData.filter(
                  (item) => item.average < medianPrice
                )}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </section>
  );
};

export default DataInsights;
