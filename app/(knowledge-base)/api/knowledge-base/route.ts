import { NextResponse } from 'next/server';
import {
  getKnowledgeBase,
  addKnowledgeBase,
} from '@/lib/db/queries/knowledge-base';
import { withAuth } from '@/lib/auth/with-auth';

export const GET = withAuth(async ({ userId }) => {
  const knows = await getKnowledgeBase({ userId });
  return NextResponse.json(knows);
});

export const POST = withAuth(async ({ request, userId }) => {
  try {
    const { name, description } = (await request?.json()) ?? {};

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 },
      );
    }

    const newEntry = await addKnowledgeBase({
      userId,
      name,
      description,
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('添加知识库失败:', error);
    return NextResponse.json(
      { error: 'Failed to create knowledge base entry' },
      { status: 500 },
    );
  }
});
