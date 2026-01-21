'use server';

import { UserGradeType } from '@/generated/prisma';

import {
  BASIC_ANSWERS_LIMIT,
  BASIC_QUESTIONS_LIMIT,
  BASIC_TOPICS_LIMIT,
  PREMIUM_ANSWERS_LIMIT,
  PREMIUM_QUESTIONS_LIMIT,
  PREMIUM_TOPICS_LIMIT,
  PRO_ANSWERS_LIMIT,
  PRO_QUESTIONS_LIMIT,
  PRO_TOPICS_LIMIT,
} from '@/config/envServer';
import { prisma } from '@/lib/db';
import { ContentLimitError } from '@/lib/errors';
import { getCurrentUser } from '@/lib/session';

const TOPICS_LIMIT = {
  GUEST: 0,
  BASIC: BASIC_TOPICS_LIMIT,
  PRO: PRO_TOPICS_LIMIT,
  PREMIUM: PREMIUM_TOPICS_LIMIT,
} as const;

const QUESTIONS_LIMIT = {
  GUEST: 0,
  BASIC: BASIC_QUESTIONS_LIMIT,
  PRO: PRO_QUESTIONS_LIMIT,
  PREMIUM: PREMIUM_QUESTIONS_LIMIT,
} as const;

const ANSWERS_LIMIT = {
  GUEST: 0,
  BASIC: BASIC_ANSWERS_LIMIT,
  PRO: PRO_ANSWERS_LIMIT,
  PREMIUM: PREMIUM_ANSWERS_LIMIT,
} as const;

function isUnlimited(limit: number): boolean {
  return limit === -1;
}

export interface TContentLimitStatus {
  canCreate: boolean;
  currentCount: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
  reasonCode?: string;
}

export interface TContentLimits {
  topics: TContentLimitStatus;
  questions: TContentLimitStatus;
  answers: TContentLimitStatus;
  userGrade: UserGradeType;
}

export async function checkContentLimits(): Promise<TContentLimits> {
  const user = await getCurrentUser();

  if (!user) {
    throw new ContentLimitError('UNAUTHORIZED', 'User not authenticated');
  }

  const { id: userId, grade: userGrade, role } = user;

  // Bypass limits for ADMIN users
  if (role === 'ADMIN') {
    return {
      topics: {
        canCreate: true,
        currentCount: 0,
        limit: -1,
        remaining: -1,
        isUnlimited: true,
      },
      questions: {
        canCreate: true,
        currentCount: 0,
        limit: -1,
        remaining: -1,
        isUnlimited: true,
      },
      answers: {
        canCreate: true,
        currentCount: 0,
        limit: -1,
        remaining: -1,
        isUnlimited: true,
      },
      userGrade,
    };
  }

  // Get current counts
  const [topicsCount, questionsCount, answersCount] = await Promise.all([
    prisma.topic.count({ where: { userId } }),
    prisma.question.count({ where: { topic: { userId } } }),
    prisma.answer.count({ where: { question: { topic: { userId } } } }),
  ]);

  // Check limits - convert userGrade to the correct type for the limits object
  const validUserGrade = user.grade as keyof typeof TOPICS_LIMIT;
  const topicsLimit = TOPICS_LIMIT[validUserGrade];
  const questionsLimit = QUESTIONS_LIMIT[validUserGrade];
  const answersLimit = ANSWERS_LIMIT[validUserGrade];

  const topicsUnlimited = isUnlimited(topicsLimit);
  const questionsUnlimited = isUnlimited(questionsLimit);
  const answersUnlimited = isUnlimited(answersLimit);

  const topics: TContentLimitStatus = {
    canCreate: topicsUnlimited || topicsCount < topicsLimit,
    currentCount: topicsCount,
    limit: topicsUnlimited ? -1 : topicsLimit,
    remaining: topicsUnlimited ? -1 : Math.max(0, topicsLimit - topicsCount),
    isUnlimited: topicsUnlimited,
    reasonCode: !topicsUnlimited && topicsCount >= topicsLimit ? 'TOPICS_LIMIT_REACHED' : undefined,
  };

  const questions: TContentLimitStatus = {
    canCreate: questionsUnlimited || questionsCount < questionsLimit,
    currentCount: questionsCount,
    limit: questionsUnlimited ? -1 : questionsLimit,
    remaining: questionsUnlimited ? -1 : Math.max(0, questionsLimit - questionsCount),
    isUnlimited: questionsUnlimited,
    reasonCode:
      !questionsUnlimited && questionsCount >= questionsLimit
        ? 'QUESTIONS_LIMIT_REACHED'
        : undefined,
  };

  const answers: TContentLimitStatus = {
    canCreate: answersUnlimited || answersCount < answersLimit,
    currentCount: answersCount,
    limit: answersUnlimited ? -1 : answersLimit,
    remaining: answersUnlimited ? -1 : Math.max(0, answersLimit - answersCount),
    isUnlimited: answersUnlimited,
    reasonCode:
      !answersUnlimited && answersCount >= answersLimit ? 'ANSWERS_LIMIT_REACHED' : undefined,
  };

  return {
    topics,
    questions,
    answers,
    userGrade,
  };
}

export async function checkTopicsLimit(): Promise<TContentLimitStatus> {
  const limits = await checkContentLimits();
  return limits.topics;
}

export async function checkQuestionsLimit(): Promise<TContentLimitStatus> {
  const limits = await checkContentLimits();
  return limits.questions;
}

export async function checkAnswersLimit(): Promise<TContentLimitStatus> {
  const limits = await checkContentLimits();
  return limits.answers;
}
