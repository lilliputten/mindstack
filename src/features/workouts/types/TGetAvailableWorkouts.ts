import { Category, Topic, UserTopicWorkout, WorkoutStats } from '@prisma/client';
import { z } from 'zod';

type ExtendNullWithUndefined<T> = T extends null ? T | undefined : T;
type ReplaceNullWithUndefined<T> = T extends null ? undefined : T;
type TGetResultsInfiniteQueryData<T> = {
  items: T[];
  totalCount: number;
  hasNextPage: boolean;
};

export type TUserTopicWorkout = ExtendNullWithUndefined<UserTopicWorkout> & {
  topic?: Topic;
  workoutStats?: WorkoutStats[];
  categories?: Category[];
};
export type TUserTopicWorkoutReal = ReplaceNullWithUndefined<TUserTopicWorkout>;

// prettier-ignore
export const GetAvailableWorkoutsParamsSchema = z.object({
  // ID-based filtering
  workoutIds: z.array(z.string()).optional().describe('Filter by specific workout IDs'),
  topicIds: z.array(z.string()).optional().describe('Filter by specific topic IDs'),
  categoryIds: z.array(z.string()).optional().describe('Filter by specific category IDs'),

  // Pagination
  skip: z.coerce.number().int().nonnegative().optional().describe('Number of items to skip (for pagination)'),
  take: z.coerce.number().int().positive().optional().describe('Number of items to take (for pagination)'),

  // Access control
  adminMode: z.boolean().optional().describe('Admin-only mode to see all workouts regardless of ownership'),

  // Sorting
  orderBy: z.union([z.any().array(), z.any()]).optional().describe('Sorting criteria (field + direction)'),

  // Search parameters
  searchText: z.string().optional().describe('Search text to match against topic name, description or keywords'),
  hasWorkoutStats: z.boolean().optional().describe('Filter workouts by whether they have stats recorded'),
  hasActiveWorkouts: z.boolean().optional().describe('Filter workouts by active status (started but not finished)'),

  // Date ranges
  minStarted: z.coerce.date().optional().describe('Earliest workout start date to include'),
  maxStarted: z.coerce.date().optional().describe('Latest workout start date to include'),
  minFinished: z.coerce.date().optional().describe('Earliest workout finish date to include'),
  maxFinished: z.coerce.date().optional().describe('Latest workout finish date to include'),

  // Language parameters
  langCode: z.string().optional().describe('Exact 2-letter language code filter (e.g. "en", "es")'),
  langName: z.string().optional().describe('Exact language name filter (e.g. "English", "Spanish")'),
  searchLang: z.string().optional().describe('Free-form parameter to search by language - matches code exactly for 2-char inputs, or does partial name search for longer inputs'),

  // Include parameters
  includeUser: z.boolean().optional().describe('Whether to include user data with each workout'),
  includeTopic: z.boolean().optional().describe('Whether to include topic data with each workout'),
  includeCategories: z.boolean().optional().describe('Whether to include categories when includeTopic is true'),
  includeStats: z.boolean().optional().describe('Whether to include workout stats with each workout'),
});

export type TGetAvailableWorkoutsParams = z.infer<typeof GetAvailableWorkoutsParamsSchema>;

export type TGetAvailableWorkoutsResults = {
  items: TUserTopicWorkout[];
  totalCount: number;
};

export type TAvailableWorkoutsResultsQueryData = TGetResultsInfiniteQueryData<TUserTopicWorkout>;
