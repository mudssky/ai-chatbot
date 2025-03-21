import { z } from 'zod';
import * as dotenv from 'dotenv';
dotenv.config();

// 定义配置模式
const envSchema = z.object({
  // 数据库配置
  POSTGRES_URL: z.string().min(1),

  // MinIO配置
  MINIO_ENDPOINT: z.string().min(1),
  MINIO_PORT: z.string().transform((val) => Number.parseInt(val, 10)),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(1),
  MINIO_PROJECT_BUCKET: z.string().min(1),
  // MINIO_USE_SSL: z.string().transform((val) => val === 'true'),

  // AI服务配置
  // OPENAI_API_KEY: z.string().min(1),
  DEEPSEEK_API_KEY: z.string().min(1),

  // 应用配置
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .default('3000'),

  // redis配置
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.string().transform((val) => Number.parseInt(val, 10)),
  // 日志配置
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('debug'),
});

const _env = envSchema.safeParse(process.env);
if (!_env.success) {
  console.error('❌ 环境变量验证失败');
  console.error(_env.error.format());
  throw new Error('环境变量验证失败');
}

// 导出类型安全的配置对象
export const env = _env.data;
