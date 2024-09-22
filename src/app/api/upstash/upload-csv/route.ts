import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { parse } from 'csv-parse/sync';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const csvContent = await file.text();
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  const pipeline = redis.pipeline();
  const clients = new Set<string>();
  const warehouses = new Set<string>();
  const products = new Set<string>();

  const dataType = file.name.toLowerCase().includes('price') ? 'price' : 'sales';

  for (const record of records) {
    const key = `data:${record.Client}:${record.Warehouse}:${record.Product}`;
    
    const weekData: Record<string, string> = {};
    for (const [week, value] of Object.entries(record)) {
      if (week.startsWith('Week_') && typeof value === 'string') {
        weekData[`${dataType}:${week}`] = value;
      }
    }
    
    if (Object.keys(weekData).length > 0) {
      pipeline.hset(key, weekData);
    }

    clients.add(record.Client);
    warehouses.add(record.Warehouse);
    products.add(record.Product);
  }

  pipeline.sadd('clients', Array.from(clients));
  pipeline.sadd('warehouses', Array.from(warehouses));
  pipeline.sadd('products', Array.from(products));

  try {
    await pipeline.exec();
    return NextResponse.json({ message: 'CSV data uploaded successfully' });
  } catch (error) {
    console.error('Error uploading CSV data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}