'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaSync } from "react-icons/fa";

interface CombinedRecord {
  Client: string;
  Warehouse: string;
  Product: string;
  [key: string]: string | number | { price: number; sales: number };
}

const CombinedView: React.FC = () => {
  const [combinedData, setCombinedData] = useState<CombinedRecord[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [warehouse, setWarehouse] = useState<string>('');
  const [client, setClient] = useState<string>('');
  const [product, setProduct] = useState<string>('');

  const fetchCombinedData = useCallback(async () => {
    console.log('Fetching combined data');
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        files: 'Price.csv,Sales.csv',
        ...(warehouse && { warehouse }),
        ...(client && { client }),
        ...(product && { product }),
      });

      const response = await fetch(`/api/csv-preview?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch combined data');
      }
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setCombinedData(data.preview);
      setHeaders(data.headers);
    } catch (error) {
      console.error('Error fetching combined data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [warehouse, client, product]);

  useEffect(() => {
    fetchCombinedData();
  }, [fetchCombinedData]);

  const formatValue = (value: string | number | { price: number; sales: number }): string => {
    if (typeof value === 'object' && value !== null && 'price' in value && 'sales' in value) {
      return `P: ${value.price.toFixed(2)} / S: ${value.sales}`;
    }
    if (typeof value === 'number') {
      return isNaN(value) ? 'N/A' : value.toFixed(2);
    }
    return String(value);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Combined Price and Sales View</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchCombinedData}
          disabled={loading}
        >
          <FaSync className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Input
            placeholder="Filter by Warehouse"
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
          />
          <Input
            placeholder="Filter by Client"
            value={client}
            onChange={(e) => setClient(e.target.value)}
          />
          <Input
            placeholder="Filter by Product"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
        </div>
        {loading && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && combinedData.length === 0 && (
          <div>No data available</div>
        )}
        {!loading && !error && combinedData.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header, index) => (
                    <TableHead key={index}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {combinedData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {headers.map((header, cellIndex) => (
                      <TableCell key={cellIndex}>
                        {formatValue(row[header])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CombinedView;