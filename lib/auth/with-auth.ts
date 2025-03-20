import { auth } from '@/app/(auth)/auth';
import { NextResponse } from 'next/server';

type AuthHandler<T = any> = (context: {
  request?: Request;
  user: any;
  userId: string;
}) => Promise<T>;

export function withAuth<T>(handler: AuthHandler<T>) {
  return async (request?: Request) => {
    try {
      const session = await auth();

      if (!session || !session.user) {
        return NextResponse.json('Unauthorized!', { status: 401 });
      }

      const result = await handler({
        request,
        user: session.user,
        userId: session.user.id ?? '',
      });
      // 统一成功响应格式
      return NextResponse.json({
        code: 0,
        data: result ?? null,
        msg: 'success',
      });
    } catch (error) {
      console.error('[API ERROR]', error);
      // 统一错误响应格式
      return NextResponse.json(
        {
          code: 1,
          data: null,
          msg: error instanceof Error ? error.message : '服务器内部错误',
        },
        { status: 500 },
      );
    }
  };
}
