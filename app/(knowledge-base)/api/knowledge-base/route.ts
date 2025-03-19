import { NextResponse } from 'next/server';
import {
  getKnowledgeBase,
  addKnowledgeBase,
} from '@/lib/db/queries/knowledge-base';
import { auth } from '@/app/(auth)/auth';

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return Response.json('Unauthorized!', { status: 401 });
  }
  const knows = await getKnowledgeBase({ userId: session.user.id ?? '' });
  return NextResponse.json(knows);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json('Unauthorized!', { status: 401 });
  }

  try {
    const { name, description } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 },
      );
    }

    const newEntry = await addKnowledgeBase({
      userId: session.user.id ?? '',
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
}
