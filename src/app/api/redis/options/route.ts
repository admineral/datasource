import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const redis = getRedisClient();

  try {
    const keys = await redis.keys('*');
    const clients = new Set<string>();
    const warehouses = new Set<string>();
    const products = new Set<string>();

    keys.forEach((key) => {
      const parts = key.split(':');
      if (parts.length === 3) {
        const [client, warehouse, product] = parts;
        clients.add(client);
        warehouses.add(warehouse);
        products.add(product);
      }
    });

    return NextResponse.json({
      clients: Array.from(clients),
      warehouses: Array.from(warehouses),
      products: Array.from(products),
    });
  } catch (error) {
    console.error('Error fetching options from Redis:', error);
    return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 });
  }
}