import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';
import { createReadStream, existsSync } from 'fs';
import { parse } from 'csv-parse';
import path from 'path';
import { Readable } from 'stream';
import * as readline from 'readline';

// Define runtime and caching behavior
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // seconds

// Environment Variable Validation
const REDIS_URL = process.env.REDIS_URL;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const SALES_CSV = path.join(DATA_DIR, 'Sales.csv');
const PRICE_CSV = path.join(DATA_DIR, 'Price.csv');

if (!REDIS_URL || !REDIS_PASSWORD) {
  console.error('Fehlende Redis-Konfiguration in den Umgebungsvariablen.');
  throw new Error('Fehlende Redis-Konfiguration in den Umgebungsvariablen.');
}

// Initialize Redis client
const redis = new Redis(REDIS_URL, {
  password: REDIS_PASSWORD,
});

redis.on('connect', () => {
  console.log('Erfolgreich mit Redis verbunden.');
});

redis.on('error', (err) => {
  console.error('Redis-Verbindungsfehler:', err);
});

// Define batch size
const BATCH_SIZE = 500;

/**
 * Zählt die Anzahl der Zeilen in einer Datei.
 * @param filePath Pfad zur Datei.
 * @returns Anzahl der Zeilen.
 */
async function countLines(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    let lineCount = 0;

    if (!existsSync(filePath)) {
      console.error(`Datei nicht gefunden: ${filePath}`);
      return reject(new Error(`Datei nicht gefunden: ${filePath}`));
    }

    const readStream = createReadStream(filePath);
    readStream.on('error', (err) => {
      console.error(`Fehler beim Lesen der Datei ${filePath}:`, err);
      reject(err);
    });

    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity, // Erfasst sowohl \n als auch \r\n als Zeilenenden
    });

    rl.on('line', () => {
      lineCount++;
      // Log jede 1000. Zeile
      if (lineCount % 1000 === 0) {
        console.log(`Gezählte Zeilen in ${path.basename(filePath)}: ${lineCount}`);
      }
    });

    rl.on('close', () => {
      console.log(`Endgültige Zeilenzahl für ${path.basename(filePath)}: ${lineCount}`);
      resolve(lineCount);
    });

    rl.on('error', (err) => {
      console.error(`Fehler beim Parsen der Datei ${filePath}:`, err);
      reject(err);
    });
  });
}

/**
 * Verarbeitet eine CSV-Datei und fügt Daten zu einer Map hinzu.
 * @param filePath Pfad zur CSV-Datei.
 * @param type Typ der Daten ('sales' oder 'price').
 * @param dataMap Map zur Speicherung der kombinierten Daten.
 */
async function processCSV(
  filePath: string,
  type: 'sales' | 'price',
  dataMap: Map<string, Record<string, string>>
) {
  return new Promise<void>((resolve, reject) => {
    console.log(`Starte Verarbeitung der Datei ${filePath} als ${type}.`);
    const parser = createReadStream(filePath).pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
      })
    );

    parser.on('data', (row: any) => {
      const { Client, Warehouse, Product, ...dates } = row;
      if (!Client || !Warehouse || !Product) {
        // Überspringt Zeilen mit fehlenden Schlüsseln
        console.warn(`Überspringe Zeile mit fehlenden Schlüsseln in ${path.basename(filePath)}: ${JSON.stringify(row)}`);
        return;
      }
      const key = `${Client}:${Warehouse}:${Product}`;
      if (!dataMap.has(key)) {
        dataMap.set(key, {});
      }
      const existingData = dataMap.get(key)!;
      for (const [date, value] of Object.entries(dates)) {
        if (value !== undefined && value !== '') {
          existingData[`${type}:${date}`] = String(value);
        }
      }
    });

    parser.on('end', () => {
      console.log(`Verarbeitung der Datei ${filePath} als ${type} abgeschlossen.`);
      resolve();
    });

    parser.on('error', (err) => {
      console.error(`Fehler beim Parsen der Datei ${filePath}:`, err);
      reject(err);
    });
  });
}

/**
 * Lädt einen Batch von Daten in Redis hoch.
 * @param batch Map mit den zu ladenden Daten.
 * @param sendProgress Funktion zum Senden von Fortschrittsmeldungen.
 */
async function uploadBatch(
  batch: Map<string, Record<string, string>>,
  sendProgress: (msg: string) => void
) {
  const pipelineRedis = redis.pipeline();

  for (const [key, data] of batch.entries()) {
    pipelineRedis.hmset(key, data);

    // Indexing für schnelles Nachschlagen
    const [Client, Warehouse, Product] = key.split(':');
    pipelineRedis.sadd(`index:client:${Client}`, key);
    pipelineRedis.sadd(`index:warehouse:${Warehouse}`, key);
    pipelineRedis.sadd(`index:product:${Product}`, key);

    // **New: Add sales data to sorted set for fast fetching**
    Object.entries(data).forEach(([field, value]) => {
      const [type, date] = field.split(':'); // e.g., type = 'sales', date = '2023-01-01'
      if (type === 'sales') {
        const timestamp = new Date(date).getTime();
        pipelineRedis.zadd(`product_sales:${Product}`, timestamp, date);
      }
    });
  }

  try {
    await pipelineRedis.exec();
    sendProgress(`Batch mit ${batch.size} Einträgen hochgeladen.`);
    console.log(`Batch mit ${batch.size} Einträgen erfolgreich hochgeladen.`);
  } catch (error: any) {
    console.error('Fehler beim Hochladen des Batches:', error);
    sendProgress(`Fehler beim Hochladen des Batches: ${error.message || 'Unbekannter Fehler'}`);
    throw error;
  }
}

