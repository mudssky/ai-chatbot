import { auth } from '@/app/(auth)/auth';
import { NextResponse } from 'next/server';

type AuthHandler<T = any> = (context: {
  request?: Request;
  user: any;
  userId: string;
}) => Promise<T>;

export function withAuth<T>(handler: AuthHandler<T>) {
  return async (request?: Request) => {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json('Unauthorized!', { status: 401 });
    }

    return handler({
      request,
      user: session.user,
      userId: session.user.id ?? '',
    });
  };
}
