"use client";

import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaCheckCircle, FaTimesCircle, FaSpinner, FaTrashAlt } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ProcessCSV: React.FC = () => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState<string>('');
  const [totalBatches, setTotalBatches] = useState<number>(0);
  const [processedBatches, setProcessedBatches] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);

  // New state to track if we're in the browser
  const [isBrowser, setIsBrowser] = useState(false);

  // Use useEffect to set isBrowser to true after component mounts
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const resetUI = () => {
    setUploading(false);
    setUploadStatus('idle');
    setProgress('');
    setTotalBatches(0);
    setProcessedBatches(0);
  };

  const handleUpload = async () => {
    if (!isBrowser) return; // Prevent execution during SSR

    setUploading(true);
    setUploadStatus('loading');
    setProgress('');
    setTotalBatches(0);
    setProcessedBatches(0);

    try {
      const response = await fetch('/api/redis/process');
      const contentType = response.headers.get('Content-Type');

      if (contentType?.includes('application/json')) {
        // Handle JSON response (build time or unsupported environment)
        const data = await response.json();
        if (data.message) {
          toast.info(data.message);
          setUploading(false);
          resetUI();
          return;
        }
      } else if (contentType?.includes('text/event-stream')) {
        // Handle SSE for actual processing
        const eventSource = new EventSource('/api/redis/process');

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
      } else {
        throw new Error('Unexpected response type');
      }
    } catch (error: any) {
      setUploadStatus('error');
      toast.error(error.message || 'An unexpected error occurred');
      setUploading(false);
    }
  };

  const handleEventMessage = (message: string, eventSource: EventSource) => {
    setProgress(message);

    if (message.startsWith('Processed batch')) {
      const matches = message.match(/Processed batch (\d+) of (\d+)/);
      if (matches) {
        const processed = parseInt(matches[1], 10);
        const total = parseInt(matches[2], 10);
        setProcessedBatches(processed);
        setTotalBatches(total);
      }
    }

    if (message.includes('Successfully processed')) {
      setUploadStatus('success');
      toast.success('CSV files processed and data stored in Redis');
      eventSource.close();
      setUploading(false);
      resetUI();
    }

    if (message.startsWith('Error processing')) {
      setUploadStatus('error');
      toast.error('An error occurred while processing CSV files');
      eventSource.close();
      setUploading(false);
    }
  };

  const handleCleanDatabase = async () => {
    if (!isBrowser) return; // Prevent execution during SSR

    try {
      const response = await fetch('/api/redis', { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network response was not ok');
      }
      toast.success('Database cleaned successfully');
    } catch (error: any) {
      console.error('Clean database error:', error);
      toast.error(error.message || 'Failed to clean the database');
    } finally {
      setShowModal(false);
    }
  };

  // Render null during SSR
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
          <h3 className="mb-2 text-lg font-semibold">Progress:</h3>
          <div className="overflow-x-auto rounded-md bg-gray-100 p-2 dark:bg-gray-700">
            <div>{progress}</div>
          </div>
          {totalBatches > 0 && (
            <div className="mt-4">
              <h4 className="text-md mb-1 font-semibold">Total Progress:</h4>
              <div className="relative h-4 w-3/4 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                <div
                  className="h-4 rounded-full bg-blue-600 transition-all duration-500 ease-in-out"
                  style={{ width: `${(processedBatches / totalBatches) * 100}%` }}
                >
                  <div className="absolute left-0 top-0 h-4 w-full animate-pulse bg-blue-800 opacity-25"></div>
                </div>
              </div>
              <p className="mt-2 text-sm">
                {processedBatches} of {totalBatches} batches processed
              </p>
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