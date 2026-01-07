'use server';

import { z } from 'zod';

import { UserTopicWorkoutSchema } from '@/generated/prisma';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

const createWorkoutSchema = UserTopicWorkoutSchema.omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
});

type CreateWorkoutData = z.infer<typeof createWorkoutSchema>;

export async function createWorkout(data: CreateWorkoutData) {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error('Authentication required');
  }

  const defaults = {
    questionResults: '',
    questionsOrder: '',
    stepIndex: 0,
    started: false,
    finished: false,
    currentRatio: 0,
    currentTime: 0,
    correctAnswers: 0,
    selectedAnswerId: '',
    totalRounds: 0,
    allRatios: '',
    allTimes: '',
    averageRatio: 0,
    averageTime: 0,
  };

  const rawData: CreateWorkoutData = {
    ...defaults,
    ...data,
  };

  const newWorkoutData = createWorkoutSchema.parse(rawData);

  const workout = await prisma.userTopicWorkout.create({
    data: { ...newWorkoutData, userId: user.id },
  });

  return workout;
}
