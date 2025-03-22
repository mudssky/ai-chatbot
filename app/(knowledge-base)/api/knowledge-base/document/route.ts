import { NextResponse } from 'next/server';
import { deleteFile, uploadFile } from '@/lib/upload/minio';
import { withAuth } from '@/lib/auth/with-auth';
import {
  addKnowledgeDocument,
  type AddKnowledgeDocumentParam,
  deleteKnowledgeDocument,
  getKnowledgeDocuments,
  updateKnowledgeDocument,
  type UpdateKnowledgeDocumentParam,
} from '@/lib/db/queries/knowledge-base';
import { documentQueue } from '@/lib/queue/document.queue';
import { generateChunks, SplitParam } from '@/lib/ai/rag';
import { DOCUMENT_EMBEDDING_QUEUE } from '@/lib/config';
import { knowledgeChunk } from '@/lib/db/schema';
import { db } from '@/lib/db/queries';
import { eq, and, ne } from 'drizzle-orm';

const BUCKET_NAME = process.env.MINIO_PROJECT_BUCKET ?? '';
/**
 * 上传知识库文档
 */
const MAX_FILE_SIZE = 1024 * 1024 * 50; // 10MB

export const POST = withAuth(async ({ request, userId }) => {
  try {
    const formData = await request?.formData();
    if (!formData) {
      return NextResponse.json({ error: '参数不正确' }, { status: 400 });
    }
    const file = formData.get('file') as File;
    const knowledgeBaseId = formData.get('knowledgeBaseId') as string;

    // 验证文件有效性
    if (!file || file.size === 0) {
      return NextResponse.json({ error: '无效的文件' }, { status: 400 });
    }

    const allowExts = ['pdf', 'txt', 'md'];
    const fileExtension = file.name.split('.').pop() ?? '';
    if (!allowExts.includes(fileExtension?.toLowerCase())) {
      return NextResponse.json({ error: '不支持的文件格式' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '文件大小超过50MB限制' },
        { status: 413 },
      );
    }

    const res = await uploadFile(BUCKET_NAME, file);
    const data = {
      knowledgeBaseId,
      fileName: file.name,
      filePath: res.filePtah,
      fileType: res.fileType,
      fileSize: res.fileSize,
      chunkSize: SplitParam.chunkSize,
      chunkOverlap: SplitParam.chunkOverlap,
      chunkCount: null,
      storageType: 'minio',
      fileExt: res.fileExt,
      processingStatus: 'pending',
    } satisfies AddKnowledgeDocumentParam;
    const addRes = await addKnowledgeDocument(data);
    // 切片和前端无关，所以异步处理，这里直接返回
    setTimeout(async () => {
      const chunks = await generateChunks(file, {
        extName: res.fileExt ?? '',
      });

      // 创建分片数据对象
      const chunkRecords = chunks.map((chunk, index) => ({
        documentId: addRes[0].id,
        content: chunk,
        chunkIndex: index,
        vector: null,
        createdAt: new Date(),
      }));
      await updateKnowledgeDocument({
        id: knowledgeBaseId,
        updates: {
          chunkCount: chunks.length,
          processingStatus: 'processing',
        } satisfies UpdateKnowledgeDocumentParam,
      });
      // 存储分片到数据库
      const inertResult = await db
        .insert(knowledgeChunk)
        .values(chunkRecords)
        .returning();

      for (const chunk of inertResult) {
        // 提交队列处理任务
        await documentQueue.add(DOCUMENT_EMBEDDING_QUEUE, chunk);
      }
    });

    return addRes;
  } catch (error) {
    console.error('[KNOWLEDGE_UPLOAD_ERROR]', error);
    return NextResponse.json(
      { error: '文件上传失败，请稍后重试' },
      { status: 500 },
    );
  }
});

// 获取当前知识库文档列表
export const GET = withAuth(async ({ request, userId }) => {
  try {
    const { searchParams } = new URL(request?.url ?? '');
    const knowledgeBaseId = searchParams.get('knowledgeBaseId');

    if (!knowledgeBaseId) {
      return NextResponse.json({ error: '缺少知识库ID参数' }, { status: 400 });
    }
    const documents = await getKnowledgeDocuments(knowledgeBaseId);
    return documents;
  } catch (error) {
    console.error('[KNOWLEDGE_GET_DOCUMENTS_ERROR]', error);
    return error;
  }
});

// 删除接口
export const DELETE = withAuth(async ({ request, userId }) => {
  try {
    const { searchParams } = new URL(request?.url ?? '');
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: '缺少文档ID参数' }, { status: 400 });
    }

    // 需要先移除队列中相关的任务
    // 1. 暂停队列
    await documentQueue.pause();
    // 2. 查询未处理完的分块
    const unProcessedChunk = await db
      .select({
        id: knowledgeChunk.id,
      })
      .from(knowledgeChunk)
      .where(
        and(
          eq(knowledgeChunk.documentId, documentId),
          ne(knowledgeChunk.isProcessed, true),
        ),
      )
      .then((res) => res.map((item) => item.id));
    // 3.查询未执行的任务
    const jobs = await documentQueue.getJobs(['waiting', 'active', 'delayed']);
    // 4. 遍历任务列表，移除与当前分片相关的任务
    for (const job of jobs) {
      // 检查任务数据是否与当前分片相关
      if (unProcessedChunk.includes(job.data.id)) {
        await job.remove();
      }
    }

    // 删除数据库中的文档记录
    const res = await deleteKnowledgeDocument({ id: documentId });
    if (!res) {
      return NextResponse.json({ error: '文档不存在' }, { status: 404 });
    }
    // 充值文档状态
    await updateKnowledgeDocument({
      id: res[0].knowledgeBaseId,
      updates: {
        chunkCount: null,
        processingStatus: 'pending',
      } satisfies UpdateKnowledgeDocumentParam,
    });

    // 删除MinIO中的文件
    await deleteFile(BUCKET_NAME, res[0].filePath);

    return true;
  } catch (error) {
    console.error('[KNOWLEDGE_DELETE_ERROR]', error);

    return error;
  } finally {
    // 判断队列是否停止状态
    const isPaused = await documentQueue.isPaused();
    if (isPaused) {
      documentQueue.resume();
    }
  }
});
