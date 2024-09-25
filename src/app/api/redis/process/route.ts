import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';
import { z } from 'zod';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { pipeline } from 'stream/promises';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Environment variable schema and validation
const env = z.object({
  REDIS_URL: z.string().url(),
  REDIS_PASSWORD: z.string().min(1),
  NEXT_PUBLIC_IS_BUILD: z.string().optional(),
}).parse(process.env);

// Initialize Redis client
const redis = new Redis(env.REDIS_URL, { password: env.REDIS_PASSWORD });

// Batch size for Redis operations
const BATCH_SIZE = 1000;

// Process rows in batches
async function processBatch(batch: any[], type: 'sales' | 'price') {
  const pipeline = redis.pipeline();

  for (const row of batch) {
    const { Client, Warehouse, Product, ...dates } = row;
    const key = `${Client}:${Warehouse}:${Product}`;

    for (const [date, value] of Object.entries(dates)) {
      if (value !== undefined) {
        pipeline.hset(key, `${type}:${date}`, String(value));
      }
    }

    pipeline.sadd(`index:client:${Client}`, key);
    pipeline.sadd(`index:warehouse:${Warehouse}`, key);
    pipeline.sadd(`index:product:${Product}`, key);
  }

  await pipeline.exec();
}

// Stream and process a CSV file
async function streamCSV(filePath: string, type: 'sales' | 'price', sendProgress: (message: string) => void) {
  let rowCount = 0;
  let batch: any[] = [];

  await pipeline(
    createReadStream(filePath),
    csv(),
    async function* (source) {
      for await (const row of source) {
        batch.push(row);
        rowCount++;

        if (batch.length >= BATCH_SIZE) {
          await processBatch(batch, type);
          sendProgress(`Processed ${rowCount} rows from ${type} file`);
          batch = [];
          yield; // Allow event loop to handle other tasks
        }
      }

      if (batch.length > 0) {
        await processBatch(batch, type);
      }

      sendProgress(`Finished processing ${rowCount} rows from ${type} file`);
    }
  );
}

// Process all CSV files
async function processCSVFiles(sendProgress: (message: string) => void) {
  const dataDir = path.join(process.cwd(), 'public', 'data');
  sendProgress(`Starting to process CSV files in directory: ${dataDir}`);

  try {
    await Promise.all([
      streamCSV(path.join(dataDir, 'Sales.csv'), 'sales', sendProgress),
      streamCSV(path.join(dataDir, 'Price.csv'), 'price', sendProgress)
    ]);
    sendProgress('Finished processing all CSV files');
  } catch (error) {
    console.error('Error processing CSV files:', error);
    sendProgress(`Error processing CSV files: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// GET handler
export async function GET(request: NextRequest) {
  if (env.NEXT_PUBLIC_IS_BUILD === 'true') {
    return NextResponse.json({ message: 'CSV processing is not available during build time' });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (message: string) => {
        controller.enqueue(`data: ${message}\n\n`);
      };

      try {
        await processCSVFiles(sendProgress);
        controller.enqueue(`data: Successfully processed CSV files and stored data in Redis\n\n`);
      } catch (error) {
        console.error('Error processing CSV files:', error);
        controller.enqueue(`data: Error processing CSV files: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}