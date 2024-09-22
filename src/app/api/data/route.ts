/****
 * This file handles API routes for fetching and processing data from CSV files.
 * It supports two types of data: price and sales.
 * The data is processed, cached as JSON, and served via API endpoints.
 * Key features:
 * - CSV to JSON conversion with caching
 * - Separate processing for each data type
 * - Error handling and logging
 * - Edge caching for improved performance on Vercel
 ****/

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import csv from 'csvtojson';

// Define interfaces for data structures
interface RawDataRow {
  Client: string;
  Warehouse: string;
  Product: string;
  [key: string]: string | number | null; // For date columns
}

interface DataPoint {
  date: string;
  value: number;
}

interface ApiResponse {
  data: DataPoint[];
  status: string;
}

// Set the directory for data files
const dataDir = path.join(process.cwd(), 'public', 'data');

// Ensure the directory exists for writing files
function ensureDirectoryExists(directoryPath: string) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

// Read JSON file if it exists
function readJSONFile(filePath: string): Promise<DataPoint[] | null> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      console.log(`Reading JSON file: ${filePath}`);
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) reject(err);
        else resolve(JSON.parse(data) as DataPoint[]);
      });
    } else {
      resolve(null);
    }
  });
}

// Write processed data to JSON file
function writeJSONFile(filePath: string, data: DataPoint[]): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Writing JSON file: ${filePath}`);
    const dirPath = path.dirname(filePath);
    ensureDirectoryExists(dirPath);
    fs.writeFile(filePath, JSON.stringify(data), (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Process CSV data for price and sales
function processCSVData(data: RawDataRow[], type: 'price' | 'sales'): DataPoint[] {
  console.log(`Processing ${type} CSV data`);
  const processedData: DataPoint[] = [];

  if (data.length > 0 && data[0]) {
    const dateColumns = Object.keys(data[0] as RawDataRow).filter(key => /^\d{4}-\d{2}-\d{2}$/.test(key));

    dateColumns.forEach(date => {
      let totalValue = 0;
      let count = 0;
      data.forEach((row) => {
        const value = row[date];
        if (value !== null && value !== undefined && value !== '') {
          totalValue += parseFloat(value as string) || 0;
          count++;
        }
      });
      if (count > 0) {
        processedData.push({
          date,
          value: type === 'price' ? totalValue / count : totalValue, // Average for price, total for sales
        });
      }
    });
  } else {
    console.log('No data to process or first row is undefined');
  }

  return processedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Main function to get data, either from cache or by processing CSV
async function getData(csvFileName: string, jsonFileName: string, type: 'price' | 'sales'): Promise<ApiResponse> {
  console.log(`Getting data for CSV: ${csvFileName}, JSON: ${jsonFileName}`);
  const csvFilePath = path.join(dataDir, csvFileName);
  const jsonFilePath = path.join(dataDir, jsonFileName);

  try {
    // Check if JSON file exists
    const jsonExists = await fs.promises.access(jsonFilePath).then(() => true).catch(() => false);

    if (jsonExists) {
      console.log('JSON file exists, reading from cache');
      const cachedData = await readJSONFile(jsonFilePath);
      if (cachedData) {
        return { data: cachedData, status: 'Data loaded from cache' };
      }
    }

    // If JSON doesn't exist or couldn't be read, process CSV
    console.log('Processing CSV file');
    const rawData: RawDataRow[] = await csv().fromFile(csvFilePath);
    const processedData = processCSVData(rawData, type);

    await writeJSONFile(jsonFilePath, processedData);

    return { data: processedData, status: 'Data processed and cached' };
  } catch (error) {
    console.error(`Error in getData for ${csvFileName}:`, error);
    throw error;
  }
}

// API route handler
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') as 'price' | 'sales' | null;

  console.log(`Received GET request for type: ${type}`);

  let response: ApiResponse;

  try {
    switch (type) {
      case 'price':
        response = await getData('Price.csv', 'price.json', 'price');
        break;
      case 'sales':
        response = await getData('Sales.csv', 'sales.json', 'sales');
        break;
      default:
        console.log('Invalid data type requested');
        return NextResponse.json({ error: 'Invalid data type requested' }, { status: 400 });
    }

    console.log(`Returning data for type: ${type}`);
    const nextResponse = NextResponse.json(response, { status: 200 });
    nextResponse.headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return nextResponse;
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to process data', status: 'Error' }, { status: 500 });
  }
}