/**
 * Hauptfunktion zur Verarbeitung der CSV-Dateien.
 * @param sendProgress Funktion zum Senden von Fortschrittsmeldungen.
 */
async function processCSVs(sendProgress: (msg: string) => void) {
  // Überprüft, ob die CSV-Dateien existieren
  if (!existsSync(SALES_CSV) || !existsSync(PRICE_CSV)) {
    sendProgress('Eine oder beide CSV-Dateien fehlen.');
    throw new Error('CSV-Dateien nicht gefunden.');
  }

  // Zählt die Gesamtanzahl der Zeilen in beiden CSV-Dateien
  sendProgress('Zeilen in CSV-Dateien werden gezählt...');
  console.log('Zeilen in CSV-Dateien werden gezählt...');
  const [salesLines, priceLines] = await Promise.all([
    countLines(SALES_CSV),
    countLines(PRICE_CSV),
  ]);

  // Subtrahiert die Header-Zeilen
  const totalSales = salesLines - 1;
  const totalPrice = priceLines - 1;
  const totalRows = totalSales + totalPrice;
  const totalBatches = Math.ceil(totalRows / BATCH_SIZE);

  sendProgress(`Gesamtanzahl der zu verarbeitenden Zeilen: ${totalRows}`);
  sendProgress(`Gesamtanzahl der Batches: ${totalBatches}`);
  console.log(`Gesamtanzahl der zu verarbeitenden Zeilen: ${totalRows}`);
  console.log(`Gesamtanzahl der Batches: ${totalBatches}`);

  // Map zur Speicherung der kombinierten Daten
  const dataMap: Map<string, Record<string, string>> = new Map();

  // Verarbeitet Sales.csv
  sendProgress('Verarbeitung von Sales.csv gestartet...');
  console.log('Verarbeitung von Sales.csv gestartet...');
  await processCSV(SALES_CSV, 'sales', dataMap);
  sendProgress('Verarbeitung von Sales.csv abgeschlossen.');
  console.log('Verarbeitung von Sales.csv abgeschlossen.');

  // Verarbeitet Price.csv
  sendProgress('Verarbeitung von Price.csv gestartet...');
  console.log('Verarbeitung von Price.csv gestartet...');
  await processCSV(PRICE_CSV, 'price', dataMap);
  sendProgress('Verarbeitung von Price.csv abgeschlossen.');
  console.log('Verarbeitung von Price.csv abgeschlossen.');

  // Loggen der Anzahl der Einträge in dataMap
  console.log(`Anzahl der Einträge in dataMap: ${dataMap.size}`);
  sendProgress(`Anzahl der Einträge in dataMap: ${dataMap.size}`);

  if (dataMap.size === 0) {
    console.warn('Keine Daten zum Hochladen vorhanden.');
    sendProgress('Keine Daten zum Hochladen vorhanden.');
    return;
  }

  // Lädt die Daten in Batches hoch
  let batchCount = 0;
  const entries = Array.from(dataMap.entries());
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = new Map(entries.slice(i, i + BATCH_SIZE));
    try {
      await uploadBatch(batch, sendProgress);
      batchCount++;
      const progress = ((batchCount / totalBatches) * 100).toFixed(2);
      sendProgress(`Fortschritt: ${progress}% (${batchCount}/${totalBatches} Batches)`);
      console.log(`Fortschritt: ${progress}% (${batchCount}/${totalBatches} Batches)`);
    } catch (error) {
      console.error('Fehler beim Hochladen des Batches:', error);
      // Entscheidet sich, den Prozess abzubrechen
      throw error;
    }
  }

  sendProgress('CSV-Verarbeitung und Daten-Upload erfolgreich abgeschlossen.');
  console.log('CSV-Verarbeitung und Daten-Upload erfolgreich abgeschlossen.');
}

// GET handler to initiate processing and stream progress
export async function GET(request: NextRequest) {
  // Überprüft, ob die Verarbeitung erlaubt ist (nicht während des Builds)
  if (process.env.NEXT_PUBLIC_IS_BUILD === 'true') {
    console.log('CSV-Verarbeitung ist zur Build-Zeit nicht verfügbar.');
    return NextResponse.json({ message: 'CSV-Verarbeitung ist zur Build-Zeit nicht verfügbar.' });
  }

  // Initialisiert den SSE-Stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Funktion zum Senden von Fortschrittsmeldungen
      const sendProgress = (msg: string) => {
        const data = `data: ${msg}\n\n`;
        controller.enqueue(encoder.encode(data));
        console.log(`Progress: ${msg}`);
      };

      try {
        await processCSVs(sendProgress);
        sendProgress('CSV-Verarbeitung und Daten-Upload erfolgreich abgeschlossen.');
      } catch (error: any) {
        console.error('Fehler während der CSV-Verarbeitung:', error);
        sendProgress(`Error: ${error.message || 'Unbekannter Fehler aufgetreten.'}`);
      } finally {
        controller.close();
        redis.quit();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}