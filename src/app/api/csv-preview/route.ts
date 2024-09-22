import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';

export const maxDuration = 300;

interface Record {
  Client: string;
  Warehouse: string;
  Product: string;
  [key: string]: string | number;
}

interface CombinedRecord {
  Client: string;
  Warehouse: string;
  Product: string;
  [key: string]: string | number | { price: number; sales: number };
}

interface ProcessedData {
  preview: CombinedRecord[];
  totalRecords: number;
  headers: string[];
}

interface CacheEntry {
  data: ProcessedData;
  timestamp: number;
}

const cache: { [key: string]: CacheEntry } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const files = searchParams.get('files')?.split(',') || [];
    const warehouse = searchParams.get('warehouse');
    const client = searchParams.get('client');
    const product = searchParams.get('product');

    console.log('Requested files:', files);

    if (files.length !== 2 || !files.includes('Price.csv') || !files.includes('Sales.csv')) {
      return NextResponse.json({ error: 'Both Price.csv and Sales.csv files are required' }, { status: 400 });
    }

    const cacheKey = `${files.sort().join(',')}_${warehouse || ''}_${client || ''}_${product || ''}`;
    const now = Date.now();

    let processedData: ProcessedData;

    // Check cache
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
      console.log('Using cached data');
      processedData = cache[cacheKey].data;
    } else {
      let priceRecords: Record[] = [];
      let salesRecords: Record[] = [];

      for (const fileName of files) {
        const filePath = path.join(process.cwd(), 'public', 'data', fileName);
        console.log('Attempting to read file at:', filePath);

        const fileContent = await fs.readFile(filePath, 'utf-8');
        console.log('File content length:', fileContent.length);

        const fileRecords: Record[] = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
        });

        if (fileName === 'Price.csv') {
          priceRecords = fileRecords;
        } else {
          salesRecords = fileRecords;
        }
      }

      // Combine price and sales data
      const combinedRecords: CombinedRecord[] = priceRecords.map(priceRecord => {
        const salesRecord = salesRecords.find(
          s => s.Client === priceRecord.Client &&
               s.Warehouse === priceRecord.Warehouse &&
               s.Product === priceRecord.Product
        );

        const combined: CombinedRecord = {
          Client: priceRecord.Client,
          Warehouse: priceRecord.Warehouse,
          Product: priceRecord.Product
        };

        Object.keys(priceRecord).forEach(key => {
          if (key !== 'Client' && key !== 'Warehouse' && key !== 'Product') {
            combined[key] = {
              price: parseFloat(priceRecord[key] as string) || 0,
              sales: salesRecord ? parseFloat(salesRecord[key] as string) || 0 : 0
            };
          }
        });

        return combined;
      });

      // Filter records based on query parameters
      let filteredRecords = combinedRecords.filter(record => {
        return (!warehouse || record.Warehouse === warehouse) &&
               (!client || record.Client === client) &&
               (!product || record.Product === product);
      });

      const headers = ['Client', 'Warehouse', 'Product', ...Object.keys(combinedRecords[0] || {}).filter(key => key !== 'Client' && key !== 'Warehouse' && key !== 'Product')];

      processedData = { 
        preview: filteredRecords.slice(0, 5),
        totalRecords: filteredRecords.length,
        headers: headers
      };

      // Update cache
      cache[cacheKey] = { data: processedData, timestamp: now };
    }

    return NextResponse.json(processedData);
  } catch (error: unknown) {
    console.error('Error in CSV preview route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to process CSV file(s): ${errorMessage}` }, { status: 500 });
  }
}