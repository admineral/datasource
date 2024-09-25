import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';
import { z } from 'zod';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Environment variable schema and validation
const env = z.object({
  REDIS_URL: z.string().url(),
  REDIS_PASSWORD: z.string().min(1),
  NEXT_PUBLIC_IS_BUILD: z.string().optional(),
}).parse(process.env);

console.log('Environment variables validated');

// Initialize Redis client
const redis = new Redis(env.REDIS_URL, { password: env.REDIS_PASSWORD });
console.log('Redis client initialized');

// Batch size for Redis operations
const BATCH_SIZE = 1000;
console.log(`Batch size set to ${BATCH_SIZE}`);

// Process combined data in batches
async function processBatch(batch: Record<string, any>, sendProgress: (message: string) => void) {
  console.log(`Starting to process batch of ${Object.keys(batch).length} items`);
  const pipeline = redis.pipeline();

  for (const [key, data] of Object.entries(batch)) {
    for (const [field, value] of Object.entries(data)) {
      pipeline.hset(key, field, String(value));
    }
    
    const [Client, Warehouse, Product] = key.split(':');
    pipeline.sadd(`index:client:${Client}`, key);
    pipeline.sadd(`index:warehouse:${Warehouse}`, key);
    pipeline.sadd(`index:product:${Product}`, key);
  }

  console.log('Executing Redis pipeline');
  const results = await pipeline.exec();
  console.log(`Redis pipeline executed with ${results?.length} operations`);
  sendProgress(`Uploaded batch of ${Object.keys(batch).length} items`);
}

// Stream and process CSV files
async function streamCSVs(sendProgress: (message: string) => void) {
  console.log('Starting CSV streaming and processing');
  const dataDir = path.join(process.cwd(), 'public', 'data');
  const salesPath = path.join(dataDir, 'Sales.csv');
  const pricePath = path.join(dataDir, 'Price.csv');

  console.log(`Sales CSV path: ${salesPath}`);
  console.log(`Price CSV path: ${pricePath}`);

  let combinedBatch: Record<string, any> = {};
  let totalProcessed = 0;
  let batchCount = 0;

  const salesParser = createReadStream(salesPath).pipe(parse({ columns: true }));
  const priceParser = createReadStream(pricePath).pipe(parse({ columns: true }));

  console.log('CSV parsers created');

  const processRow = (row: any, type: 'sales' | 'price') => {
    const { Client, Warehouse, Product, ...dates } = row;
    const key = `${Client}:${Warehouse}:${Product}`;

    if (!combinedBatch[key]) {
      combinedBatch[key] = {};
    }

    for (const [date, value] of Object.entries(dates)) {
      if (value !== undefined) {
        combinedBatch[key][`${type}:${date}`] = String(value);
      }
    }

    totalProcessed++;
  };

  console.log('Starting to process Sales and Price CSVs');
  let salesDone = false;
  let priceDone = false;
  let salesIter = salesParser[Symbol.asyncIterator]();
  let priceIter = priceParser[Symbol.asyncIterator]();

  while (!salesDone || !priceDone) {
    if (!salesDone) {
      const { value: salesRow, done: salesFinished } = await salesIter.next();
      if (salesFinished) {
        salesDone = true;
      } else {
        processRow(salesRow, 'sales');
      }
    }

    if (!priceDone) {
      const { value: priceRow, done: priceFinished } = await priceIter.next();
      if (priceFinished) {
        priceDone = true;
      } else {
        processRow(priceRow, 'price');
      }
    }

    if (Object.keys(combinedBatch).length >= BATCH_SIZE || (salesDone && priceDone)) {
      await processBatch(combinedBatch, sendProgress);
      batchCount++;
      sendProgress(`Processed and uploaded batch ${batchCount}. Total rows: ${totalProcessed}`);
      combinedBatch = {};
    }

    if (totalProcessed % 10000 === 0) {
      sendProgress(`Processed ${totalProcessed} rows`);
    }
  }

  console.log(`Total rows processed: ${totalProcessed}`);
  sendProgress(`Finished processing ${totalProcessed} total rows in ${batchCount} batches`);
}

// GET handler
export async function GET(request: NextRequest) {
  console.log('GET request received');

  if (env.NEXT_PUBLIC_IS_BUILD === 'true') {
    console.log('Request during build time, returning early');
    return NextResponse.json({ message: 'CSV processing is not available during build time' });
  }

  const stream = new ReadableStream({
    async start(controller) {
      console.log('Starting ReadableStream');
      const sendProgress = (message: string) => {
        console.log(`Progress: ${message}`);
        controller.enqueue(`data: ${message}\n\n`);
      };

      try {
        console.log('Starting CSV processing');
        await streamCSVs(sendProgress);
        console.log('CSV processing completed successfully');
        controller.enqueue(`data: Successfully processed CSV files and stored data in Redis\n\n`);
      } catch (error) {
        console.error('Error processing CSV files:', error);
        controller.enqueue(`data: Error processing CSV files: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`);
      } finally {
        console.log('Closing ReadableStream controller');
        controller.close();
      }
    },
  });

  console.log('Returning NextResponse with stream');
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}