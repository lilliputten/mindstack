'use server';

import { BASIC_USER_GENERATIONS, PRO_USER_MONTHLY_GENERATIONS } from '@/config/envServer';
import { getCurrentUser } from '@/lib/session';

import { TAIGenerationsStatus, unlimitedGenerations } from '../types/TAIGenerationsStatus';
import { getUserAIGenerationsStats } from './getUserAIGenerationsStats';

const invalidResult = { availableGenerations: 0 };

export async function getUserAIGenerationsStatus(): Promise<TAIGenerationsStatus> {
  const user = await getCurrentUser();

  if (!user) {
    return { ...invalidResult, reasonCode: 'UNATHORIZED' };
  }

  const { grade, role } = user;

  if (grade === 'PREMIUM' || role === 'ADMIN') {
    return { grade, role, availableGenerations: unlimitedGenerations };
  }

  if (grade === 'GUEST') {
    return { ...invalidResult, grade, role, reasonCode: 'GUEST_USERS_ARE_NOT_ALLOWED_TO_GENERATE' };
  }

  const { totalGenerations, lastMonthGenerations } = await getUserAIGenerationsStats();

  if (grade === 'BASIC') {
    return {
      grade,
      role,
      generationMode: 'TOTAL',
      availableGenerations: Math.max(0, BASIC_USER_GENERATIONS - totalGenerations),
      usedGenerations: totalGenerations,
      reasonCode:
        totalGenerations >= BASIC_USER_GENERATIONS
          ? 'BASIC_USER_HAS_EXCEEDED_GENERATION_LIMIT'
          : undefined,
    };
  } else if (grade === 'PRO') {
    return {
      grade,
      role,
      generationMode: 'MONTHLY',
      availableGenerations: Math.max(0, PRO_USER_MONTHLY_GENERATIONS - lastMonthGenerations),
      usedGenerations: lastMonthGenerations,
      reasonCode:
        lastMonthGenerations >= PRO_USER_MONTHLY_GENERATIONS
          ? 'PRO_USER_HAS_EXCEEDED_GENERATION_LIMIT'
          : undefined,
    };
  }

  return {
    grade,
    role,
    availableGenerations: 0,
    reasonCode: 'UNKNOWN_USER_GRADE',
  };
}
