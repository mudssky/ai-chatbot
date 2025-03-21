import { Worker } from 'bullmq';
import { DOCUMENT_EMBEDING_QUEUE } from '../config/queue';
import type { DocumentJobData } from '@/lib/queue';
import { generateEmbeddings } from '../ai/rag';
import { updateKnowledgeDocument } from '../db/queries/knowledge-base';
import { redisClient } from '../config';

const worker = new Worker<DocumentJobData>(
  DOCUMENT_EMBEDING_QUEUE,
  async (job) => {
    try {
      console.log({ job });

      //   const { documentId, filePath, fileType } = job.data;

      // 从MinIO获取文件内容
      //   const content = await getFileContent(
      //     process.env.MINIO_PROJECT_BUCKET!,
      //     filePath,
      //   );

      // 生成文本切片和向量
      const embeddings = await generateEmbeddings(job.data.content);
      // TODO
      //   更新数据库记录
      //     await updateKnowledgeDocument({
      //       id: documentId,
      //       chunkCount: embeddings.length,
      //       processingStatus: 'completed',
      //       updatedAt: new Date(),
      //     });

      return { success: true, chunks: embeddings.length };
    } catch (error) {
      await updateKnowledgeDocument({
        id: job.data.documentId,
        updates: { processingStatus: 'failed' },
      });
      throw error;
    }
  },
  {
    connection: redisClient,
    concurrency: 1,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 1000 },
  },
);

worker.on('completed', (job) => {
  console.log(`Document processed: ${job.id}`, job.returnvalue);
});

worker.on('failed', (job, err) => {
  console.error(`Document process failed: ${job?.id}`, err);
});
