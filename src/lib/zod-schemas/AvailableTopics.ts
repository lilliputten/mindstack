import { z } from 'zod';

import { TGetResults } from '@/lib/types/api';
import { TopicIncludeParamsSchema } from '@/lib/zod-schemas';
import { TAvailableTopic } from '@/features/topics/types';
import { TopicOrderByWithRelationInputSchema } from '@/generated/prisma';

export const zTopicTopicIds = z.array(z.string()).optional();
export type TTopicTopicIds = z.infer<typeof zTopicTopicIds>;

export const zTopicOrderBy = z
  .union([TopicOrderByWithRelationInputSchema.array(), TopicOrderByWithRelationInputSchema])
  .optional();
export type TTopicOrderBy = z.infer<typeof zTopicOrderBy>;

export const GetAvailableTopicsParamsSchema = TopicIncludeParamsSchema.extend({
  enabled: z.coerce.boolean().optional(),
  /** Skip records (start from the nth record), default = 0 */
  skip: z.coerce.number().int().nonnegative().optional(),
  /** Amount of records to return, default = {itemsLimit} */
  take: z.coerce.number().int().positive().optional(),
  /** Get all users' data not only your own (admins only: will return no data for non-admins) ??? */
  adminMode: z.coerce.boolean().optional(),
  /** Display only current user's topics */
  showOnlyMyTopics: z.coerce.boolean().optional(),
  /** Sort by parameter, default: `{ updatedAt: 'desc' }`, packed json string */
  // orderBy: TopicFindManyArgsSchema.shape.orderBy, // This approach doesn't work
  orderBy: zTopicOrderBy,
  /** Include only listed topic ids */
  topicIds: zTopicTopicIds, // z.array(z.string()).optional(),
  // Search parameters
  /** Search text in name, description, keywords */
  searchText: z.string().optional(),
  /** Get topics with workout history records */
  hasWorkoutStats: z.coerce.boolean().optional(),
  /** Get topics with active workouts */
  hasActiveWorkouts: z.coerce.boolean().optional(),
  /** Get topics with questions */
  hasQuestions: z.coerce.boolean().optional(),
  /** Minimum created date */
  minCreatedAt: z.coerce.date().optional(),
  /** Maximum created date */
  maxCreatedAt: z.coerce.date().optional(),
  /** Minimum updated date */
  minUpdatedAt: z.coerce.date().optional(),
  /** Maximum updated date */
  maxUpdatedAt: z.coerce.date().optional(),
  /** Filter by language code (exact search, use `searchLang` for fuzzy one) */
  langCode: z.string().optional(),
  /** Filter by language name (exact search, use `searchLang` for fuzzy one) */
  langName: z.string().optional(),
  /** Search in both langCode (exact, if 2-letter string) and langName (partial) */
  searchLang: z.string().optional(),
  // See also "include" parameters from `TopicIncludeParamsSchema`...
});

export type TGetAvailableTopicsParams = z.infer<typeof GetAvailableTopicsParamsSchema>;

export type TGetAvailableTopicsResults = TGetResults<TAvailableTopic>;
