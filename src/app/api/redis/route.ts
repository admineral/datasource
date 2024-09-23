import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';
import { z } from 'zod';

// Definieren Sie einen Typ für die Umgebungsvariablen
interface Env {
  REDIS_URL: string;
  REDIS_PASSWORD: string;
}

// Validieren Sie die Umgebungsvariablen
const env = z.object({
  REDIS_URL: z.string().url(),
  REDIS_PASSWORD: z.string().min(1),
}).parse(process.env) as Env;

// Initialisieren Sie den Redis-Client
const redis = new Redis({
  host: new URL(env.REDIS_URL).hostname,
  port: parseInt(new URL(env.REDIS_URL).port, 10),
  password: env.REDIS_PASSWORD,
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

// GET-Anfrage-Handler
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  try {
    if (key === 'all') {
      const keys = await redis.keys('*');
      return NextResponse.json({ keys });
    }

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const value = await redis.get(key);
    return NextResponse.json({ [key]: value });
  } catch (error) {
    console.error('Redis operation error:', error);
    return NextResponse.json({ error: 'Redis operation failed' }, { status: 500 });
  }
}

// POST-Anfrage-Handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = z.object({
      key: z.string().min(1),
      value: z.string().min(1),
    }).parse(body);

    await redis.set(key, value);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('Redis SET error:', error);
    return NextResponse.json({ error: 'Failed to set value' }, { status: 500 });
  }
}