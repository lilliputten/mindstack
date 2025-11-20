import z from 'zod';

import { ExtendNullWithUndefined, ReplaceNullWithUndefined } from '@/lib/ts';
import {
  Question,
  Topic,
  // TopicIncludeSchema,
  UserSchema,
  // UserTopicWorkout,
  UserTopicWorkoutSchema,
  // WorkoutStats,
  WorkoutStatsSchema,
} from '@/generated/prisma';

export type TTopic = ExtendNullWithUndefined<Topic> & {
  _count?: { questions: number };
};
export type TTopicReal = ReplaceNullWithUndefined<TTopic>;

export type TTopicId = TTopic['id'];

/** User fields to include with a flag `iGetAvailableTopicsParamsSchema.ncludeUser` */
export const IncludedUserSelect = {
  id: true as const, // z.string().cuid(),
  name: true as const, // z.string().nullable(),
  email: true as const, // z.string().nullable(),
  // emailVerified: true as const, // z.coerce.date().nullable(),
  // image: true as const, // z.string().nullable(),
  // createdAt: true as const, // z.coerce.date(),
  // updatedAt: true as const, // z.coerce.date(),
  // role: true as const, // z.string(),
};
const _IncludedUserSchema = UserSchema.pick(IncludedUserSelect);
export type TIncludedUser = z.infer<typeof _IncludedUserSchema>;

/** UserTopicWorkout fields to include with a flag `GetAvailableTopicsParamsSchema.includeWorkout` */
export const IncludedUserTopicWorkoutSelect = {
  userId: true as const, // z.string(),
  topicId: true as const, // z.string(),
  createdAt: true as const, // z.coerce.date(),
  updatedAt: true as const, // z.coerce.date(),
  startedAt: true as const, // z.coerce.date().nullable(),
  finishedAt: true as const, // z.coerce.date().nullable(),
  // questionsCount: true as const, // z.number().int().nullable(),
  // questionsOrder: true as const, // z.string().nullable(),
  // questionResults: true as const, // z.string().nullable(),
  stepIndex: true as const, // z.number().int().nullable(),
  // selectedAnswerId: true as const, // z.string().nullable(),
  // currentRatio: true as const, // z.number().int().nullable(),
  // currentTime: true as const, // z.number().int().nullable(),
  // correctAnswers: true as const, // z.number().int().nullable(),
  // totalRounds: true as const, // z.number().int(),
  // allRatios: true as const, // z.string(),
  // allTimes: true as const, // z.string(),
  started: true as const, // z.boolean(),
  finished: true as const, // z.boolean(),
};
const _IncludedUserTopicWorkoutSchema = UserTopicWorkoutSchema.pick(IncludedUserTopicWorkoutSelect);
export type TIncludedUserTopicWorkout = z.infer<typeof _IncludedUserTopicWorkoutSchema>;

/** Stats fields to include with a flag `GetAvailableTopicsParamsSchema.includeWorkout` */
export const IncludedStatsSelect = {
  id: true as const, // z.string().cuid(),
  userId: true as const, // z.string(),
  topicId: true as const, // z.string(),
  totalQuestions: true as const, // z.number().int(),
  correctAnswers: true as const, // z.number().int(),
  ratio: true as const, // z.number().int(),
  timeSeconds: true as const, // z.number().int(),
  startedAt: true as const, // z.coerce.date(),
  finishedAt: true as const, // z.coerce.date(),
  createdAt: true as const, // z.coerce.date(),
};
const _IncludedStatsSchema = WorkoutStatsSchema.pick(IncludedStatsSelect);
export type TIncludedStats = z.infer<typeof _IncludedStatsSchema>;

/** Extended topic, includes some user data, see `getAvailableTopics` */
export type TAvailableTopic = TTopic & {
  /** For `includeUser` flag */
  user?: TIncludedUser;
  /** For `includeWorkout` flag */
  userTopicWorkout?: TIncludedUserTopicWorkout[];
  /** For `includeStats` flag */
  workoutStats?: TIncludedStats[];
  /** For `includeQuestions` flag */
  questions?: Question[];
};

/** // XXX: New topic shouldn't contain id (?)
 * export type TTopicWithoutId = Omit<TTopic, 'id'>;
 * export type TTopicWithoutUserId = Omit<TTopic, 'userId'>;
 * export type TTopicWithoutIds = Omit<TTopic, 'id' | 'userId'>;
 */

export type TOptionalTopic = Partial<TTopic>;
export type TNewTopic = Partial<Topic> & Pick<Topic, 'name'>; // TTopicWithoutIds; // { name: TTopic['name']; parentId: TTopic['parentId'] };
