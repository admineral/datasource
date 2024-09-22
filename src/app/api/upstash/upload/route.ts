import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { v4 as uuidv4 } from 'uuid';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface Entry {
  id: string;
  warehouse: string;
  client: string;
  product: string;
  price: number;
  sales: number;
}

export async function POST(request: Request) {
  try {
    const body: Omit<Entry, 'id'> = await request.json();

    if (!body.warehouse || !body.client || !body.product || typeof body.price !== 'number' || typeof body.sales !== 'number') {
      return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }

    const newEntry: Entry = {
      id: uuidv4(),
      ...body
    };

    const serializedData = JSON.stringify(newEntry);
    await redis.lpush('entries', serializedData);

    return NextResponse.json({ message: 'Data uploaded successfully', data: newEntry }, { status: 201 });
  } catch (error) {
    console.error('Error uploading data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}