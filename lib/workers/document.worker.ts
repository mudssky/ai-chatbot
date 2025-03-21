import { Worker } from 'bullmq';
import { DOCUMENT_EMBEDDING_QUEUE, redisClient } from '@/lib/config';
import type { DocumentJobData } from '@/lib/queue';
import { generateChunkHash, generateEmbedding } from '../ai/rag';
import {
  updateKnowledgeChunk,
  updateKnowledgeDocument,
} from '@/lib/db/queries/knowledge-base';
import { logger } from '@/lib/logger';
import { db } from '../db/queries';
import { knowledgeChunk } from '../db/schema';
import { eq, and, count } from 'drizzle-orm';

export const worker = new Worker<DocumentJobData>(
  DOCUMENT_EMBEDDING_QUEUE,
  async (job) => {
    try {
      logger.info({
        message: '正在处理任务:',
        job,
      });
      // 生成文本切片和向量
      const embedding = await generateEmbedding(job.data.content);

      const chunkHash = await generateChunkHash(job.data.content);
      await updateKnowledgeChunk({
        id: job.data.id,
        updates: {
          vector: embedding,
          isProcessed: true,
          chunkHash,
        },
      });

      //   判断分片是否执行完
      const toDoCount = await db
        .select({
          count: count(),
        })
        .from(knowledgeChunk)
        .where(
          and(
            eq(knowledgeChunk.documentId, job.data.documentId),
            eq(knowledgeChunk.isProcessed, false),
          ),
        );
      // 处理完
      if ((toDoCount?.[0]?.count ?? 0) < 1) {
        await updateKnowledgeDocument({
          id: job.data.documentId,
          updates: { processingStatus: 'completed' },
        });
      }
    } catch (error: any) {
      await updateKnowledgeDocument({
        id: job.data.documentId,
        updates: { processingStatus: 'failed' },
      });
      await updateKnowledgeChunk({
        id: job.data.id,
        updates: {
          isProcessed: false,
          processingError: error.message,
        },
      });
      throw error;
    }
  },
  {
    connection: redisClient,
    concurrency: 2,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 1000 },
  },
);
worker.on('completed', (job) => {
  logger.info(`Document processed: ${job.id}`, job.returnvalue);
});

worker.on('failed', (job, err) => {
  logger.warning(`Document process failed: ${job?.id}`, err);
});

// 添加以下事件监听器
worker.on('error', (err) => {
  logger.error({ message: 'Worker error', error: err });
});

worker.on('active', (job) => {
  logger.info(`Processing job ${job.id}`);
});
