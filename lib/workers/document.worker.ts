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
worker.on('completed', (job, result) => {
  logger.info({
    message: `文档处理完成 | 任务ID:${job.id}`,
    documentId: job.data.documentId,
    chunkIndex: job.data.chunkIndex,
    duration:
      job.processedOn && job.finishedOn
        ? job.finishedOn - job.processedOn
        : undefined,
    metadata: {
      job: job.asJSON(), // 结构化日志元数据
      result,
    },
  });
});

worker.on('failed', (job, err) => {
  logger.warning({
    message: `文档处理失败 | 任务ID:${job?.id ?? 'unknown'}`,
    error: err.stack || err.message,
    retryCount: job?.attemptsMade,
    lastAttempt: job?.attemptsMade === job?.opts.attempts,
    documentId: job?.data.documentId,
    chunkData: job?.data, // 保留失败任务数据用于调试
  });
});

worker.on('error', (err) => {
  logger.error({
    message: '工作线程异常',
    error: err.stack || err.message,
    pid: process.pid, // 添加进程信息
    timestamp: new Date().toISOString(),
  });
});

worker.on('active', async (job) => {
  logger.debug({
    message: `开始处理分片 | 任务ID:${job.id}`,
    chunkIndex: job.data.chunkIndex,
    documentId: job.data.documentId,
    queueStats: {
      // 添加队列状态上下文
      waiting: await redisClient.llen(DOCUMENT_EMBEDDING_QUEUE),
    },
  });
});
