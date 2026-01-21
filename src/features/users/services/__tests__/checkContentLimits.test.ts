import { ContentLimitError } from '@/lib/errors/ContentLimitError';
import { getCurrentUser } from '@/lib/session';

import {
  checkAnswersLimit,
  checkContentLimits,
  checkQuestionsLimit,
  checkTopicsLimit,
} from '../checkContentLimits';

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: {
    topic: {
      count: jest.fn().mockImplementation(() => Promise.resolve(0)),
    },
    question: {
      count: jest.fn().mockImplementation(() => Promise.resolve(0)),
    },
    answer: {
      count: jest.fn().mockImplementation(() => Promise.resolve(0)),
    },
  },
}));
jest.mock('@/lib/session');

// Mock envServer imports
jest.mock('@/config/envServer', () => ({
  BASIC_TOPICS_LIMIT: 5,
  BASIC_QUESTIONS_LIMIT: 20,
  BASIC_ANSWERS_LIMIT: 10,
  PRO_TOPICS_LIMIT: 20,
  PRO_QUESTIONS_LIMIT: 50,
  PRO_ANSWERS_LIMIT: 20,
  PREMIUM_TOPICS_LIMIT: -1,
  PREMIUM_QUESTIONS_LIMIT: -1,
  PREMIUM_ANSWERS_LIMIT: -1,
}));

// Get mocks after they're set up
const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

describe('checkContentLimits', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks - create a minimal valid user object
    mockedGetCurrentUser.mockResolvedValue({
      id: 'user-1',
      grade: 'BASIC',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
      emailVerified: null,
      image: null,
      subscriptionPeriod: null,
      subscriptionStartedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  describe('checkContentLimits', () => {
    it('should throw UNAUTHORIZED error when user is not authenticated', async () => {
      mockedGetCurrentUser.mockResolvedValue(undefined);

      await expect(checkContentLimits()).rejects.toThrow(ContentLimitError);
      await expect(checkContentLimits()).rejects.toHaveProperty('code', 'UNAUTHORIZED');
    });

    it('should return correct limits for BASIC user', async () => {
      const { prisma } = require('@/lib/db');
      prisma.topic.count.mockResolvedValue(3);
      prisma.question.count.mockResolvedValue(15);
      prisma.answer.count.mockResolvedValue(8);

      const limits = await checkContentLimits();

      expect(limits.userGrade).toBe('BASIC');
      expect(limits.topics).toEqual({
        canCreate: true,
        currentCount: 3,
        limit: 5,
        remaining: 2,
        isUnlimited: false,
        reasonCode: undefined,
      });
      expect(limits.questions).toEqual({
        canCreate: true,
        currentCount: 15,
        limit: 20,
        remaining: 5,
        isUnlimited: false,
        reasonCode: undefined,
      });
      expect(limits.answers).toEqual({
        canCreate: true,
        currentCount: 8,
        limit: 10,
        remaining: 2,
        isUnlimited: false,
        reasonCode: undefined,
      });
    });

    it('should detect when BASIC user reaches topics limit', async () => {
      const { prisma } = require('@/lib/db');
      prisma.topic.count.mockResolvedValue(5);
      prisma.question.count.mockResolvedValue(10);
      prisma.answer.count.mockResolvedValue(5);

      const limits = await checkContentLimits();

      expect(limits.topics.canCreate).toBe(false);
      expect(limits.topics.reasonCode).toBe('TOPICS_LIMIT_REACHED');
      expect(limits.questions.canCreate).toBe(true);
      expect(limits.answers.canCreate).toBe(true);
    });

    it('should return unlimited for PREMIUM user', async () => {
      const { prisma } = require('@/lib/db');
      mockedGetCurrentUser.mockResolvedValue({
        id: 'user-premium',
        grade: 'PREMIUM',
        email: 'premium@example.com',
        name: 'Premium User',
        role: 'USER',
        emailVerified: null,
        image: null,
        subscriptionPeriod: null,
        subscriptionStartedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prisma.topic.count.mockResolvedValue(100);
      prisma.question.count.mockResolvedValue(500);
      prisma.answer.count.mockResolvedValue(2000);

      const limits = await checkContentLimits();

      expect(limits.userGrade).toBe('PREMIUM');
      expect(limits.topics.isUnlimited).toBe(true);
      expect(limits.questions.isUnlimited).toBe(true);
      expect(limits.answers.isUnlimited).toBe(true);
      expect(limits.topics.canCreate).toBe(true);
      expect(limits.questions.canCreate).toBe(true);
      expect(limits.answers.canCreate).toBe(true);
    });

    it('should handle zero counts correctly', async () => {
      const { prisma } = require('@/lib/db');
      prisma.topic.count.mockResolvedValue(0);
      prisma.question.count.mockResolvedValue(0);
      prisma.answer.count.mockResolvedValue(0);

      const limits = await checkContentLimits();

      expect(limits.topics.currentCount).toBe(0);
      expect(limits.questions.currentCount).toBe(0);
      expect(limits.answers.currentCount).toBe(0);
      expect(limits.topics.canCreate).toBe(true);
      expect(limits.questions.canCreate).toBe(true);
      expect(limits.answers.canCreate).toBe(true);
    });
  });

  describe('individual limit checkers', () => {
    it('checkTopicsLimit should return only topics status', async () => {
      const { prisma } = require('@/lib/db');
      prisma.topic.count.mockResolvedValue(4);
      prisma.question.count.mockResolvedValue(15);
      prisma.answer.count.mockResolvedValue(8);

      const topicsLimit = await checkTopicsLimit();

      expect(topicsLimit).toEqual({
        canCreate: true,
        currentCount: 4,
        limit: 5,
        remaining: 1,
        isUnlimited: false,
        reasonCode: undefined,
      });
    });

    it('checkQuestionsLimit should return only questions status', async () => {
      const { prisma } = require('@/lib/db');
      prisma.topic.count.mockResolvedValue(3);
      prisma.question.count.mockResolvedValue(19);
      prisma.answer.count.mockResolvedValue(8);

      const questionsLimit = await checkQuestionsLimit();

      expect(questionsLimit).toEqual({
        canCreate: true,
        currentCount: 19,
        limit: 20,
        remaining: 1,
        isUnlimited: false,
        reasonCode: undefined,
      });
    });

    it('checkAnswersLimit should return only answers status', async () => {
      const { prisma } = require('@/lib/db');
      prisma.topic.count.mockResolvedValue(3);
      prisma.question.count.mockResolvedValue(15);
      prisma.answer.count.mockResolvedValue(9);

      const answersLimit = await checkAnswersLimit();

      expect(answersLimit).toEqual({
        canCreate: true,
        currentCount: 9,
        limit: 10,
        remaining: 1,
        isUnlimited: false,
        reasonCode: undefined,
      });
    });
  });
});
