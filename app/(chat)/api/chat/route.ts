import { createDataStreamResponse, smoothStream, streamText } from 'ai';
import { auth } from '@/app/(auth)/auth';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  db,
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { isProductionEnvironment } from '@/lib/constants';
import { NextResponse } from 'next/server';
import { myProvider } from '@/lib/ai/providers';
import type { ChatParams } from '@/components/chat';
import { knowledgeChunk, knowledgeDocument } from '@/lib/db/schema';
import { cosineDistance, desc, inArray, sql } from 'drizzle-orm';
import { generateEmbedding } from '@/lib/ai/rag';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const res = (await request.json()) as ChatParams;
    const { id, messages, selectedChatModel, selectedKnowledgeBases } = res;
    console.log({ selectedChatModel });
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });

      await saveChat({ id, userId: session.user.id, title });
    } else {
      if (chat.userId !== session.user.id) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    await saveMessages({
      messages: [{ ...userMessage, createdAt: new Date(), chatId: id }],
    });

    const userMessageEmb = await generateEmbedding(userMessage.content);
    const similarity = sql<number>`1 - (${cosineDistance(
      knowledgeChunk.vector,
      userMessageEmb,
    )})`;
    // 先查询知识库的所有文档id
    const documentIds = (
      await db
        .select({
          id: knowledgeDocument.id,
        })
        .from(knowledgeDocument)
        .where(
          inArray(knowledgeDocument.knowledgeBaseId, selectedKnowledgeBases),
        )
    ).map((item) => item.id);
    // 添加知识库向量检索功能
    let knowledgeContext = '';
    if (selectedKnowledgeBases && selectedKnowledgeBases.length > 0) {
      const knowledgeChunks = await db
        .select({
          id: knowledgeChunk.id,
          content: knowledgeChunk.content,
          documentId: knowledgeChunk.documentId,
          vector: knowledgeChunk.vector,
          processingError: knowledgeChunk.processingError,
          similarity,
        })
        .from(knowledgeChunk)
        .where(inArray(knowledgeChunk.documentId, documentIds))
        .orderBy((t) => desc(t.similarity))
        .limit(3); // 限制检索结果数量

      knowledgeContext = knowledgeChunks
        .map((chunk) => chunk.content)
        .join('\n');
    }
    const sysPrompt = systemPrompt({ selectedChatModel, knowledgeContext });
    return createDataStreamResponse({
      execute: (dataStream) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: sysPrompt,
          messages,
          maxSteps: 5,
          // 推理模型deepseek-r1不支持functional calling
          experimental_activeTools:
            selectedChatModel === 'deepseek-reasoner'
              ? []
              : [
                  'getWeather',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          // tools: {
          //   getWeather,
          //   createDocument: createDocument({ session, dataStream }),
          //   updateDocument: updateDocument({ session, dataStream }),
          //   requestSuggestions: requestSuggestions({
          //     session,
          //     dataStream,
          //   }),
          // },
          onFinish: async ({ response, reasoning }) => {
            if (session.user?.id) {
              try {
                const sanitizedResponseMessages = sanitizeResponseMessages({
                  messages: response.messages,
                  reasoning,
                });

                await saveMessages({
                  messages: sanitizedResponseMessages.map((message) => {
                    return {
                      id: message.id,
                      chatId: id,
                      role: message.role,
                      content: message.content,
                      createdAt: new Date(),
                    };
                  }),
                });
              } catch (error) {
                console.error('Failed to save chat');
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: (err) => {
        console.error({ err });
        return 'Oops, an error occured!';
      },
    });
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
