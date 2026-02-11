import z from 'zod';

import { Answer, QuestionSchema } from '@/generated/prisma';

import { ExtendNullWithUndefined, ReplaceNullWithUndefined } from '@/lib/ts';

export type TAnswer = ExtendNullWithUndefined<Answer>;
export type TAnswerReal = ReplaceNullWithUndefined<Answer>;
export type TAnswerData = Omit<TAnswerReal, 'createdAt' | 'updatedAt'>;

export type TAnswerId = TAnswer['id'];

/** Only text and questionId are required fields */
export type TNewAnswer = Partial<Answer> & Pick<Answer, 'text' | 'questionId'>;

/** User fields to include with a flag `iGetAvailableQuestionsParamsSchema.ncludeUser` */
export const IncludedQuestionSelect = {
  id: true as const,
  text: true as const,
  // answersCountRandom: true as const,
  // answersCountMin: true as const,
  // answersCountMax: true as const,
  // createdAt: true as const,
  // updatedAt: true as const,
  topicId: true as const,
};
const _IncludedQuestionSchema = QuestionSchema.pick(IncludedQuestionSelect);
type TIncludedQuestion = z.infer<typeof _IncludedQuestionSchema>;

/** NOTE: It's possible to extend the type in the future */
export interface TAvailableAnswer extends TAnswer {
  question?: TIncludedQuestion;
}
