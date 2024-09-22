// src/utils/dataProcessing.ts

// Interfaces
export interface DataPoint {
    date: string;
    value: number;
  }
  
  export interface ApiResponse {
    data: DataPoint[];
    status: string;
  }
  
  export interface AggregatedData {
    period: string;
    total?: number;
    average?: number;
    [key: string]: any; // Allows for dynamic keys when aggregating by year
  }
  
  // Helper Functions
  
  // Get week number from date
  export function getWeekNumber(date: Date): number {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - oneJan.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.ceil(((diff + oneJan.getDay() * oneDay) / oneDay) / 7);
  }
  
  // Aggregate data based on granularity and selected years
  export function aggregateData(
    data: DataPoint[],
    granularity: 'Monthly' | 'Weekly' | 'Daily',
    selectedYears: number[] = [],
    includeYearInPeriod: boolean = false
  ): AggregatedData[] {
    const aggregatedData: { [key: string]: number[] } = {};
  
    data.forEach((point) => {
      const date = new Date(point.date);
      const year = date.getFullYear();
  
      // Filter by selected years if in ByYear mode
      if (selectedYears.length > 0 && !selectedYears.includes(year)) {
        return;
      }
  
      let key: string;
      if (granularity === 'Monthly') {
        const month = date.toLocaleString('en-US', { month: 'short' });
        key = includeYearInPeriod ? `${month} ${year}` : month;
      } else if (granularity === 'Weekly') {
        const week = `W${getWeekNumber(date)}`;
        key = includeYearInPeriod ? `${week} ${year}` : week;
      } else {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        key = includeYearInPeriod
          ? date.toISOString().split('T')[0]
          : `${month}-${day}`; // Format as MM-DD
      }
  
      if (!aggregatedData[key]) {
        aggregatedData[key] = [];
      }
  
      aggregatedData[key].push(point.value);
    });
  
    // Sorting logic for periods
    const sortedKeys = Object.keys(aggregatedData).sort((a, b) => {
      if (granularity === 'Daily' || includeYearInPeriod) {
        // For daily data or when year is included, sort by date
        return new Date(a).getTime() - new Date(b).getTime();
      } else if (granularity === 'Monthly') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a) - months.indexOf(b);
      } else if (granularity === 'Weekly') {
        const weekNumberA = parseInt(a.replace('W', ''), 10);
        const weekNumberB = parseInt(b.replace('W', ''), 10);
        return weekNumberA - weekNumberB;
      }
      return 0;
    });
  
    // Convert to array and compute sums or averages
    return sortedKeys.map((key) => {
      const values = aggregatedData[key];
      const total = values.reduce((acc, val) => acc + val, 0);
      const average = total / values.length;
  
      return {
        period: key,
        total,   // For sales data
        average, // For price data
      };
    });
  }
  
  // Process data for Total View (Average)
  export function processTotalAverageData(
    data: DataPoint[],
    granularity: 'Monthly' | 'Weekly' | 'Daily',
    availableYears: number[],
    includeYearInPeriod: boolean = false // Default to false
  ): AggregatedData[] {
    const aggregated = aggregateData(data, granularity, [], includeYearInPeriod);
    return aggregated.map((item) => ({
      period: item.period,
      average: parseFloat(item.average!.toFixed(2)),
    }));
  }
  
  // Process data for Total View (Sum)
  export function processTotalSumData(
    data: DataPoint[],
    granularity: 'Monthly' | 'Weekly' | 'Daily',
    includeYearInPeriod: boolean = false // Default to false
  ): AggregatedData[] {
    const aggregated = aggregateData(data, granularity, [], includeYearInPeriod);
    return aggregated.map((item) => ({
      period: item.period,
      total: Math.round(item.total!),
    }));
  }
  
  // Process data for By Year View
  export function processDataByYear(
    data: DataPoint[],
    granularity: 'Monthly' | 'Weekly' | 'Daily',
    selectedYears: number[],
    dataType: 'price' | 'sales' // Added dataType parameter
  ): AggregatedData[] {
    const aggregatedData: { [key: string]: { [year: string]: number[] } } = {};
  
    data.forEach((point) => {
      const date = new Date(point.date);
      const year = date.getFullYear().toString();
  
      if (!selectedYears.includes(parseInt(year, 10))) {
        return;
      }
  
      let key: string;
      if (granularity === 'Monthly') {
        key = date.toLocaleString('en-US', { month: 'short' });
      } else if (granularity === 'Weekly') {
        key = `W${getWeekNumber(date)}`;
      } else {
        key = date.toISOString().split('T')[0]; // Daily
      }
  
      if (!aggregatedData[key]) {
        aggregatedData[key] = {};
      }
      if (!aggregatedData[key][year]) {
        aggregatedData[key][year] = [];
      }
  
      aggregatedData[key][year].push(point.value);
    });
  
    // Sorting logic for periods
    const sortedKeys = Object.keys(aggregatedData).sort((a, b) => {
      if (granularity === 'Daily') {
        return new Date(a).getTime() - new Date(b).getTime();
      } else if (granularity === 'Monthly') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a) - months.indexOf(b);
      } else if (granularity === 'Weekly') {
        const weekNumberA = parseInt(a.replace('W', ''), 10);
        const weekNumberB = parseInt(b.replace('W', ''), 10);
        return weekNumberA - weekNumberB;
      }
      return 0;
    });
  
    // Convert to array and compute sums or averages per year
    return sortedKeys.map((key) => {
      const yearsData = aggregatedData[key];
      const result: AggregatedData = { period: key };
      Object.keys(yearsData).forEach((year) => {
        const values = yearsData[year];
        const total = values.reduce((acc, val) => acc + val, 0);
        const average = total / values.length;
        if (dataType === 'price') {
          result[year] = parseFloat(average.toFixed(2));
        } else {
          result[year] = Math.round(total);
        }
      });
      return result;
    });
  }
  
  // Merge Total data into aggregated data
  export function mergeTotalData(
    aggregatedData: AggregatedData[],
    totalData: AggregatedData[],
    totalKey: string
  ): AggregatedData[] {
    const totalMap: { [period: string]: number } = {};
    totalData.forEach((item) => {
      totalMap[item.period] = (item[totalKey] as number) || 0;
    });
  
    return aggregatedData.map((item) => ({
      ...item,
      [totalKey]: totalMap[item.period] || 0,
    }));
  }
  
  // Fetch data from API
  export async function fetchDataFromApi(
    type: 'price' | 'sales'
  ): Promise<ApiResponse> {
    const response = await fetch(`/api/data?type=${type}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} data`);
    }
    const data: ApiResponse = await response.json();
    return data;
  }
  