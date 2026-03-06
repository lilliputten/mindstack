import z from 'zod';

import { Question, QuestionSchema, TopicSchema } from '@/generated/prisma';

import { ExtendNullWithUndefined, ReplaceNullWithUndefined } from '@/lib/ts';
import { TAvailableAnswer } from '@/features/answers/types';

export type TQuestion = ExtendNullWithUndefined<Question> & { _count?: { answers: number } };
export type TQuestionReal = ReplaceNullWithUndefined<Question>;
export type TQuestionData = Omit<TQuestionReal, 'createdAt' | 'updatedAt'>;

export type TQuestionId = TQuestion['id'];

/** User fields to include with a flag `iGetAvailableTopicsParamsSchema.ncludeUser` */
export const IncludedTopicSelect = true;
const _IncludedTopicSchema = TopicSchema; // .pick(IncludedTopicSelect);
type TIncludedTopic = z.infer<typeof _IncludedTopicSchema>;

const newAnswerSchema = z.object({
  text: z.string(),
  isCorrect: z.boolean().optional(),
  explanation: z.string().nullable().optional(),
});
export const newQuestionSchema = QuestionSchema.partial().extend({
  text: QuestionSchema.shape.text,
  topicId: QuestionSchema.shape.topicId,
  answers: newAnswerSchema.array().optional(),
});

export type TNewQuestion = z.infer<typeof newQuestionSchema>;
export type _TNewQuestion = Partial<Question> &
  Pick<Question, 'text' | 'topicId'> & {
    answers?: Array<{
      text: string;
      isCorrect?: boolean;
      explanation?: string | null;
    }>;
  };
export interface TNewOrOldQuestion extends TNewQuestion {
  id: Question['id'];
  isNew?: boolean;
  _count?: { answers: number };
}

/** NOTE: It's possible to extend the type in the future */
export interface TAvailableQuestion extends TQuestion {
  topic?: TIncludedTopic;
  answers?: TAvailableAnswer[];
}
