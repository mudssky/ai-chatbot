import IORedis from 'ioredis';

export const redisClient = new IORedis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});
