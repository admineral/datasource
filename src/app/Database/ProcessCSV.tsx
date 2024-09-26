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
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [currentLog, setCurrentLog] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [totalBatches, setTotalBatches] = useState<number>(0);
  const [processedBatches, setProcessedBatches] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isBrowser, setIsBrowser] = useState<boolean>(false);
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
        toast.error('Ein Fehler ist während der CSV-Verarbeitung aufgetreten.');
        eventSource.close();
        setUploading(false);
      };

      eventSource.onopen = () => {
        console.log('Verbindung zu SSE hergestellt.');
      };
    } catch (error: any) {
      setUploadStatus('error');
      toast.error(error.message || 'Ein unerwarteter Fehler ist aufgetreten.');
      setUploading(false);
    }
  };

  const handleEventMessage = (message: string, eventSource: EventSource) => {
    console.log(`Empfangene Nachricht: ${message}`);
    setCurrentLog(message);
    setLogs((prevLogs) => [...prevLogs, message]);

    // Beispielhafte Nachrichtenformate:
    // "Gesamtanzahl der zu verarbeitenden Zeilen: 2000"
    // "Gesamtanzahl der Batches: 4"
    // "Verarbeitung von Sales.csv gestartet..."
    // "Verarbeitung von Sales.csv abgeschlossen."
    // "Verarbeitung von Price.csv gestartet..."
    // "Verarbeitung von Price.csv abgeschlossen."
    // "Batch mit 500 Einträgen hochgeladen."
    // "Fortschritt: 25.00% (1/4 Batches)"
    // "CSV-Verarbeitung und Daten-Upload erfolgreich abgeschlossen."
    // "Error: <Fehlermeldung>"

    if (message.startsWith('Gesamtanzahl der zu verarbeitenden Zeilen:')) {
      const matches = message.match(/Gesamtanzahl der zu verarbeitenden Zeilen: (\d+)/);
      if (matches) {
        const total = parseInt(matches[1], 10);
        setTotalRows(total);
        console.log(`Gesamtzeilen: ${total}`);
      }
    } else if (message.startsWith('Gesamtanzahl der Batches:')) {
      const matches = message.match(/Gesamtanzahl der Batches: (\d+)/);
      if (matches) {
        const batches = parseInt(matches[1], 10);
        setTotalBatches(batches);
        console.log(`Gesamtbatches: ${batches}`);
      }
    } else if (message.startsWith('Batch mit')) {
      const matches = message.match(/Batch mit (\d+) Einträgen hochgeladen\./);
      if (matches) {
        const batchSize = parseInt(matches[1], 10);
        setProcessedBatches((prev) => prev + 1);
        setProcessedRows((prev) => prev + batchSize);
        const newProgress = ((processedRows + batchSize) / totalRows) * 100;
        setProgress(newProgress > 100 ? 100 : parseFloat(newProgress.toFixed(2)));
        console.log(`Batch hochgeladen: ${batchSize} Einträge.`);
      }
    } else if (message.startsWith('Fortschritt:')) {
      const matches = message.match(/Fortschritt: (\d+\.\d+)% \((\d+)\/(\d+) Batches\)/);
      if (matches) {
        const progressPercent = parseFloat(matches[1]);
        const processed = parseInt(matches[2], 10);
        const total = parseInt(matches[3], 10);
        setProgress(progressPercent);
        setProcessedBatches(processed);
        console.log(`Fortschritt: ${progressPercent}% (${processed}/${total} Batches)`);
      }
    } else if (message.startsWith('CSV-Verarbeitung und Daten-Upload erfolgreich abgeschlossen.')) {
      setUploadStatus('success');
      toast.success('CSV-Dateien erfolgreich verarbeitet und in Redis gespeichert.');
      eventSource.close();
      setUploading(false);
    } else if (message.startsWith('Error:')) {
      setUploadStatus('error');
      toast.error(message);
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
        throw new Error(errorData.error || 'Datenbank konnte nicht bereinigt werden.');
      }
      toast.success('Datenbank erfolgreich bereinigt.');
      clearOptions();
      resetUI();
    } catch (error: any) {
      console.error('Datenbankbereinigung Fehler:', error);
      toast.error(error.message || 'Datenbank konnte nicht bereinigt werden.');
    } finally {
      setShowModal(false);
    }
  };

  if (!isBrowser) {
    return null;
  }

  return (
    <div className="mb-6 rounded-md bg-white p-4 dark:bg-gray-800">
      <h2 className="mb-4 text-2xl font-semibold">CSV-Dateien verarbeiten</h2>
      <div className="flex items-center justify-between">
        <Button
          onClick={handleUpload}
          disabled={uploading}
          variant="default"
          className="flex items-center space-x-2"
        >
          <FaCloudUploadAlt />
          <span>{uploading ? 'Verarbeite...' : 'CSV-Dateien verarbeiten'}</span>
        </Button>
        <Button
          onClick={() => setShowModal(true)}
          variant="default"
          className="flex items-center space-x-2 text-red-600"
        >
          <FaTrashAlt />
          <span>Datenbank bereinigen</span>
        </Button>
      </div>
      <div className="mt-4 flex items-center space-x-2">
        {uploadStatus === 'loading' && <FaSpinner className="animate-spin text-orange-500" />}
        {uploadStatus === 'success' && <FaCheckCircle className="text-green-500" />}
        {uploadStatus === 'error' && <FaTimesCircle className="text-red-500" />}
      </div>
      {uploadStatus === 'loading' && (
        <div className="mt-4">
          <h3 className="mb-2 text-lg font-semibold">Aktueller Fortschritt:</h3>
          <div className="overflow-x-auto rounded-md bg-gray-100 p-2 dark:bg-gray-700">
            <p className="whitespace-pre-wrap">{currentLog}</p>
          </div>
          {totalBatches > 0 && (
            <div className="mt-4">
              <h4 className="text-md mb-1 font-semibold">Gesamtfortschritt:</h4>
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                <div
                  className="h-4 rounded-full bg-blue-600 transition-all duration-500 ease-in-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm">
                  {processedBatches} von {totalBatches} Batches verarbeitet, {progress.toFixed(2)}% abgeschlossen
                  ({processedRows.toLocaleString()} von {totalRows.toLocaleString()} Zeilen)
                </p>
                <Button
                  onClick={() => setShowLogs(!showLogs)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  {showLogs ? <FaChartBar className="mr-1" /> : <FaList className="mr-1" />}
                  <span>{showLogs ? 'Logs ausblenden' : 'Logs anzeigen'}</span>
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

      {/* Bestätigungsmodal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-md bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold">Datenbankbereinigung bestätigen</h3>
            <p>Bist du sicher, dass du die Datenbank bereinigen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.</p>
            <div className="mt-6 flex justify-end space-x-4">
              <Button onClick={handleCleanDatabase} variant="default" className="bg-red-500 text-white">
                Ja, bereinigen
              </Button>
              <Button onClick={() => setShowModal(false)} variant="default">
                Abbrechen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessCSV;