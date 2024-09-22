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
export async function GET(request: Request) {
    try {
      const serializedEntries = await redis.lrange('entries', 0, -1);
      const entries: Entry[] = serializedEntries.map(entry => {
        if (typeof entry === 'string') {
          try {
            return JSON.parse(entry);
          } catch (error) {
            console.error('Error parsing entry:', entry, error);
            return null;
          }
        }
        return entry as Entry;
      }).filter((entry): entry is Entry => entry !== null);
  
      return NextResponse.json({ message: 'Data retrieved successfully', data: entries }, { status: 200 });
    } catch (error) {
      console.error('Error retrieving data:', error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
  }