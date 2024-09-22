// src/components/DashboardContext.tsx

import React, { createContext, useState, useEffect } from 'react';
import { DataPoint, fetchDataFromApi } from '../utils/dataProcessing';

interface DashboardContextProps {
  priceData: DataPoint[];
  salesData: DataPoint[];
  availableYears: number[];
  selectedYears: number[];
  setSelectedYears: React.Dispatch<React.SetStateAction<number[]>>;
  viewMode: 'Total' | 'ByYear';
  setViewMode: React.Dispatch<React.SetStateAction<'Total' | 'ByYear'>>;
  timeGranularity: 'Monthly' | 'Weekly' | 'Daily';
  setTimeGranularity: React.Dispatch<
    React.SetStateAction<'Monthly' | 'Weekly' | 'Daily'>
  >;
  inRowView: boolean;
  setInRowView: React.Dispatch<React.SetStateAction<boolean>>;
  loadingStatus: { [key: string]: string };
  error: string | null;
  toggleViewMode: (mode: 'Total' | 'ByYear') => void;
  toggleYear: (year: number) => void;
}

export const DashboardContext = createContext<DashboardContextProps | null>(
  null
);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [priceData, setPriceData] = useState<DataPoint[]>([]);
  const [salesData, setSalesData] = useState<DataPoint[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'Total' | 'ByYear'>('Total');
  const [timeGranularity, setTimeGranularity] = useState<
    'Monthly' | 'Weekly' | 'Daily'
  >('Monthly');
  const [inRowView, setInRowView] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<{
    [key: string]: string;
  }>({
    price: 'Initializing...',
    sales: 'Initializing...',
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch Data on Mount
  useEffect(() => {
    async function fetchData() {
      try {
        const types: ('price' | 'sales')[] = ['price', 'sales'];
        for (const type of types) {
          setLoadingStatus((prev) => ({
            ...prev,
            [type]: `Fetching ${type} data...`,
          }));
          const response = await fetchDataFromApi(type);
          setLoadingStatus((prev) => ({ ...prev, [type]: response.status }));
          switch (type) {
            case 'price':
              const parsedPriceData = response.data.map((item) => ({
                ...item,
                value: Number(item.value),
              }));
              setPriceData(parsedPriceData);
              setAvailableYears(extractYears(parsedPriceData));
              break;
            case 'sales':
              const parsedSalesData = response.data.map((item) => ({
                ...item,
                value: Number(item.value),
              }));
              setSalesData(parsedSalesData);
              break;
            default:
              break;
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error fetching data');
      }
    }
    fetchData();
  }, []);

  // Extract unique years from data
  const extractYears = (data: DataPoint[]) => {
    const years = data.map((point) => new Date(point.date).getFullYear());
    return Array.from(new Set(years)).sort();
  };

  // Update selected years when available years change
  useEffect(() => {
    if (
      viewMode === 'ByYear' &&
      selectedYears.length === 0 &&
      availableYears.length > 0
    ) {
      setSelectedYears([Math.max(...availableYears)]); // Default to latest year
    }
  }, [availableYears, viewMode, selectedYears.length]);

  // Toggle View Mode
  const toggleViewMode = (mode: 'Total' | 'ByYear') => {
    setViewMode(mode);
    if (
      mode === 'ByYear' &&
      selectedYears.length === 0 &&
      availableYears.length > 0
    ) {
      setSelectedYears([Math.max(...availableYears)]); // Default to latest year
    }
    if (mode === 'Total') {
      setSelectedYears([]); // Clear selected years
      setInRowView(false); // Disable In-Row View
    }
  };

  // Toggle Year Selection
  const toggleYear = (year: number) => {
    setSelectedYears((prev) => {
      if (prev.includes(year)) {
        if (prev.length === 1) return prev; // Prevent deselecting last year
        return prev.filter((y) => y !== year);
      } else {
        return [...prev, year];
      }
    });
  };

  const contextValue: DashboardContextProps = {
    priceData,
    salesData,
    availableYears,
    selectedYears,
    setSelectedYears,
    viewMode,
    setViewMode,
    timeGranularity,
    setTimeGranularity,
    inRowView,
    setInRowView,
    loadingStatus,
    error,
    toggleViewMode,
    toggleYear,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};
