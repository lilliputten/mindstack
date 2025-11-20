'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { TGetAvailableTopicByIdParams } from '@/lib/zod-schemas';
import { isDev } from '@/constants';

import { IncludedUserSelect, IncludedUserTopicWorkoutSelect, TAvailableTopic } from '../types';

interface TOptions {
  noDebug?: boolean;
}

export async function getAvailableTopicById(params: TGetAvailableTopicByIdParams & TOptions) {
  const {
    id,
    // TopicIncludeParamsSchema:
    includeUser = false,
    includeWorkout = false,
    includeQuestionsCount = true,
    includeQuestions = false,
  } = params;
  // Check user rights to delete the question...?
  const user = await getCurrentUser();
  const userId = user?.id;
  // const isAdmin = user?.role === 'ADMIN';
  try {
    if (isDev) {
      // DEBUG: Emulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    const where: Prisma.TopicWhereUniqueInput = {
      id,
      /* // TODO: Restrict isPublic if it isn't an admin user?
       * isPublic: isAdmin ? null : false,
       */
    };
    const include: Prisma.TopicInclude = {
      _count: { select: { questions: includeQuestionsCount } },
    };
    if (includeUser && userId) {
      include.user = { select: IncludedUserSelect };
    }
    if (includeQuestions) {
      include.questions = true;
    }
    if (includeWorkout && userId) {
      include.userTopicWorkout = {
        where: { userId },
        select: IncludedUserTopicWorkoutSelect,
      };
    }
    const topicWithWorkouts = await prisma.topic.findUnique({
      where,
      include,
    });

    if (!topicWithWorkouts) {
      throw new Error('No topic found');
    }
    /* // NOTE: The `userTopicWorkout` field is a list!
     * const { userTopicWorkout, ...rest } = topicWithWorkouts;
     * const topic = {
     *   ...rest,
     *   userTopicWorkout,
     *   // workout: userTopicWorkout?.[0],
     * } satisfies TAvailableTopic;
     */

    const topic = topicWithWorkouts satisfies TAvailableTopic;

    // Check if the current user is allowed to see the topic?
    if (!topic.isPublic && userId !== topic?.userId && user?.role !== 'ADMIN') {
      throw new Error('Current user is not allowed to access the topic');
    }

    return topic;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getAvailableTopicById] catch', {
      error,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
