import z from 'zod';

import { UserTopicWorkout, UserTopicWorkoutSchema } from '@/generated/prisma';

import { ExtendNullWithUndefined, ReplaceNullWithUndefined } from '@/lib/ts';

export type TWorkout = ExtendNullWithUndefined<UserTopicWorkout> & { _count?: { answers: number } };
export type TWorkoutReal = ReplaceNullWithUndefined<UserTopicWorkout>;

export const newWorkoutSchema = UserTopicWorkoutSchema.pick({
  userId: true,
  topicId: true,
});

export const workoutDataSchema = UserTopicWorkoutSchema.omit({
  userId: true,
  topicId: true,
  createdAt: true,
  updatedAt: true,
});

export type TNewWorkout = z.infer<typeof newWorkoutSchema>;
export type TWorkoutData = z.infer<typeof workoutDataSchema>;

// // Test to verify createdAt/updatedAt are excluded
// type TestExclusion = TWorkoutData['createdAt']; // Should error if excluded
// type TestExclusion2 = TWorkoutData['updatedAt']; // Should error if excluded

// export type TNewWorkout = Partial<TWorkoutReal> & Pick<TWorkoutReal, 'userId' | 'topicId'>;
// export type TWorkoutData = Omit<
//   TWorkoutReal,
//   'userId' | 'user' | 'topicId' | 'topic' | 'createdAt' | 'updatedAt'
// >;
