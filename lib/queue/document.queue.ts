import { Queue } from 'bullmq';
import { redisClient } from '@/lib/config/redis';
import { DOCUMENT_EMBEDING_QUEUE } from '@/lib/config';
import type { KnowledgeChunk } from '../db/schema';
export type DocumentJobData = KnowledgeChunk;

export const documentQueue = new Queue<DocumentJobData>(
  DOCUMENT_EMBEDING_QUEUE,
  {
    connection: redisClient,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    },
  },
);
