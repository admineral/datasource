'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FaSync } from "react-icons/fa";

interface CSVPreviewProps {
  fileName: string;
}

interface CombinedRecord {
  Client: string;
  Warehouse: string;
  Product: string;
  [key: string]: string | number | { price: number; sales: number };
}

const CSVPreview: React.FC<CSVPreviewProps> = ({ fileName }) => {
  const [previewData, setPreviewData] = useState<CombinedRecord[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCSVPreview = useCallback(async () => {
    console.log(`Fetching preview for ${fileName}`);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${window.location.origin}/api/csv-preview?files=Price.csv,Sales.csv`);
      console.log(`Response status for ${fileName}:`, response.status);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch CSV preview: ${response.status}. ${errorText}`);
      }
      const data = await response.json();
      console.log(`Received data for ${fileName}:`, data);
      if (data.error) {
        throw new Error(data.error);
      }
      setPreviewData(data.preview || []);
      setHeaders(data.headers || []);
    } catch (error) {
      console.error(`Error fetching CSV preview for ${fileName}:`, error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [fileName]);

  useEffect(() => {
    fetchCSVPreview();
  }, [fetchCSVPreview]);

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
        <CardTitle>{fileName} Preview</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchCSVPreview}
          disabled={loading}
        >
          <FaSync className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
        {error && (
          <div className="text-red-500">{error}</div>
        )}
        {!loading && !error && previewData.length === 0 && (
          <div>No data available for {fileName}</div>
        )}
        {!loading && !error && previewData.length > 0 && (
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
                {previewData.map((row, rowIndex) => (
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

export default CSVPreview;