import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { z } from 'zod';

// GET handler for searching keys
export async function GET(request: NextRequest) {
  const redis = getRedisClient();
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  try {
    console.log(`Received GET request for key: ${key}`);

    if (key === 'all') {
      const keys = await redis.keys('*');
      console.log('Successfully retrieved all keys from Redis');
      return NextResponse.json({ keys });
    }

    if (!key) {
      console.warn('GET request missing key parameter');
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const value = await redis.hgetall(key);
    console.log(`Successfully retrieved value for key: ${key}`);
    return NextResponse.json({ [key]: value });
  } catch (error) {
    console.error('Redis operation error:', error);
    return NextResponse.json({ error: 'Redis operation failed' }, { status: 500 });
  }
}

// POST handler for setting key-value pairs
export async function POST(request: NextRequest) {
  const redis = getRedisClient();
  try {
    const body = await request.json();
    const parsedBody = z.object({
      key: z.string().min(1),
      value: z.union([z.string(), z.number(), z.instanceof(Buffer)]),
    }).parse(body);

    const { key, value } = parsedBody;

    console.log(`Received POST request to set key: ${key} with value: ${value}`);
    await redis.set(key, String(value)); // Ensure value is a string
    console.log(`Successfully set key: ${key} with value: ${value}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn('Invalid input in POST request', error);
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('Redis SET error:', error);
    return NextResponse.json({ error: 'Failed to set value' }, { status: 500 });
  }
}

// DELETE handler for cleaning the database
export async function DELETE() {
  const redis = getRedisClient();
  try {
    await redis.flushdb();
    console.log('Successfully cleaned the database');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Redis FLUSHDB error:', error);
    return NextResponse.json({ error: 'Failed to clean the database' }, { status: 500 });
  }
}