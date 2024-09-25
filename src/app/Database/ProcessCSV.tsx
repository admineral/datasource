// File: components/ProcessCSV.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FaCloudUploadAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaTrashAlt,
  FaList,
  FaChartBar,
} from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProcessCSVProps {
  clearOptions: () => void;
}

const ProcessCSV: React.FC<ProcessCSVProps> = ({ clearOptions }) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );
  const [currentLog, setCurrentLog] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [totalBatches, setTotalBatches] = useState<number>(0);
  const [processedBatches, setProcessedBatches] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [processedRows, setProcessedRows] = useState<number>(0);

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    setIsBrowser(true);

    // Cleanup EventSource on component unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const resetUI = () => {
    setUploading(false);
    setUploadStatus('idle');
    setCurrentLog('');
    setLogs([]);
    setTotalBatches(0);
    setProcessedBatches(0);
    setProgress(0);
    setTotalRows(0);
    setProcessedRows(0);
  };

  const handleUpload = () => {
    if (!isBrowser) return;

    setUploading(true);
    setUploadStatus('loading');
    setCurrentLog('');
    setLogs([]);
    setTotalBatches(0);
    setProcessedBatches(0);
    setProgress(0);
    setTotalRows(0);
    setProcessedRows(0);

    try {
      // Open EventSource to start processing
      const eventSource = new EventSource('/api/redis/process');
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        const message = event.data;
        handleEventMessage(message, eventSource);
      };

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        setUploadStatus('error');
        toast.error('An error occurred while processing CSV files');
        eventSource.close();
        setUploading(false);
      };

      eventSource.onopen = () => {
        console.log('Connection to server opened.');
      };
    } catch (error: any) {
      setUploadStatus('error');
      toast.error(error.message || 'An unexpected error occurred');
      setUploading(false);
    }
  };

  const handleEventMessage = (message: string, eventSource: EventSource) => {
    setCurrentLog(message);
    setLogs((prevLogs) => [...prevLogs, message]);

    if (message.startsWith('Total rows:')) {
      const matches = message.match(/Total rows: (\d+), Total batches: (\d+)/);
      if (matches) {
        const total = parseInt(matches[1], 10);
        const batches = parseInt(matches[2], 10);
        setTotalRows(total);
        setTotalBatches(batches);
      }
    } else if (message.startsWith('Processed batch')) {
      const matches = message.match(
        /Processed batch (\d+)\/(\d+)\. Rows: (\d+)\/(\d+)\. Progress: ([\d.]+)%/
      );
      if (matches) {
        const processed = parseInt(matches[1], 10);
        const total = parseInt(matches[2], 10);
        const rows = parseInt(matches[3], 10);
        const totalRows = parseInt(matches[4], 10);
        const progressPercentage = parseFloat(matches[5]);

        setProcessedBatches(processed);
        setTotalBatches(total);
        setProcessedRows(rows);
        setTotalRows(totalRows);
        setProgress(progressPercentage);
      }
    } else if (
      message.startsWith('Successfully processed') ||
      message.startsWith('Finished processing')
    ) {
      const matches = message.match(/Finished processing (\d+) total rows in (\d+) batches/);
      if (matches) {
        const totalRows = parseInt(matches[1], 10);
        const actualTotalBatches = parseInt(matches[2], 10);
        setTotalBatches(actualTotalBatches);
        setProcessedBatches(actualTotalBatches);
        setProgress(100);
      }
      setUploadStatus('success');
      toast.success('CSV files processed and data stored in Redis');
      eventSource.close();
      setUploading(false);
    } else if (message.startsWith('Error processing')) {
      setUploadStatus('error');
      toast.error('An error occurred while processing CSV files');
      eventSource.close();
      setUploading(false);
    }
  };

  const handleCleanDatabase = async () => {
    if (!isBrowser) return;

    try {
      const response = await fetch('/api/redis', { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network response was not ok');
      }
      toast.success('Database cleaned successfully');
      clearOptions();
      resetUI();
    } catch (error: any) {
      console.error('Clean database error:', error);
      toast.error(error.message || 'Failed to clean the database');
    } finally {
      setShowModal(false);
    }
  };

  if (!isBrowser) {
    return null;
  }

  return (
    <div className="mb-6 rounded-md bg-white p-4 dark:bg-gray-800">
      <h2 className="mb-4 text-2xl font-semibold">Process CSV Files</h2>
      <div className="flex items-center justify-between">
        <Button
          onClick={handleUpload}
          disabled={uploading}
          variant="default"
          className="flex items-center space-x-2"
        >
          <FaCloudUploadAlt />
          <span>{uploading ? 'Processing...' : 'Process CSV Files'}</span>
        </Button>
        <Button
          onClick={() => setShowModal(true)}
          variant="default"
          className="flex items-center space-x-2 text-red-600"
        >
          <FaTrashAlt />
          <span>Clean Database</span>
        </Button>
      </div>
      <div className="mt-4 flex items-center space-x-2">
        {uploadStatus === 'loading' && <FaSpinner className="animate-spin text-orange-500" />}
        {uploadStatus === 'success' && <FaCheckCircle className="text-green-500" />}
        {uploadStatus === 'error' && <FaTimesCircle className="text-red-500" />}
      </div>
      {uploadStatus === 'loading' && (
        <div className="mt-4">
          <h3 className="mb-2 text-lg font-semibold">Current Progress:</h3>
          <div className="overflow-x-auto rounded-md bg-gray-100 p-2 dark:bg-gray-700">
            <p className="whitespace-pre-wrap">{currentLog}</p>
          </div>
          {totalBatches > 0 && (
            <div className="mt-4">
              <h4 className="text-md mb-1 font-semibold">Total Progress:</h4>
              <div className="relative h-4 w-3/4 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                <div
                  className="h-4 rounded-full bg-blue-600 transition-all duration-500 ease-in-out"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute left-0 top-0 h-4 w-full animate-pulse bg-blue-800 opacity-25"></div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm">
                  {processedBatches} of {totalBatches} batches processed, {progress.toFixed(2)}% complete
                  ({processedRows.toLocaleString()} of {totalRows.toLocaleString()} rows)
                </p>
                <Button
                  onClick={() => setShowLogs(!showLogs)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  {showLogs ? <FaChartBar className="mr-1" /> : <FaList className="mr-1" />}
                  <span>{showLogs ? 'Hide Logs' : 'Show Logs'}</span>
                </Button>
              </div>
              {showLogs && (
                <div className="mt-4 max-h-60 overflow-y-auto rounded-md bg-gray-100 p-2 dark:bg-gray-700">
                  {logs.map((log, index) => (
                    <p key={index} className="whitespace-pre-wrap">
                      {log}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-md bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold">Confirm Database Cleaning</h3>
            <p>Are you sure you want to clean the database? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end space-x-4">
              <Button onClick={handleCleanDatabase} variant="default" className="bg-red-500 text-white">
                Yes, Clean
              </Button>
              <Button onClick={() => setShowModal(false)} variant="default">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessCSV;