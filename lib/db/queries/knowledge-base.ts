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

export async function addKnowledgeDocument(
  doc: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>,
) {
  try {
    const res = await db.insert(knowledgeDocument).values(doc).returning();
    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
