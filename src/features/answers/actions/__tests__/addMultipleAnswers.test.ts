import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';

import { addMultipleAnswers } from '../addMultipleAnswers';

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

type CreatedId =
  | { type: 'user'; id: string }
  | { type: 'topic'; id: string }
  | { type: 'question'; id: string }
  | { type: 'answer'; id: string };

const cleanupDb = async (ids: CreatedId[]) => {
  for (const created of ids.reverse()) {
    if (created.type === 'answer') {
      await jestPrisma.answer.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'question') {
      await jestPrisma.question.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'topic') {
      await jestPrisma.topic.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'user') {
      await jestPrisma.user.deleteMany({ where: { id: created.id } });
    }
  }
};

describe('addMultipleAnswers', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockedGetCurrentUser.mockReset();
    consoleErrorSpy.mockRestore();
  });

  it('should create multiple answers for topic owner', async () => {
    const dateTag = formatDateTag();
    const testName = 'topicOwner';
    const uniqueId = `${dateTag}-${testName}`;
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-${uniqueId}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const topic = await jestPrisma.topic.create({
        data: { name: `Topic-${uniqueId}`, userId: user.id },
      });
      createdIds.push({ type: 'topic', id: topic.id });

      const question = await jestPrisma.question.create({
        data: { text: `Question-${uniqueId}`, topicId: topic.id },
      });
      createdIds.push({ type: 'question', id: question.id });

      mockedGetCurrentUser.mockResolvedValue(user);

      const newAnswers = [
        { text: `Answer1-${uniqueId}`, questionId: question.id },
        { text: `Answer2-${uniqueId}`, questionId: question.id },
      ];

      const result = await addMultipleAnswers(newAnswers);
      expect(result).toHaveLength(2);
      expect(result[0].text).toBe(`Answer1-${uniqueId}`);
      expect(result[1].text).toBe(`Answer2-${uniqueId}`);

      // Clean up created answers
      for (const answer of result) {
        createdIds.push({ type: 'answer', id: answer.id });
      }
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should create multiple answers for admin user', async () => {
    const dateTag = formatDateTag();
    const testName = 'adminUser';
    const uniqueId = `${dateTag}-${testName}`;
    const createdIds: CreatedId[] = [];
    try {
      const owner = await jestPrisma.user.create({
        data: { email: `owner-${uniqueId}@test.com`, role: 'USER' },
      });
      const admin = await jestPrisma.user.create({
        data: { email: `admin-${uniqueId}@test.com`, role: 'ADMIN' },
      });
      createdIds.push({ type: 'user', id: owner.id });
      createdIds.push({ type: 'user', id: admin.id });

      const topic = await jestPrisma.topic.create({
        data: { name: `Topic-${uniqueId}`, userId: owner.id },
      });
      createdIds.push({ type: 'topic', id: topic.id });

      const question = await jestPrisma.question.create({
        data: { text: `Question-${uniqueId}`, topicId: topic.id },
      });
      createdIds.push({ type: 'question', id: question.id });

      mockedGetCurrentUser.mockResolvedValue(admin as TUser);

      const newAnswers = [
        { text: `Answer1-${uniqueId}`, questionId: question.id },
        { text: `Answer2-${uniqueId}`, questionId: question.id },
      ];

      const result = await addMultipleAnswers(newAnswers);
      expect(result).toHaveLength(2);

      // Clean up created answers
      for (const answer of result) {
        createdIds.push({ type: 'answer', id: answer.id });
      }
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue(undefined);
    await expect(addMultipleAnswers([{ text: 'Answer', questionId: 'question1' }])).rejects.toThrow(
      'Undefined user',
    );
  });

  it('should throw error when no answers provided', async () => {
    const dateTag = formatDateTag();
    const testName = 'noAnswersProvided';
    const uniqueId = `${dateTag}-${testName}`;
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-${uniqueId}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      await expect(addMultipleAnswers([])).rejects.toThrow('No answers provided');
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when answer text is missing', async () => {
    const dateTag = formatDateTag();
    const testName = 'missingAnswerText';
    const uniqueId = `${dateTag}-${testName}`;
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-${uniqueId}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      await expect(addMultipleAnswers([{ text: '', questionId: 'question1' }])).rejects.toThrow(
        'Not specified answer text',
      );
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when questionId is missing', async () => {
    const dateTag = formatDateTag();
    const testName = 'missingQuestionId';
    const uniqueId = `${dateTag}-${testName}`;
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-${uniqueId}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      await expect(addMultipleAnswers([{ text: 'Answer', questionId: '' }])).rejects.toThrow(
        'Not specified answers owner question',
      );
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when question is not found', async () => {
    const dateTag = formatDateTag();
    const testName = 'questionNotFound';
    const uniqueId = `${dateTag}-${testName}`;
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-${uniqueId}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      await expect(
        addMultipleAnswers([{ text: 'Answer', questionId: 'nonexistent' }]),
      ).rejects.toThrow('One or more questions not found');
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authorized', async () => {
    const dateTag = formatDateTag();
    const testName = 'userNotAuthorized';
    const uniqueId = `${dateTag}-${testName}`;
    const createdIds: CreatedId[] = [];
    try {
      const owner = await jestPrisma.user.create({
        data: { email: `owner-${uniqueId}@test.com`, role: 'USER' },
      });
      const otherUser = await jestPrisma.user.create({
        data: { email: `other-${uniqueId}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: owner.id });
      createdIds.push({ type: 'user', id: otherUser.id });

      const topic = await jestPrisma.topic.create({
        data: { name: `Topic-${uniqueId}`, userId: owner.id },
      });
      createdIds.push({ type: 'topic', id: topic.id });

      const question = await jestPrisma.question.create({
        data: { text: `Question-${uniqueId}`, topicId: topic.id },
      });
      createdIds.push({ type: 'question', id: question.id });

      mockedGetCurrentUser.mockResolvedValue(otherUser as TUser);

      await expect(
        addMultipleAnswers([{ text: 'Answer', questionId: question.id }]),
      ).rejects.toThrow('Current user is not allowed to add answers to this question');
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
