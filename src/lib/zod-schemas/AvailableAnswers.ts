import { z } from 'zod';

import { AnswerOrderByWithRelationInputSchema } from '@/generated/prisma';

import { TGetResults } from '@/lib/types/api';
import { AnswerIncludeParamsSchema } from '@/lib/zod-schemas';
import { TAvailableAnswer } from '@/features/answers/types';

export const zAnswerAnswerIds = z.array(z.string()).optional();
export type TAnswerAnswerIds = z.infer<typeof zAnswerAnswerIds>;

export const zAnswerOrderBy = z
  .union([AnswerOrderByWithRelationInputSchema.array(), AnswerOrderByWithRelationInputSchema])
  .optional();
export type TAnswerOrderBy = z.infer<typeof zAnswerOrderBy>;

export const GetAvailableAnswersParamsSchema = AnswerIncludeParamsSchema.extend({
  /** Get answers for question */
  questionId: z.coerce.string().optional(),
  /** Skip records (start from the nth record), default = 0 */
  skip: z.coerce.number().int().nonnegative().optional(),
  /** Amount of records to return, default = {itemsLimit} */
  take: z.coerce.number().int().positive().optional(),
  /** Get all users' data not only your own (admins only: will return no data for non-admins) ??? */
  adminMode: z.coerce.boolean().optional(),
  /** Display only current user's answers */
  showOnlyMyAnswers: z.coerce.boolean().optional(),
  /** Sort by parameter, default: `{ updatedAt: 'desc' }`, packed json string */
  // orderBy: AnswerFindManyArgsSchema.shape.orderBy, // This approach doesn't work
  orderBy: zAnswerOrderBy,
  /** Include only listed answer ids */
  answerIds: zAnswerAnswerIds, // z.array(z.string()).optional(),
  // See also "include" parameters from `AnswerIncludeParamsSchema`...
});

export type TGetAvailableAnswersParams = z.infer<typeof GetAvailableAnswersParamsSchema>;

export type TGetAvailableAnswersResults = TGetResults<TAvailableAnswer>;
