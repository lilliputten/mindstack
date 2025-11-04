import { Topic, User, UserTopicWorkout } from '@prisma/client';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { getErrorText } from '@/lib/helpers';

test('should create relation and remove it if topic removed', async () => {
  const users: User[] = [];
  const topics: Topic[] = [];
  const userTopicWorkouts: UserTopicWorkout[] = [];
  try {
    // Create users...
    const user1: User = await jestPrisma.user.create({
      data: { name: 'User for userAndTopicRelation.test' },
    });
    const userId = user1.id;
    users.push(user1);
    // Create parent records...
    const topic1 = await jestPrisma.topic.create({
      data: { name: 'Test topic 1 for user ' + userId, userId },
    });
    topics.push(topic1);
    // Create a user-topic relation record
    const userTopicWorkout1 = await jestPrisma.userTopicWorkout.create({
      data: {
        userId,
        topicId: topic1.id,
      },
    });
    userTopicWorkouts.push(userTopicWorkout1);
    /* // EXAMPLE: Remove user's topic workout directly
     * const removedUserTopicWorkout = await jestPrisma.userTopicWorkout.delete({
     *   where: {
     *     userId_topicId: {
     *       userId,
     *       topicId,
     *     },
     *   },
     * });
     */
    // Remove topic
    await jestPrisma.topic.delete({
      where: {
        id: topic1.id,
      },
    });
    // Find user's topics again
    const foundUserTopicWorkouts = await jestPrisma.userTopicWorkout.findMany({
      where: { userId },
    });
    // Should find nothing
    expect(foundUserTopicWorkouts.length).toBe(0);
  } catch (error) {
    const nextText = 'Test error';
    const errorMessage = getErrorText(error);
    const nextMessage = [nextText, errorMessage].filter(Boolean).join(': ');
    const nextError = new Error(nextMessage);
    // eslint-disable-next-line no-console
    console.error('[userAndTopicRelation.test]', nextMessage, {
      nextError,
      errorMessage,
      error,
    });
    debugger; // eslint-disable-line no-debugger
    // NOTE: Re-throw the error
    throw nextError;
  } finally {
    // Clean up...
    await jestPrisma.userTopicWorkout.deleteMany({
      where: {
        OR: userTopicWorkouts.map(({ userId, topicId }) => ({
          AND: [{ userId }, { topicId }],
        })),
      },
    });
    await jestPrisma.topic.deleteMany({ where: { id: { in: topics.map(({ id }) => id) } } });
    await jestPrisma.user.deleteMany({ where: { id: { in: users.map(({ id }) => id) } } });
  }
});
