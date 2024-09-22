'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaCloudUploadAlt, FaSync, FaWarehouse, FaUser, FaBox, FaDollarSign, FaChartLine } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from 'sonner';
import CSVPreview from './CSVPreview';
import CombinedView from './CombinedView';

interface WeeklyData {
  [week: string]: number;
}

interface Entry {
  Client: string;
  Warehouse: string;
  Product: string;
  [key: string]: string | number | { price: number; sales: number };
}

const UpstashManager: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/csv-preview?files=Price.csv,Sales.csv');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setEntries(data.preview || []);
      toast.success('Data refreshed successfully');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An unexpected error occurred');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUploadToUpstash = async () => {
    setUploading(true);
    try {
      // Simulating upload process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.info('Upload functionality is under construction. Implementation in progress.');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred during upload simulation');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold mb-6">Data Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CSVPreview fileName="Price.csv" />
        <CSVPreview fileName="Sales.csv" />
      </div>

      <CombinedView />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Data Entries</CardTitle>
          <Button onClick={fetchData} disabled={loading} variant="outline" className="flex items-center space-x-2">
            <FaSync className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </Button>
        </CardHeader>
        <CardContent>
          {entries.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><FaWarehouse className="inline mr-2" /> Warehouse</TableHead>
                    <TableHead><FaUser className="inline mr-2" /> Client</TableHead>
                    <TableHead><FaBox className="inline mr-2" /> Product</TableHead>
                    <TableHead><FaDollarSign className="inline mr-2" /> Price (Latest Week)</TableHead>
                    <TableHead><FaChartLine className="inline mr-2" /> Sales (Latest Week)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry, index) => {
                    const weeks = Object.keys(entry).filter(key => key.startsWith('20'));
                    const latestWeek = weeks[weeks.length - 1];
                    return (
                      <TableRow key={index}>
                        <TableCell>{entry.Warehouse}</TableCell>
                        <TableCell>{entry.Client}</TableCell>
                        <TableCell>{entry.Product}</TableCell>
                        <TableCell>${(entry[latestWeek] as { price: number; sales: number }).price.toFixed(2)}</TableCell>
                        <TableCell>{(entry[latestWeek] as { price: number; sales: number }).sales}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4">No entries available</div>
          )}
          {loading && (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleUploadToUpstash}
            disabled={uploading}
            variant="default"
            className="flex items-center space-x-2"
          >
            <FaCloudUploadAlt />
            <span>{uploading ? 'Uploading...' : 'Upload CSV to Upstash'}</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UpstashManager;