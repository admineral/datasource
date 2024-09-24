// /app/api/redis/process/route.ts

import { NextRequest } from 'next/server';
import Redis from 'ioredis';
import { z } from 'zod';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { ReadableStream } from 'web-streams-polyfill';

export const maxDuration = 300;

// Define environment variable schema
const envSchema = z.object({
  REDIS_URL: z.string().url(),
  REDIS_PASSWORD: z.string().min(1),
});

// Validate and parse environment variables
const env = envSchema.parse(process.env);

// Initialize Redis client
const redis = new Redis(env.REDIS_URL, {
  password: env.REDIS_PASSWORD,
});

// Handle Redis connection events
redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

// Function to ensure Redis is connected
const connectRedis = async () => {
  if (redis.status === 'end' || redis.status === 'reconnecting') {
    await redis.connect();
  }
};

// Function to parse and combine CSV data
const parseAndCombineCSV = async (
  salesFilePath: string,
  priceFilePath: string,
  sendProgress: (message: string) => void
) => {
  console.log(`Starting to process CSV files: ${salesFilePath} and ${priceFilePath}`);
  await connectRedis();

  return new Promise<void>((resolve, reject) => {
    const salesResults: any[] = [];
    const priceResults: any[] = [];
    const batchSize = 1000; // Adjust batch size as needed
    let batchCount = 0;

    const readCSV = (filePath: string, results: any[]) => {
      return new Promise<void>((resolve, reject) => {
        createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => resolve())
          .on('error', (error) => reject(error));
      });
    };

    Promise.all([
      readCSV(salesFilePath, salesResults),
      readCSV(priceFilePath, priceResults),
    ])
      .then(async () => {
        console.log(`Finished reading CSV files. Processing data...`);
        try {
          const combinedResults = new Map();

          // Combine sales data
          for (const row of salesResults) {
            const { Client, Warehouse, Product, ...dates } = row;
            const key = `${Client}:${Warehouse}:${Product}`;
            if (!combinedResults.has(key)) {
              combinedResults.set(key, { sales: {}, price: {} });
            }
            for (const [date, value] of Object.entries(dates)) {
              if (value !== undefined) {
                combinedResults.get(key).sales[date] = String(value);
              }
            }
          }

          // Combine price data
          for (const row of priceResults) {
            const { Client, Warehouse, Product, ...dates } = row;
            const key = `${Client}:${Warehouse}:${Product}`;
            if (!combinedResults.has(key)) {
              combinedResults.set(key, { sales: {}, price: {} });
            }
            for (const [date, value] of Object.entries(dates)) {
              if (value !== undefined) {
                combinedResults.get(key).price[date] = String(value);
              }
            }
          }

          const totalBatches = Math.ceil(combinedResults.size / batchSize);
          const entries = Array.from(combinedResults.entries());

          for (let i = 0; i < entries.length; i += batchSize) {
            const batch = entries.slice(i, i + batchSize);
            const pipeline = redis.pipeline();

            for (const [key, data] of batch) {
              const [client, warehouse, product] = key.split(':');

              // Store the combined data
              for (const [date, value] of Object.entries(data.sales)) {
                pipeline.hset(key, `sales:${date}`, value as string);
              }
              for (const [date, value] of Object.entries(data.price)) {
                pipeline.hset(key, `price:${date}`, value as string);
              }

              // Create secondary indexes
              pipeline.sadd(`index:client:${client}`, key);
              pipeline.sadd(`index:warehouse:${warehouse}`, key);
              pipeline.sadd(`index:product:${product}`, key);
            }

            await pipeline.exec();
            batchCount++;
            const progressMessage = `Processed batch ${batchCount} of ${totalBatches}`;
            console.log(progressMessage);
            sendProgress(progressMessage);
          }

          console.log(`Successfully processed and stored combined data from CSV files`);
          resolve();
        } catch (error) {
          console.error(`Error processing combined data from CSV files`, error);
          reject(error);
        }
      })
      .catch((error) => {
        console.error(`Error reading CSV files`, error);
        reject(error);
      });
  });
};

// Function to process all CSV files
const processCSVFiles = async (sendProgress: (message: string) => void) => {
  const dataDir = path.join(process.cwd(), 'public', 'data');
  console.log(`Starting to process all CSV files in directory: ${dataDir}`);
  sendProgress(`Starting to process all CSV files in directory: ${dataDir}`);

  await parseAndCombineCSV(
    path.join(dataDir, 'Sales.csv'),
    path.join(dataDir, 'Price.csv'),
    sendProgress
  );

  console.log('Finished processing all CSV files');
  sendProgress('Finished processing all CSV files');
};

// GET handler to initiate CSV processing and stream progress via SSE
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'production') {
    // Create a ReadableStream using web-streams-polyfill
    const stream = new ReadableStream({
      start(controller) {
        // Function to send progress messages to the client
        const sendProgress = (message: string) => {
          controller.enqueue(`data: ${message}\n\n`);
        };

        // Start processing CSV files asynchronously
        processCSVFiles(sendProgress)
          .then(() => {
            controller.enqueue(`data: Successfully processed CSV files and stored data in Redis\n\n`);
            controller.close();
          })
          .catch((error) => {
            console.error('Error processing CSV files:', error);
            if (error instanceof Error) {
              controller.enqueue(`data: Error processing CSV files: ${error.message}\n\n`);
            } else {
              controller.enqueue(`data: Error processing CSV files: Unknown error\n\n`);
            }
            controller.close();
          });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } else {
    // Return a mock response during build time
    return new Response(JSON.stringify({ message: 'CSV processing is not available during build time' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  }
}