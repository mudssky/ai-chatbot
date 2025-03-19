import { NextResponse } from 'next/server';
import {
  getKnowledgeBase,
  addKnowledgeBase,
  deleteKnowledgeBase,
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

// 删除知识库
export const DELETE = withAuth(async ({ userId, request }) => {
  const { searchParams } = new URL(request?.url ?? '');
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: '缺少知识库ID参数' }, { status: 400 });
  }

  try {
    // 验证知识库属于当前用户
    const userKnowledgeBases = await getKnowledgeBase({ userId });
    const target = userKnowledgeBases.find((kb) => kb.id === id);

    if (!target) {
      return NextResponse.json(
        { error: '未找到指定知识库或无权操作' },
        { status: 404 },
      );
    }

    await deleteKnowledgeBase({ id });
    return NextResponse.json(
      { success: true, message: '知识库删除成功' },
      { status: 200 },
    );
  } catch (error) {
    console.error('删除知识库失败:', error);
    return NextResponse.json({ error: '删除知识库失败' }, { status: 500 });
  }
});
