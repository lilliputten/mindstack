'use server';

import { prisma } from '@/lib/db';
import { TUserId } from '@/features/users';

interface TParams {
  /** Optional user ID to filter topics by owner */
  userId?: string;
}

/**
 * Get the first available public topic ID that has questions.
 * Only returns the topic ID, nothing else.
 */
export async function getFirstPublicTopicId(params: TParams = {}): Promise<TUserId | undefined> {
  const { userId } = params;

  const topic = await prisma.topic.findFirst({
    where: {
      isPublic: true,
      questions: { some: {} },
      ...(userId ? { userId } : {}),
    },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });

  return topic?.id;
}
