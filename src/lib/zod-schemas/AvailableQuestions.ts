import { z } from 'zod';

import { QuestionOrderByWithRelationInputSchema } from '@/generated/prisma';

import { TGetResults } from '@/lib/types/api';
import { QuestionIncludeParamsSchema } from '@/lib/zod-schemas';
import { TAvailableQuestion } from '@/features/questions/types';

export const zQuestionQuestionIds = z.array(z.string()).optional();
export type TQuestionQuestionIds = z.infer<typeof zQuestionQuestionIds>;

export const zQuestionOrderBy = z
  .union([QuestionOrderByWithRelationInputSchema.array(), QuestionOrderByWithRelationInputSchema])
  .optional();
export type TQuestionOrderBy = z.infer<typeof zQuestionOrderBy>;

export const GetAvailableQuestionsParamsSchema = QuestionIncludeParamsSchema.extend({
  /** Get questions for topic */
  topicId: z.coerce.string().optional(),
  /** Skip records (start from the nth record), default = 0 */
  skip: z.coerce.number().int().nonnegative().optional(),
  /** Amount of records to return, default = {questionsLimit} */
  take: z.coerce.number().int().positive().optional(),
  /** Get all users' data not only your own (admins only: will return no data for non-admins) ??? */
  adminMode: z.coerce.boolean().optional(),
  /** Display only current user's questions */
  showOnlyMyQuestions: z.coerce.boolean().optional(),
  /** Sort by parameter, default: `{ updatedAt: 'desc' }`, packed json string */
  // orderBy: QuestionFindManyArgsSchema.shape.orderBy, // This approach doesn't work
  orderBy: zQuestionOrderBy,
  /** Include only listed question ids */
  questionIds: zQuestionQuestionIds, // z.array(z.string()).optional(),
  // See also "include" parameters from `QuestionIncludeParamsSchema`...
});

export type TGetAvailableQuestionsParams = z.infer<typeof GetAvailableQuestionsParamsSchema>;

export type TGetAvailableQuestionsResults = TGetResults<TAvailableQuestion>;
