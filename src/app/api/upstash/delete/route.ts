import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

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
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    const allEntries = await redis.lrange('entries', 0, -1);
    const updatedEntries = allEntries.filter(entry => {
      const parsedEntry: Entry = typeof entry === 'string' ? JSON.parse(entry) : entry;
      return !ids.includes(parsedEntry.id);
    });

    await redis.del('entries');
    if (updatedEntries.length > 0) {
      await redis.rpush('entries', ...updatedEntries);
    }

    return NextResponse.json({ message: 'Entries deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting entries:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}