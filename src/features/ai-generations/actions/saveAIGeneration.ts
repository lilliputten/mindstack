'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { AIGenerationError } from '@/lib/errors/AIGenerationError';
import { getErrorText } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';

import { checkAllowedAIGenerations } from './checkAllowedAIGenerations';

type TData = Omit<Prisma.AIGenerationUncheckedCreateInput, 'userId'>;

export async function saveAIGeneration(data: TData) {
  // Check if user is allowed to perform generations
  await checkAllowedAIGenerations();

  const user = await getCurrentUser();
  if (!user) {
    throw new AIGenerationError('UNATHORIZED');
  }

  try {
    // Create AIGeneration record
    const result = await prisma.aIGeneration.create({
      data: { ...data, userId: user.id },
    });

    return result;
  } catch (error) {
    const errMsg = getErrorText(error);
    // eslint-disable-next-line no-console
    console.error('[saveAIGeneration]', errMsg, {
      error,
      user,
    });
    debugger; // eslint-disable-line no-debugger
    // Re-throw errors from checkAllowedAIGenerations or other errors
    throw error;
  }
}
