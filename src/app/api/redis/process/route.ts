import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';
import { z } from 'zod';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Define environment variable schema
const envSchema = z.object({
  REDIS_URL: z.string().url(),
  REDIS_PASSWORD: z.string().min(1),
  NEXT_PUBLIC_IS_BUILD: z.string().optional(), // Optional custom env variable
});

// Validate and parse environment variables
const env = envSchema.parse(process.env);

// Initialize Redis client
const redis = new Redis(env.REDIS_URL, {
  password: env.REDIS_PASSWORD,
});

// Function to process a single row
async function processRow(row: any, type: 'sales' | 'price') {
  const { Client, Warehouse, Product, ...dates } = row;
  const key = `${Client}:${Warehouse}:${Product}`;

  const pipeline = redis.pipeline();

  for (const [date, value] of Object.entries(dates)) {
    if (value !== undefined) {
      pipeline.hset(key, `${type}:${date}`, String(value));
    }
  }

  // Create secondary indexes
  pipeline.sadd(`index:client:${Client}`, key);
  pipeline.sadd(`index:warehouse:${Warehouse}`, key);
  pipeline.sadd(`index:product:${Product}`, key);

  await pipeline.exec();
}

// Function to stream and process a CSV file
function streamCSV(filePath: string, type: 'sales' | 'price', sendProgress: (message: string) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    let rowCount = 0;
    createReadStream(filePath)
      .pipe(csv())
      .on('data', async (row) => {
        try {
          await processRow(row, type);
          rowCount++;
          if (rowCount % 1000 === 0) {
            sendProgress(`Processed ${rowCount} rows from ${type} file`);
          }
        } catch (error) {
          reject(error);
        }
      })
      .on('end', () => {
        sendProgress(`Finished processing ${rowCount} rows from ${type} file`);
        resolve();
      })
      .on('error', (error) => reject(error));
  });
}

// Function to process all CSV files
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

// GET handler to initiate CSV processing and stream progress via SSE
export async function GET(request: NextRequest) {
  // Check if we're in build mode
  if (env.NEXT_PUBLIC_IS_BUILD === 'true') {
    // Return a mock response during build time
    return NextResponse.json({ message: 'CSV processing is not available during build time' });
  }

  // Proceed with CSV processing only if not in build mode
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
        if (error instanceof Error) {
          controller.enqueue(`data: Error processing CSV files: ${error.message}\n\n`);
        } else {
          controller.enqueue(`data: Error processing CSV files: Unknown error\n\n`);
        }
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