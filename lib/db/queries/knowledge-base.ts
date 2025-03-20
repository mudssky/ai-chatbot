import { db } from '../queries';
import {
  type KnowledgeBase,
  knowledgeBase,
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
