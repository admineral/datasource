// File: app/api/redis/process/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';
import { z } from 'zod';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import path from 'path';
import { promises as fs } from 'fs';

// Ensure the server runtime
export const runtime = 'nodejs';

// Disable caching and set maximum duration
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Define and validate environment variables
const envSchema = z.object({
  REDIS_URL: z.string().url(),
  REDIS_PASSWORD: z.string().min(1),
  NEXT_PUBLIC_IS_BUILD: z.string().optional(),
});
const env = envSchema.parse(process.env);

console.log('Environment variables validated');

// Initialize Redis client
const redis = new Redis(env.REDIS_URL, { password: env.REDIS_PASSWORD });
console.log('Redis client initialized');

// Define batch size for Redis operations
const BATCH_SIZE = 1000;
console.log(`Batch size set to ${BATCH_SIZE}`);

// Function to process a single batch and store data in Redis
async function processBatch(
  batch: Record<string, Record<string, string>>,
  sendProgress: (message: string) => void
) {
  const batchSize = Object.keys(batch).length;
  console.log(`Starting to process batch of ${batchSize} items`);
  const pipeline = redis.pipeline();

  for (const [key, data] of Object.entries(batch)) {
    for (const [field, value] of Object.entries(data)) {
      pipeline.hset(key, field, value);
    }

    const [Client, Warehouse, Product] = key.split(':');
    pipeline.sadd(`index:client:${Client}`, key);
    pipeline.sadd(`index:warehouse:${Warehouse}`, key);
    pipeline.sadd(`index:product:${Product}`, key);
  }

  console.log('Executing Redis pipeline');
  const results = await pipeline.exec();
  console.log(`Redis pipeline executed with ${results?.length} operations`);
  sendProgress(`Uploaded batch of ${batchSize} items`);
}

// Function to stream and process CSV files
async function streamCSVs(sendProgress: (message: string) => void) {
  sendProgress('Starting CSV processing');
  console.log('Starting CSV streaming and processing');

  const dataDir = path.join(process.cwd(), 'public', 'data');
  const salesPath = path.join(dataDir, 'Sales.csv');
  const pricePath = path.join(dataDir, 'Price.csv');

  sendProgress(`Sales CSV path: ${salesPath}`);
  sendProgress(`Price CSV path: ${pricePath}`);

  // Calculate total number of rows and batches
  const [salesRows, priceRows] = await Promise.all([
    getLineCount(salesPath),
    getLineCount(pricePath),
  ]);

  // Adjust totalRows based on headers
  const totalRows = salesRows + priceRows - 2; // Subtract 2 for headers
  const totalBatches = Math.ceil(totalRows / BATCH_SIZE);

  sendProgress(`Total rows: ${totalRows}, Total batches: ${totalBatches}`);

  let combinedBatch: Record<string, Record<string, string>> = {};
  let totalProcessed = 0;
  let batchCount = 0;

  const salesParser = createReadStream(salesPath).pipe(parse({ columns: true }));
  const priceParser = createReadStream(pricePath).pipe(parse({ columns: true }));

  sendProgress('CSV parsers created');
  sendProgress('Starting to process Sales and Price CSVs');

  const processRow = (row: any, type: 'sales' | 'price') => {
    const { Client, Warehouse, Product, ...dates } = row;
    const key = `${Client}:${Warehouse}:${Product}`;

    if (!combinedBatch[key]) {
      combinedBatch[key] = {};
    }

    for (const [date, value] of Object.entries(dates)) {
      if (value !== undefined && value !== '') {
        combinedBatch[key][`${type}:${date}`] = String(value);
      }
    }
  };

  console.log('Starting to process Sales and Price CSVs');
  let salesDone = false;
  let priceDone = false;
  const salesIter = salesParser[Symbol.asyncIterator]();
  const priceIter = priceParser[Symbol.asyncIterator]();

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

    // Check if batch size reached or processing is done
    if (
      Object.keys(combinedBatch).length >= BATCH_SIZE ||
      (salesDone && priceDone && Object.keys(combinedBatch).length > 0)
    ) {
      await processBatch(combinedBatch, sendProgress);
      batchCount++;

      // Increment totalProcessed by the number of items in the batch
      totalProcessed += Object.keys(combinedBatch).length;

      const progressPercentage = ((totalProcessed / totalRows) * 100).toFixed(2);
      sendProgress(
        `Processed batch ${batchCount}/${totalBatches}. Rows: ${totalProcessed}/${totalRows}. Progress: ${progressPercentage}%`
      );

      // Reset combinedBatch for the next batch
      combinedBatch = {};
    }
  }

  console.log(`Total rows processed: ${totalProcessed}`);
  sendProgress(`Finished processing ${totalProcessed} total rows in ${batchCount} batches`);
}

// Helper function to count the number of lines in a file
async function getLineCount(filePath: string): Promise<number> {
  const fileBuffer = await fs.readFile(filePath);
  const fileContent = fileBuffer.toString();
  return fileContent.split('\n').length;
}

// GET handler to initiate CSV processing and stream progress updates
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
      } catch (error: any) {
        console.error('Error processing CSV files:', error);
        controller.enqueue(
          `data: Error processing CSV files: ${
            error instanceof Error ? error.message : 'Unknown error'
          }\n\n`
        );
      } finally {
        console.log('Closing ReadableStream controller');
        controller.close();
        // Gracefully close Redis connection
        redis.quit();
      }
    },
  });

  console.log('Returning NextResponse with stream');
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}