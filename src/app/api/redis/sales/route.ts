import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import Redis from 'ioredis';

/**
 * Utility function to perform SCAN operation.
 */
async function scanKeys(redis: Redis, pattern: string): Promise<string[]> {
  let cursor = '0';
  const keys: string[] = [];

  do {
    const [newCursor, scannedKeys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = newCursor;
    keys.push(...scannedKeys);
  } while (cursor !== '0');

  return keys;
}

export async function GET(request: NextRequest) {
  console.log('Received GET request for sales data');
  const redis = getRedisClient();
  const { searchParams } = new URL(request.url);
  const product = searchParams.get('product');

  if (!product) {
    console.warn('Product parameter is missing');
    return NextResponse.json({ error: 'Product parameter is required' }, { status: 400 });
  }

  console.log(`Fetching sales data for product: ${product}`);

  try {
    // **Optimized Fetch: Retrieve sales data from the sorted set**
    const key = `product_sales:${product}`;
    
    console.log(`Checking if sorted set exists for key: ${key}`);
    // Check if the sorted set exists
    const exists = await redis.exists(key);
    if (!exists) {
      console.log(`No sales data found for product: ${product}`);
      return NextResponse.json({ sales: [] });
    }

    console.log(`Fetching all members with scores from sorted set: ${key}`);
    // Fetch all members with their scores (dates in timestamp order)
    const salesEntries = await redis.zrange(key, 0, -1, 'WITHSCORES');

    console.log(`Processing ${salesEntries.length / 2} sales entries`);
    const salesData: { date: string; sales: number }[] = [];

    for (let i = 0; i < salesEntries.length; i += 2) {
      const date = salesEntries[i];
      const timestamp = parseInt(salesEntries[i + 1], 10);
      console.log(`Fetching sales data for date: ${date}`);
      const sales = await redis.get(`sales:${product}:${date}`);
      salesData.push({ date, sales: sales ? Number(sales) : 0 });
    }

    console.log('Sorting sales data by date');
    // Sort the data by date (optional since sorted set maintains order)
    salesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log(`Successfully retrieved and processed sales data for product: ${product}`);
    return NextResponse.json({ sales: salesData });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 });
  }
}