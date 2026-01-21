import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';

import { getAvailableQuestions } from '../getAvailableQuestions';

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

type CreatedId =
  | { type: 'user'; id: string }
  | { type: 'topic'; id: string }
  | { type: 'question'; id: string }
  | { type: 'answer'; id: string }
  | { type: 'workout'; userId: string; questionId: string };

const cleanupDb = async (ids: CreatedId[]) => {
  for (const created of ids.reverse()) {
    /* if (created.type === 'workout') {
      await jestPrisma.userQuestionWorkout.deleteMany({
        where: { userId: created.userId, questionId: created.questionId },
      });
    } else */
    if (created.type === 'answer') {
      await jestPrisma.answer.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'question') {
      await jestPrisma.question.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'user') {
      await jestPrisma.user.deleteMany({ where: { id: created.id } });
    }
  }
};

describe('getAvailableQuestions', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it('should return only public questions for an unauthorized user', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-getAvailableQuestions.test-${dateTag}@test.com` },
      });
      createdIds.push({ type: 'user', id: user.id });
      const topic1 = await jestPrisma.topic.create({
        data: { name: 'Public', isPublic: true, userId: user.id },
      });
      const topic2 = await jestPrisma.topic.create({
        data: { name: 'Private', isPublic: false, userId: user.id },
      });
      const topicIds = [topic1, topic2].map(({ id }) => id);
      topicIds.forEach((id) => createdIds.push({ type: 'topic', id }));
      const question1 = await jestPrisma.question.create({
        data: { text: 'Public question', topicId: topic1.id },
      });
      const question2 = await jestPrisma.question.create({
        data: { text: 'Private question', topicId: topic2.id },
      });
      const questionIds = [question1, question2].map(({ id }) => id);
      questionIds.forEach((id) => createdIds.push({ type: 'question', id }));
      mockedGetCurrentUser.mockResolvedValue(undefined);
      const { items, totalCount } = await getAvailableQuestions({ questionIds, noDebug: true });
      expect(items).toHaveLength(1);
      expect(totalCount).toBe(1);
      expect(items[0].id).toBe(question1.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
