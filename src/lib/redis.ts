import Redis from 'ioredis';
import type { Redis as RedisType } from 'ioredis';

let redis: RedisType | null = null;

export const getRedisClient = () => {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL;
    const redisPassword = process.env.REDIS_PASSWORD;

    if (!redisUrl || !redisPassword) {
      throw new Error('Missing Redis configuration');
    }

    redis = new Redis(redisUrl, {
      password: redisPassword,
    });

    redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    redis.on('connect', () => {
      console.log('Successfully connected to Redis');
    });
  }

  return redis;
};