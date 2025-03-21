import { db } from '../queries';
import {
  type KnowledgeBase,
  knowledgeBase,
  type KnowledgeChunk,
  knowledgeChunk,
  knowledgeDocument,
  type KnowledgeDocument,
} from '../schema';
import { eq } from 'drizzle-orm';

export async function getKnowledgeBase({
  userId,
}: {
  userId: string;
}) {
  try {
    const knowledgeBases = await db
      .select()
      .from(knowledgeBase)
      .where(eq(knowledgeBase.userId, userId));
    return knowledgeBases;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function addKnowledgeBase({
  name,
  description,
  userId,
}: Omit<KnowledgeBase, 'createdAt' | 'id'>) {
  try {
    const res = await db
      .insert(knowledgeBase)
      .values({
        name,
        description,
        userId,
        createdAt: new Date(),
      })
      .returning();
    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
// 删除知识库
export async function deleteKnowledgeBase({
  id,
}: {
  id: string;
}) {
  try {
    const res = await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export type AddKnowledgeDocumentParam = Omit<
  KnowledgeDocument,
  'id' | 'createdAt' | 'updatedAt'
>;
export async function addKnowledgeDocument(doc: AddKnowledgeDocumentParam) {
  try {
    const res = await db.insert(knowledgeDocument).values(doc).returning();
    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 添加文档查询方法
export const getKnowledgeDocuments = async (knowledgeBaseId: string) => {
  return await db
    .select()
    .from(knowledgeDocument)
    .where(eq(knowledgeDocument.knowledgeBaseId, knowledgeBaseId))
    .orderBy(knowledgeDocument.createdAt);
};

// 删除知识库文档
export async function deleteKnowledgeDocument({
  id,
}: {
  id: string;
}) {
  try {
    // 先删除文档相关的所有分片记录
    await db.delete(knowledgeChunk).where(eq(knowledgeChunk.documentId, id));
    const res = await db
      .delete(knowledgeDocument)
      .where(eq(knowledgeDocument.id, id))
      .returning();
    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export type UpdateKnowledgeDocumentParam = Partial<
  Pick<KnowledgeDocument, 'chunkCount' | 'processingStatus'>
>;

export async function updateKnowledgeDocument({
  id,
  updates,
}: {
  id: string;
  updates: UpdateKnowledgeDocumentParam;
}) {
  try {
    const res = await db
      .update(knowledgeDocument)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(knowledgeDocument.id, id))
      .returning();
    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 更新切片
export type UpdateKnowledgeChunkParam = Partial<KnowledgeChunk>;

export async function updateKnowledgeChunk({
  id,
  updates,
}: {
  id: string;
  updates: UpdateKnowledgeChunkParam;
}) {
  try {
    const res = await db
      .update(knowledgeChunk)
      .set({
        ...updates,
        updatedAt: new Date(), // 自动更新修改时间
      })
      .where(eq(knowledgeChunk.id, id))
      .returning();
    return res;
  } catch (error) {
    console.error('[UPDATE_CHUNK_ERROR]', error);
    throw new Error('更新分块失败');
  }
}

// 批量更新方法
export async function batchUpdateKnowledgeChunks(
  updates: Array<{
    id: string;
    data: UpdateKnowledgeChunkParam;
  }>,
) {
  try {
    return await db.transaction(async (tx) => {
      const results = [];
      for (const { id, data } of updates) {
        const res = await tx
          .update(knowledgeChunk)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(knowledgeChunk.id, id))
          .returning();
        results.push(res[0]);
      }
      return results;
    });
  } catch (error) {
    console.error('[BATCH_UPDATE_CHUNKS_ERROR]', error);
    throw new Error('批量更新分块失败');
  }
}
