import IORedis from 'ioredis';
import { env } from './env';

export const redisClient = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});
