import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { z } from 'zod';

// GET handler for searching keys based on client, warehouse, product, and limit
export async function GET(request: NextRequest) {
  const redis = getRedisClient();
  const { searchParams } = new URL(request.url);
  const client = searchParams.get('client');
  const warehouse = searchParams.get('warehouse');
  const product = searchParams.get('product');
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  try {
    console.log(`Received GET request for client: ${client}, warehouse: ${warehouse}, product: ${product}, limit: ${limit}`);

    if (!client && !warehouse && !product) {
      console.warn('GET request missing search parameters');
      return NextResponse.json({ error: 'At least one search parameter is required' }, { status: 400 });
    }

    let keys: string[] = [];

    if (client) {
      keys = await redis.smembers(`index:client:${client}`);
    }
    if (warehouse) {
      const warehouseKeys = await redis.smembers(`index:warehouse:${warehouse}`);
      keys = keys.length ? keys.filter(key => warehouseKeys.includes(key)) : warehouseKeys;
    }
    if (product) {
      const productKeys = await redis.smembers(`index:product:${product}`);
      keys = keys.length ? keys.filter(key => productKeys.includes(key)) : productKeys;
    }

    // Apply limit to the keys
    keys = keys.slice(0, limit);

    // Fetch data in batches to avoid blocking the event loop
    const batchSize = 100;
    const results = {};
    for (let i = 0; i < keys.length; i += batchSize) {
      const batchKeys = keys.slice(i, i + batchSize);
      const pipeline = redis.pipeline();
      batchKeys.forEach(key => pipeline.hgetall(key));
      const batchResults = await pipeline.exec();
      batchResults.forEach(([err, value], index) => {
        if (err) {
          console.error(`Error fetching key ${batchKeys[index]}:`, err);
        } else {
          const key = batchKeys[index];
          results[key] = {
            sales: Object.fromEntries(Object.entries(value).filter(([k]) => k.startsWith('sales:')).map(([k, v]) => [k.replace('sales:', ''), v])),
            price: Object.fromEntries(Object.entries(value).filter(([k]) => k.startsWith('price:')).map(([k, v]) => [k.replace('price:', ''), v])),
          };
        }
      });
    }

    console.log('Successfully retrieved search results from Redis');
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Redis operation error:', error);
    return NextResponse.json({ error: 'Redis operation failed' }, { status: 500 });
  }
}